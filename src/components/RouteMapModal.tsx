"use client";

/**
 * RouteMapModal — fullscreen Yandex Maps 3.0 overlay showing the
 * driving route from the user's saved home to the village.
 *
 * Lifecycle:
 *   1. On `open`, load ymaps3 (cached loader) and fetch /api/route.
 *   2. Render a fixed fullscreen portal with the map, a polyline, and
 *      two markers ("Дом" and villageName).
 *   3. Close button unmounts the portal — iframe zemexx below is
 *      untouched and stays as-is.
 *
 * The iframe map on /village/[slug] is NEVER modified; this is a pure
 * overlay. Uses the same storage contract (`zemplus_user_places`) and
 * the same /api/route OSRM proxy as HomeDistanceBadge and
 * InteractivePlotMap3.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Route as RouteIcon, X } from "lucide-react";
import { loadYmaps3 } from "@/lib/ymaps3";
import type * as YMaps3Module from "@yandex/ymaps3-types";
import type { GenericReactify } from "@yandex/ymaps3-types/reactify";

type LngLat = [number, number];

interface Props {
  open: boolean;
  onClose: () => void;
  homeCoords: [number, number]; // [lat, lon]
  homeLabel: string;
  villageCoords: [number, number]; // [lat, lon]
  villageName: string;
}

interface RoutePayload {
  ok: boolean;
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // [lat, lon][]
}

type ReactifiedYmaps3 = {
  YMap: React.ComponentType<Record<string, unknown>>;
  YMapDefaultSchemeLayer: React.ComponentType;
  YMapDefaultFeaturesLayer: React.ComponentType;
  YMapFeature: React.ComponentType<Record<string, unknown>>;
  YMapMarker: React.ComponentType<Record<string, unknown>>;
};

type BundleState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; error: string }
  | { kind: "ready"; components: ReactifiedYmaps3 };

function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  return m === 0 ? `${h}ч` : `${h}ч ${m}м`;
}

export default function RouteMapModal({
  open,
  onClose,
  homeCoords,
  homeLabel,
  villageCoords,
  villageName,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [bundle, setBundle] = useState<BundleState>({ kind: "idle" });
  const [route, setRoute] = useState<{
    geometry: LngLat[];
    distanceKm: number;
    durationMin: number;
    straight: boolean;
  } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const loadStartedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // Load ymaps3 when the modal first opens (cached by loader).
  // Depend ONLY on `open` so setBundle() doesn't retrigger cleanup and
  // cancel the timeout we just scheduled.
  useEffect(() => {
    if (!open) {
      loadStartedRef.current = false;
      return;
    }
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    setBundle({ kind: "loading" });
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      console.error("[RouteMapModal] ymaps3 load timed out after 15s");
      setBundle({
        kind: "blocked",
        error:
          "Карта не загрузилась за 15 секунд. Возможно, расширение или приватный режим блокируют api-maps.yandex.ru. Попробуйте обычное окно браузера.",
      });
    }, 15000);

    loadYmaps3()
      .then(async ({ ymaps3, reactify }) => {
        clearTimeout(timeoutId);
        if (cancelled) return;
        const React = await import("react");
        const ReactDOM = await import("react-dom");
        const bound = (reactify as GenericReactify).bindTo(React, ReactDOM);
        const mod = bound.module(ymaps3 as typeof YMaps3Module) as unknown as ReactifiedYmaps3;
        setBundle({ kind: "ready", components: mod });
      })
      .catch((err: Error) => {
        clearTimeout(timeoutId);
        if (cancelled) return;
        console.error("[RouteMapModal] ymaps3 load failed:", err);
        setBundle({ kind: "blocked", error: err.message });
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [open]);

  // Fetch the road geometry from our OSRM proxy; fall back to a straight
  // line between home and village if the proxy fails.
  useEffect(() => {
    if (!open) return;
    if (route) return;
    let cancelled = false;

    const straightLngLat: LngLat[] = [
      [homeCoords[1], homeCoords[0]],
      [villageCoords[1], villageCoords[0]],
    ];
    const haversineKm = () => {
      const R = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(villageCoords[0] - homeCoords[0]);
      const dLon = toRad(villageCoords[1] - homeCoords[1]);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(homeCoords[0])) *
          Math.cos(toRad(villageCoords[0])) *
          Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };

    (async () => {
      try {
        const res = await fetch(
          `/api/route?from=${homeCoords[0]},${homeCoords[1]}&to=${villageCoords[0]},${villageCoords[1]}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`route ${res.status}`);
        const payload = (await res.json()) as Partial<RoutePayload>;
        if (
          !payload.ok ||
          !payload.geometry ||
          payload.geometry.length < 2 ||
          typeof payload.distanceKm !== "number" ||
          typeof payload.durationMin !== "number"
        ) {
          throw new Error("malformed route payload");
        }
        if (cancelled) return;
        setRoute({
          geometry: payload.geometry.map(([lat, lon]) => [lon, lat]),
          distanceKm: payload.distanceKm,
          durationMin: payload.durationMin,
          straight: false,
        });
      } catch (err) {
        if (cancelled) return;
        console.warn("[RouteMapModal] OSRM failed, using straight line:", err);
        const km = haversineKm() * 1.35;
        setRoute({
          geometry: straightLngLat,
          distanceKm: km,
          durationMin: (km / 55) * 60,
          straight: true,
        });
        setRouteError("Не удалось построить маршрут по дорогам — показана прямая.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, homeCoords, villageCoords, route]);

  // Reset fetched route when modal closes so next open re-fetches fresh.
  useEffect(() => {
    if (!open) {
      setRoute(null);
      setRouteError(null);
    }
  }, [open]);

  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Compute map bounds that fit the whole polyline with some padding.
  let bounds: [LngLat, LngLat] | null = null;
  if (route) {
    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity;
    for (const [lon, lat] of route.geometry) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    bounds = [
      [minLon, minLat],
      [maxLon, maxLat],
    ];
  }

  const content = (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
      {/* Header with route info + close */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-black/60 backdrop-blur-md ring-1 ring-white/10 shadow-lg">
        <div className="flex items-center gap-2 min-w-0 text-white">
          <RouteIcon className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-black truncate">
              {homeLabel} → {villageName}
            </div>
            {route && (
              <div className="text-xs text-white/80 font-bold">
                {formatDuration(route.durationMin)} · {Math.round(route.distanceKm)} км
                {route.straight && " (по прямой)"}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть маршрут"
          className="flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/25 text-white text-xs font-bold transition"
        >
          <X className="w-4 h-4" />
          Закрыть
        </button>
      </div>

      {/* Map body */}
      <div className="flex-1 relative bg-gray-900">
        {bundle.kind === "loading" || !route ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm font-bold">Строю маршрут…</span>
          </div>
        ) : bundle.kind === "blocked" ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/90 px-6 text-center">
            <div>
              <div className="text-base font-black mb-2">Не удалось загрузить карту</div>
              <div className="text-xs text-white/70">{bundle.error}</div>
            </div>
          </div>
        ) : bundle.kind === "ready" && bounds ? (
          <>
            <RouteMapInner
              components={bundle.components}
              bounds={bounds}
              geometry={route.geometry}
              homeLngLat={[homeCoords[1], homeCoords[0]]}
              villageLngLat={[villageCoords[1], villageCoords[0]]}
              homeLabel={homeLabel}
              villageName={villageName}
            />
            {routeError && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-[11px] font-bold shadow-lg">
                {routeError}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function RouteMapInner({
  components,
  bounds,
  geometry,
  homeLngLat,
  villageLngLat,
  homeLabel,
  villageName,
}: {
  components: ReactifiedYmaps3;
  bounds: [LngLat, LngLat];
  geometry: LngLat[];
  homeLngLat: LngLat;
  villageLngLat: LngLat;
  homeLabel: string;
  villageName: string;
}) {
  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapFeature,
    YMapMarker,
  } = components;

  return (
    <YMap
      location={{ bounds, duration: 400 }}
      mode="vector"
      className="w-full h-full"
    >
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />

      <YMapFeature
        geometry={{ type: "LineString", coordinates: geometry }}
        style={{
          stroke: [
            { color: "#10b981", width: 6, opacity: 0.95 },
          ],
        }}
      />

      <YMapMarker coordinates={homeLngLat}>
        <div className="-translate-x-1/2 -translate-y-full pb-1 pointer-events-none">
          <div className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-emerald-500 ring-2 ring-white text-white text-xs font-black shadow-xl whitespace-nowrap">
            🏠 {homeLabel}
          </div>
        </div>
      </YMapMarker>

      <YMapMarker coordinates={villageLngLat}>
        <div className="-translate-x-1/2 -translate-y-full pb-1 pointer-events-none">
          <div className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-white ring-2 ring-emerald-500 text-gray-900 text-xs font-black shadow-xl whitespace-nowrap">
            📍 {villageName}
          </div>
        </div>
      </YMapMarker>
    </YMap>
  );
}
