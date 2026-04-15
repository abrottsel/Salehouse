"use client";

/**
 * InteractivePlotMap3 — Yandex Maps JS API 3.0 version of the village
 * plot map.
 *
 * Phase 1 (done): bootstrap ymaps3, reactify, scheme/satellite layers,
 * plot polygons, numbered markers, click-to-select, custom zoom + map
 * type buttons.
 *
 * Phase 2 (this commit):
 *   - Left sidebar — village title, stats (Всего / Свободно / Бронь /
 *     Продано), selected plot card with "Записаться на просмотр" CTA
 *     and FavoriteHeart, status legend, price tier filter bar.
 *   - "Мои места" panel — saved places in localStorage, form to add a
 *     place manually or via "Определить моё местоположение" (3-stage
 *     GPS → Wi-Fi → server IP fallback), delete / clear, draw route
 *     on click.
 *   - Route rendering via YMapFeature LineString — real road geometry
 *     from /api/route (OSRM proxy), straight-line fallback on failure.
 *     Labeled start/end YMapMarkers ("Дом" / village name). Re-fits
 *     bounds to the full route.
 *   - Route info bar (distance + duration) at the bottom of the map.
 *   - Programmatic location state — panTo on selected plot, setBounds
 *     to village on initial load and on clearRoute.
 *
 * Out of scope for Phase 2 (TODO Phase 3):
 *   - Pulse animation on the selected plot (CSS animated overlay).
 *   - Zoom-adaptive marker sizing (currently fixed per-state size).
 *   - Mobile-specific breakpoint layout (desktop-first right now).
 *   - Safari Private "blocked" fallback card — already handled via the
 *     loader rejection path, just needs a Phase 4 styling pass.
 *
 * Legacy InteractivePlotMap.tsx still powers /village/[slug] until
 * Phase 5 switchover.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Home as HomeIcon,
  Briefcase,
  MapPin,
  Map as MapIcon,
  Layers,
  Navigation,
  Loader2,
  Phone,
  Plus,
  Minus,
  Trash2,
  X,
  LocateFixed,
} from "lucide-react";
import { loadYmaps3 } from "@/lib/ymaps3";
import FavoriteHeart from "./FavoriteHeart";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

// Mirror of the /api/village-map/[uuid] response shape. Coordinates
// from the proxy are still in the legacy Yandex 2.1 [lat, lon] order
// — we convert them to GeoJSON [lon, lat] at render time.
interface NormalizedPlot {
  number: string;
  area: number;
  pricePerHundred: number;
  totalCost: number;
  statusName: string;
  coords: [number, number][];
  center: [number, number];
  kadastr: string;
  priceTier: number;
}

interface NormalizedVillageMap {
  villageId: string;
  villageName: string;
  center: [number, number];
  villageCoords: [number, number][];
  priceTiers: number[];
  statistics: {
    free: number;
    sold: number;
    reserved: number;
    other: number;
  };
  plots: NormalizedPlot[];
}

interface UserPlace {
  id: string;
  label: string;
  address: string;
  coords: [number, number]; // [lat, lon] (legacy order, converted inline)
}

// ─────────────────────────────────────────────────────────────────
// Palette + helpers (match the legacy 2.1 component exactly)
// ─────────────────────────────────────────────────────────────────

const TIER_COLORS = [
  { fill: "#facc15", stroke: "#a16207", dot: "#eab308" }, // yellow
  { fill: "#22c55e", stroke: "#15803d", dot: "#16a34a" }, // green
  { fill: "#22d3ee", stroke: "#0e7490", dot: "#06b6d4" }, // cyan
  { fill: "#f97316", stroke: "#9a3412", dot: "#ea580c" }, // orange
  { fill: "#ef4444", stroke: "#991b1b", dot: "#dc2626" }, // red
];
const RESERVED = { fill: "#93c5fd", stroke: "#2563eb", dot: "#3b82f6" };
const SOLD = { fill: "#d1d5db", stroke: "#9ca3af", dot: "#9ca3af" };
const TECHNICAL = { fill: "#e5e7eb", stroke: "#9ca3af", dot: "#cbd5e1" };

function isPlotAvailable(s: string) {
  return s === "Свободен" || s === "Свободный";
}
function isPlotReserved(s: string) {
  return s === "Бронь" || s === "Забронирован";
}
function isPlotSold(s: string) {
  return s === "Продан" || s === "Продано";
}
function isPlotActive(s: string) {
  return s !== "Технический" && s !== "Обманка";
}

function plotPalette(plot: NormalizedPlot) {
  if (isPlotAvailable(plot.statusName)) {
    return TIER_COLORS[plot.priceTier] || TIER_COLORS[0];
  }
  if (isPlotReserved(plot.statusName)) return RESERVED;
  if (isPlotSold(plot.statusName)) return SOLD;
  return TECHNICAL;
}

function formatRub(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  if (km < 10) return `${km.toFixed(1)} км`;
  return `${Math.round(km)} км`;
}
function formatDuration(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h} ч`;
  return `${h} ч ${rem} мин`;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const sLat = Math.sin(dLat / 2);
  const sLon = Math.sin(dLon / 2);
  const c =
    sLat * sLat +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * sLon * sLon;
  return 2 * R * Math.asin(Math.sqrt(c));
}
function estimateRoadKm(straight: number) {
  return straight * 1.35;
}
function estimateDurationMin(roadKm: number) {
  return Math.round((roadKm / 55) * 60);
}

const PLACES_STORAGE_KEY = "zemplus_user_places";

function loadPlaces(): UserPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PLACES_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (p): p is UserPlace =>
        p &&
        typeof p.id === "string" &&
        typeof p.label === "string" &&
        typeof p.address === "string" &&
        Array.isArray(p.coords) &&
        p.coords.length === 2 &&
        typeof p.coords[0] === "number" &&
        typeof p.coords[1] === "number",
    );
  } catch {
    return [];
  }
}
function savePlaces(places: UserPlace[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
  } catch {
    /* ignore quota errors */
  }
}
function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

// Convert a ring of [lat, lon] points (legacy order) into [lon, lat]
// points as required by ymaps3 / GeoJSON.
function ringLatLonToLonLat(
  ring: [number, number][],
): [number, number][] {
  const out: [number, number][] = new Array(ring.length);
  for (let i = 0; i < ring.length; i++) {
    out[i] = [ring[i][1], ring[i][0]];
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────
// Reactified ymaps3 component shape
// ─────────────────────────────────────────────────────────────────

type LngLat = [number, number];

type ReactifiedYmaps3 = {
  YMap: ComponentType<
    {
      location:
        | { center: LngLat; zoom: number; duration?: number; easing?: string }
        | { bounds: [LngLat, LngLat]; duration?: number; easing?: string };
      mode?: "vector" | "raster";
      showScaleInCopyrights?: boolean;
      theme?: "light" | "dark";
      margin?: [number, number, number, number];
      children?: ReactNode;
    } & Record<string, unknown>
  >;
  YMapDefaultSchemeLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultSatelliteLayer: ComponentType<Record<string, unknown>>;
  YMapDefaultFeaturesLayer: ComponentType<Record<string, unknown>>;
  YMapLayer: ComponentType<Record<string, unknown>>;
  YMapTileDataSource: ComponentType<Record<string, unknown>>;
  YMapFeature: ComponentType<{
    geometry: {
      type: "Polygon" | "LineString" | "Point";
      coordinates: unknown;
    };
    style?: Record<string, unknown>;
    onClick?: (object: unknown, event: unknown) => void;
    onFastClick?: (object: unknown, event: unknown) => void;
    properties?: Record<string, unknown>;
  }>;
  YMapMarker: ComponentType<{
    coordinates: LngLat;
    draggable?: boolean;
    zIndex?: number;
    onClick?: () => void;
    children?: ReactNode;
  }>;
  YMapListener: ComponentType<{
    onUpdate?: (state: { location: { zoom: number } }) => void;
  }>;
};

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

interface Props {
  villageUuid: string;
  villageName: string;
  villageSlug: string;
}

type BundleState =
  | { kind: "loading" }
  | { kind: "blocked"; error: string }
  | { kind: "ready"; components: ReactifiedYmaps3 };

type LocationState =
  | { center: LngLat; zoom: number; duration?: number }
  | { bounds: [LngLat, LngLat]; duration?: number };

export default function InteractivePlotMap3({
  villageUuid,
  villageName,
  villageSlug,
}: Props) {
  // ─── ymaps3 bundle + data ──────────────────────────────────
  const [bundle, setBundle] = useState<BundleState>({ kind: "loading" });
  const [data, setData] = useState<NormalizedVillageMap | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // ─── Map state ─────────────────────────────────────────────
  const [location, setLocation] = useState<LocationState | null>(null);
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [zoom, setZoom] = useState(17);

  // ─── Plot selection & filter ───────────────────────────────
  const [selectedPlot, setSelectedPlot] = useState<NormalizedPlot | null>(
    null,
  );
  const [enabledTiers, setEnabledTiers] = useState<Set<number>>(new Set());
  const initialSelectDone = useRef(false);

  // ─── "Мои места" panel state ───────────────────────────────
  const [places, setPlaces] = useState<UserPlace[]>([]);
  const [showPlacesPanel, setShowPlacesPanel] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const [newPlaceLabel, setNewPlaceLabel] = useState("Дом");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<LngLat[] | null>(null);
  const [routeStart, setRouteStart] = useState<LngLat | null>(null);
  const [routeEnd, setRouteEnd] = useState<LngLat | null>(null);
  const [routeStartLabel, setRouteStartLabel] = useState<string>("Дом");

  // ─── Boot ymaps3 bundle once ───────────────────────────────
  useEffect(() => {
    let cancelled = false;
    loadYmaps3()
      .then(async ({ ymaps3, reactify }) => {
        if (cancelled) return;
        const React = await import("react");
        const ReactDOM = await import("react-dom");
        const bound = reactify.bindTo(React, ReactDOM);
        const mod = bound.module(ymaps3) as unknown as ReactifiedYmaps3;
        setBundle({ kind: "ready", components: mod });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[ymaps3] load failed:", err);
        setBundle({ kind: "blocked", error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Fetch village data ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/village-map/${villageUuid}`)
      .then((res) => {
        if (!res.ok) throw new Error(`village-map ${res.status}`);
        return res.json() as Promise<NormalizedVillageMap>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[ymaps3] village fetch failed:", err);
        setDataError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [villageUuid]);

  // ─── Load saved places from localStorage ───────────────────
  useEffect(() => {
    setPlaces(loadPlaces());
  }, []);

  // ─── Initial centring ─────────────────────────────────────
  // Center on the computed village midpoint at a fixed zoom of 17
  // rather than fitting to villageCoords bounds. The bounds-fit
  // approach leaves huge empty forest around the village on wide
  // monitors (2560 px+) because the container aspect ratio is much
  // wider than the village polygon's, and the fit pads generously.
  // A fixed center + zoom 17 gives the same tight plot-picking view
  // on laptops, desktops, and ultra-wides.
  useEffect(() => {
    if (initialSelectDone.current) return;
    if (bundle.kind !== "ready" || !data || data.villageCoords.length === 0) {
      return;
    }
    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity;
    for (const [lat, lon] of data.villageCoords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    setLocation({ center: [centerLon, centerLat], zoom: 17 });

    // Auto-select median-priced available plot
    const avail = data.plots
      .filter((p) => isPlotAvailable(p.statusName))
      .sort((a, b) => a.pricePerHundred - b.pricePerHundred);
    const featured =
      avail[Math.floor(avail.length / 2)] || avail[0] || data.plots[0];
    if (featured) setSelectedPlot(featured);

    initialSelectDone.current = true;
  }, [bundle, data]);

  // ─── Pan to selected plot when it changes ──────────────────
  useEffect(() => {
    if (!selectedPlot) return;
    if (!initialSelectDone.current) return;
    // Don't hijack the view when a route is active
    if (activeRouteId) return;
    setLocation({
      center: [selectedPlot.center[1], selectedPlot.center[0]],
      zoom: Math.max(zoom, 17),
      duration: 400,
    });
    // We intentionally don't depend on zoom to avoid camera jitter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlot, activeRouteId]);

  // ─── Filter visible plots by enabledTiers ──────────────────
  const visiblePlots = useMemo(() => {
    if (!data) return [];
    return data.plots.filter((p) => {
      if (!isPlotActive(p.statusName)) return true;
      if (enabledTiers.size > 0 && !enabledTiers.has(p.priceTier)) return false;
      return true;
    });
  }, [data, enabledTiers]);

  const toggleTier = useCallback((i: number) => {
    setEnabledTiers((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  // ─── Route drawing ─────────────────────────────────────────
  const drawRoute = useCallback(
    async (place: UserPlace) => {
      if (!data) return;
      const fromLatLon = place.coords;
      const toLatLon = data.center;

      // GeoJSON [lon, lat] copies for map rendering
      const startLngLat: LngLat = [fromLatLon[1], fromLatLon[0]];
      const endLngLat: LngLat = [toLatLon[1], toLatLon[0]];

      setRouteStart(startLngLat);
      setRouteEnd(endLngLat);
      setRouteStartLabel(place.label || "Дом");
      setActiveRouteId(place.id);

      // Try the real road route first, fall back to a straight line if
      // OSRM is unreachable. Both paths call setRouteGeometry + fit
      // bounds to the full path.
      const fitRoute = (geom: LngLat[], km: number, min: number) => {
        setRouteGeometry(geom);
        setRouteInfo({
          distance: formatDistance(km),
          duration: formatDuration(min),
        });

        let minLat = Infinity,
          maxLat = -Infinity,
          minLon = Infinity,
          maxLon = -Infinity;
        for (const [lon, lat] of geom) {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
        }
        setLocation({
          bounds: [
            [minLon, minLat],
            [maxLon, maxLat],
          ],
          duration: 500,
        });
      };

      try {
        const res = await fetch(
          `/api/route?from=${fromLatLon[0]},${fromLatLon[1]}&to=${toLatLon[0]},${toLatLon[1]}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`route ${res.status}`);
        const payload = (await res.json()) as {
          ok?: boolean;
          distanceKm?: number;
          durationMin?: number;
          geometry?: [number, number][]; // [lat, lon][] from our proxy
        };
        if (
          !payload.ok ||
          !payload.geometry ||
          payload.geometry.length < 2 ||
          typeof payload.distanceKm !== "number" ||
          typeof payload.durationMin !== "number"
        ) {
          throw new Error("malformed route payload");
        }
        const geomLngLat: LngLat[] = payload.geometry.map(
          ([lat, lon]) => [lon, lat],
        );
        fitRoute(geomLngLat, payload.distanceKm, payload.durationMin);
      } catch (e) {
        console.warn("[route] OSRM failed, falling back to straight line:", e);
        const straight = haversineKm(fromLatLon, toLatLon);
        const roadKm = estimateRoadKm(straight);
        const duration = estimateDurationMin(roadKm);
        fitRoute([startLngLat, endLngLat], roadKm, duration);
      }

      // Close the places panel on mobile so the map is visible
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setShowPlacesPanel(false);
        setAddingPlace(false);
      }
    },
    [data],
  );

  const clearRoute = useCallback(() => {
    setRouteGeometry(null);
    setRouteStart(null);
    setRouteEnd(null);
    setActiveRouteId(null);
    setRouteInfo(null);

    // Re-centre on the village midpoint at a tight zoom level —
    // matches the initial load view for a consistent "back to plots"
    // experience regardless of screen size.
    if (data?.villageCoords?.length) {
      let minLat = Infinity,
        maxLat = -Infinity,
        minLon = Infinity,
        maxLon = -Infinity;
      for (const [lat, lon] of data.villageCoords) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
      }
      const centerLat = (minLat + maxLat) / 2;
      const centerLon = (minLon + maxLon) / 2;
      setLocation({
        center: [centerLon, centerLat],
        zoom: 17,
        duration: 400,
      });
    }
  }, [data]);

  // ─── Place management ──────────────────────────────────────
  const persistPlace = useCallback(
    (place: UserPlace) => {
      const next = [...places, place];
      setPlaces(next);
      savePlaces(next);
      setNewPlaceAddress("");
      setNewPlaceLabel("Дом");
      setAddingPlace(false);
      setGeocodeError("");
      drawRoute(place);
    },
    [places, drawRoute],
  );

  const removePlace = useCallback(
    (id: string) => {
      const next = places.filter((p) => p.id !== id);
      setPlaces(next);
      savePlaces(next);
      if (activeRouteId === id) clearRoute();
    },
    [places, activeRouteId, clearRoute],
  );

  const clearAllPlaces = useCallback(() => {
    setPlaces([]);
    savePlaces([]);
    clearRoute();
  }, [clearRoute]);

  const addPlace = useCallback(
    async (label: string, address: string) => {
      const trimmed = address.trim();
      if (trimmed.length < 3) {
        setGeocodeError("Введите адрес");
        return;
      }
      setGeocodeError("");
      setGeocodeLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`,
        );
        if (!res.ok) throw new Error(`geocode ${res.status}`);
        const data = (await res.json()) as {
          lat?: number;
          lon?: number;
          address?: string;
        };
        if (typeof data.lat !== "number" || typeof data.lon !== "number") {
          throw new Error("нет координат в ответе");
        }
        persistPlace({
          id: makeId(),
          label: label || "Моё место",
          address: data.address || trimmed,
          coords: [data.lat, data.lon],
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[geocode] failed:", msg);
        setGeocodeError("Не удалось найти адрес, попробуйте уточнить");
      } finally {
        setGeocodeLoading(false);
      }
    },
    [persistPlace],
  );

  // Geolocation — 3-stage (GPS → Wi-Fi → server IP lookup)
  const detectLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeocodeError("Браузер не поддерживает геолокацию");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGeocodeError("Геолокация работает только на HTTPS");
      return;
    }
    setGeocodeError("");
    setGeocodeLoading(true);

    const commitFix = async (
      coordsArr: [number, number],
      source: "gps" | "wifi" | "ip",
      labelOverride?: string,
    ) => {
      let fullAddress = `${coordsArr[0].toFixed(4)}, ${coordsArr[1].toFixed(4)}`;
      if (labelOverride) {
        fullAddress = labelOverride;
      } else {
        try {
          const res = await fetch(
            `/api/geocode?lat=${coordsArr[0]}&lon=${coordsArr[1]}`,
          );
          if (res.ok) {
            const data = (await res.json()) as { address?: string };
            if (data.address) fullAddress = data.address;
          }
        } catch {
          /* non-fatal */
        }
      }
      persistPlace({
        id: makeId(),
        label:
          newPlaceLabel ||
          (source === "ip" ? "Моё место (по IP)" : "Моё место"),
        address: fullAddress,
        coords: coordsArr,
      });
    };

    const tryIpLookup = async () => {
      try {
        const res = await fetch("/api/my-ip-location", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          lat?: number;
          lon?: number;
          address?: string;
          error?: string;
        };
        if (
          !data.ok ||
          typeof data.lat !== "number" ||
          typeof data.lon !== "number"
        ) {
          throw new Error(data.error || "ip lookup failed");
        }
        await commitFix(
          [data.lat, data.lon],
          "ip",
          data.address || `${data.lat.toFixed(3)}, ${data.lon.toFixed(3)}`,
        );
      } catch (e) {
        console.error("[geolocation] ip fallback failed:", e);
        setGeocodeError(
          "Не удалось определить местоположение. Введите адрес вручную",
        );
      } finally {
        setGeocodeLoading(false);
      }
    };

    const onSuccess = async (
      pos: GeolocationPosition,
      source: "gps" | "wifi",
    ) => {
      try {
        await commitFix(
          [pos.coords.latitude, pos.coords.longitude],
          source,
        );
      } finally {
        setGeocodeLoading(false);
      }
    };

    const onError = (err: GeolocationPositionError, stage: "hi" | "lo") => {
      console.warn(`[geolocation] ${stage} error ${err.code}: ${err.message}`);
      if (err.code === err.PERMISSION_DENIED) {
        setGeocodeLoading(false);
        setGeocodeError(
          "Нет разрешения на геолокацию. Кликните 🔒 в адресной строке → Разрешить",
        );
        return;
      }
      if (stage === "hi") {
        navigator.geolocation.getCurrentPosition(
          (p) => onSuccess(p, "wifi"),
          (e2) => onError(e2, "lo"),
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
        );
      } else {
        tryIpLookup();
      }
    };

    navigator.geolocation.getCurrentPosition(
      (p) => onSuccess(p, "gps"),
      (err) => onError(err, "hi"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [newPlaceLabel, persistPlace]);

  // Close panel — also clears active route so we land back on the plot view
  const handlePlacesButtonClick = useCallback(() => {
    if (showPlacesPanel || activeRouteId) {
      clearRoute();
      setShowPlacesPanel(false);
      setAddingPlace(false);
    } else {
      setShowPlacesPanel(true);
    }
  }, [showPlacesPanel, activeRouteId, clearRoute]);

  // ─── Zoom buttons ──────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const next = Math.min(19, z + 1);
      // Also update location so the map actually zooms — needed because
      // the YMapListener only reads zoom, not sets it.
      if (location && "center" in location) {
        setLocation({ center: location.center, zoom: next, duration: 200 });
      }
      return next;
    });
  }, [location]);
  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(5, z - 1);
      if (location && "center" in location) {
        setLocation({ center: location.center, zoom: next, duration: 200 });
      }
      return next;
    });
  }, [location]);

  // ─── Status of selected plot (for FavoriteHeart + CTA gate) ──
  const isSoldSelected = selectedPlot
    ? isPlotSold(selectedPlot.statusName)
    : false;

  // ─── Render ────────────────────────────────────────────────
  if (bundle.kind === "blocked") {
    return (
      <section className="relative w-full h-[70vh] bg-stone-100 rounded-2xl flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-base font-black text-gray-900">
            Карта участков недоступна
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Браузер заблокировал загрузку Yandex Maps 3.0 — скорее всего вы
            в приватном режиме Safari или в браузере с блокировщиком трекеров.
            Откройте эту страницу в обычном окне Chrome/Safari.
          </p>
          <p className="text-[10px] text-gray-400 font-mono">{bundle.error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 text-white text-xs font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            Попробовать ещё раз
          </button>
        </div>
      </section>
    );
  }

  if (bundle.kind === "loading" || !data || !location) {
    return (
      <section className="relative w-full h-[70vh] bg-stone-100 rounded-2xl flex items-center justify-center">
        <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {dataError ? `Ошибка: ${dataError}` : "Загрузка карты…"}
        </div>
      </section>
    );
  }

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultSatelliteLayer,
    YMapDefaultFeaturesLayer,
    YMapFeature,
    YMapMarker,
    YMapListener,
  } = bundle.components;

  return (
    <section className="relative w-full h-[calc(100vh-96px)] min-h-[640px] bg-stone-200 rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)]">
      {/* ───── Left sidebar ───── */}
      <aside className="hidden lg:flex absolute top-0 left-0 bottom-0 w-[288px] xl:w-[360px] 2xl:w-[420px] bg-white/98 backdrop-blur-md z-20 border-r border-gray-100 flex-col">
        {/* Header — title + stats + prominent call button right below */}
        <div className="px-4 xl:px-5 pt-4 xl:pt-5 pb-3 xl:pb-4 border-b border-gray-100">
          <div className="text-[9px] xl:text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
            Карта участков · v3
          </div>
          <div className="text-xl xl:text-2xl 2xl:text-3xl font-black text-gray-900 leading-tight">
            {villageName}
          </div>
          <div className="mt-2 xl:mt-3 grid grid-cols-4 gap-2">
            <div>
              <div className="text-[8px] xl:text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                Всего
              </div>
              <div className="text-base xl:text-lg 2xl:text-xl font-black text-gray-900 leading-none mt-0.5">
                {data.plots.length}
              </div>
            </div>
            <div>
              <div className="text-[8px] xl:text-[9px] uppercase font-bold text-green-600 tracking-wider">
                Свободно
              </div>
              <div className="text-base xl:text-lg 2xl:text-xl font-black text-green-600 leading-none mt-0.5">
                {data.statistics.free}
              </div>
            </div>
            <div>
              <div className="text-[8px] xl:text-[9px] uppercase font-bold text-blue-600 tracking-wider">
                Бронь
              </div>
              <div className="text-base xl:text-lg 2xl:text-xl font-black text-blue-600 leading-none mt-0.5">
                {data.statistics.reserved}
              </div>
            </div>
            <div>
              <div className="text-[8px] xl:text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                Продано
              </div>
              <div className="text-base xl:text-lg 2xl:text-xl font-black text-gray-500 leading-none mt-0.5">
                {data.statistics.sold}
              </div>
            </div>
          </div>

          {/* Phone call — right under the stats, prominent.
              User feedback: "трубку позвонить можно чуть выше" —
              moved out of the sticky footer so it's immediately visible
              without needing to scroll past the price filters. */}
          <a
            href="tel:+79859052555"
            className="mt-3 xl:mt-4 flex items-center justify-center gap-1.5 w-full h-9 xl:h-10 2xl:h-11 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 ring-1 ring-emerald-200/70 text-green-700 font-black text-[11px] xl:text-[13px] 2xl:text-sm hover:from-green-100 hover:to-emerald-100 transition-all"
          >
            <Phone className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
            +7 (985) 905-25-55
          </a>
        </div>

        {/* Selected plot card */}
        <div className="px-4 xl:px-5 pt-3 xl:pt-4 pb-3 xl:pb-4 border-b border-gray-100">
          {selectedPlot ? (
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 ring-1 ring-emerald-200/60 p-3 xl:p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[9px] xl:text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                    Участок
                  </div>
                  <div className="text-xl xl:text-2xl 2xl:text-3xl font-black text-gray-900 leading-none mt-0.5">
                    № {selectedPlot.number}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center px-2 h-5 xl:h-6 rounded-full text-[9px] xl:text-[10px] font-black ${
                      isPlotAvailable(selectedPlot.statusName)
                        ? "bg-green-100 text-green-800"
                        : isPlotReserved(selectedPlot.statusName)
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedPlot.statusName}
                  </span>
                  <FavoriteHeart
                    kind="plot"
                    plot={{
                      villageSlug,
                      villageName,
                      plotNumber: selectedPlot.number,
                      area: selectedPlot.area,
                      pricePerHundred: selectedPlot.pricePerHundred,
                      totalCost: selectedPlot.totalCost,
                      status: selectedPlot.statusName,
                    }}
                    variant="light"
                    className="!w-7 !h-7"
                  />
                </div>
              </div>
              <div className="mt-2 xl:mt-3 space-y-0.5 xl:space-y-1 text-[11px] xl:text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Площадь</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    {selectedPlot.area} сот
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">За сотку</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    {formatRub(selectedPlot.pricePerHundred)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 xl:pt-2 border-t border-emerald-200/60 mt-1 xl:mt-2">
                  <span className="text-gray-500">Итого</span>
                  <span className="font-black text-green-700 text-sm xl:text-base 2xl:text-lg tabular-nums">
                    {formatRub(selectedPlot.totalCost)}
                  </span>
                </div>
              </div>
              {!isSoldSelected && (
                <div className="mt-2.5 xl:mt-3 grid grid-cols-1 gap-1.5">
                  <a
                    href="#contact-form"
                    className="block w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white py-2 xl:py-2.5 2xl:py-3 rounded-lg font-bold text-[11px] xl:text-[13px] 2xl:text-sm text-center shadow-md shadow-green-800/25 transition-all"
                  >
                    Забронировать
                  </a>
                  <a
                    href="#contact-form"
                    className="block w-full bg-white ring-1 ring-emerald-200 text-emerald-700 hover:bg-emerald-50 py-2 xl:py-2.5 2xl:py-3 rounded-lg font-bold text-[11px] xl:text-[13px] 2xl:text-sm text-center transition-colors"
                  >
                    Записаться на просмотр
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11px] xl:text-[13px] text-gray-400 text-center py-3">
              Кликните на участок на карте
            </div>
          )}
        </div>

        {/* Status legend */}
        <div className="px-4 xl:px-5 pt-3 xl:pt-4 pb-3 xl:pb-4 border-b border-gray-100">
          <h3 className="text-[9px] xl:text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2">
            Статус
          </h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 xl:gap-y-2">
            <LegendDot color="#22c55e" label="Свободен" />
            <LegendDot color="#3b82f6" label="Забронирован" />
            <LegendDot color="#9ca3af" label="Продан" muted />
            <LegendDot color="#22c55e" label="Выбран" pulsing />
          </div>
        </div>

        {/* Price tier filters */}
        {data.priceTiers.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 xl:px-5 pt-3 xl:pt-4 pb-3 xl:pb-4">
            <h3 className="text-[9px] xl:text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-2">
              Цена за сотку
            </h3>
            <div className="space-y-1.5 xl:space-y-2">
              {TIER_COLORS.slice(0, data.priceTiers.length).map((tier, i) => {
                const min = data.priceTiers[i];
                const max =
                  i + 1 < data.priceTiers.length
                    ? data.priceTiers[i + 1] - 1
                    : null;
                const on = enabledTiers.has(i);
                const label = max
                  ? `от ${min.toLocaleString("ru-RU")} ₽ до ${max.toLocaleString("ru-RU")} ₽`
                  : `от ${min.toLocaleString("ru-RU")} ₽`;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleTier(i)}
                    className="flex items-center gap-2 w-full text-left group"
                  >
                    <span
                      className={`w-3 h-3 xl:w-3.5 xl:h-3.5 rounded-full shrink-0 ring-2 shadow-sm transition-all ${
                        on || enabledTiers.size === 0
                          ? "ring-white"
                          : "ring-gray-200 opacity-40 grayscale"
                      }`}
                      style={{ backgroundColor: tier.dot }}
                    />
                    <span
                      className={`text-[10px] xl:text-[12px] font-semibold tabular-nums transition-colors ${
                        on || enabledTiers.size === 0
                          ? "text-gray-800 group-hover:text-gray-900"
                          : "text-gray-400 line-through"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </aside>

      {/* ───── Map column ───── */}
      <div className="absolute inset-0 lg:left-[288px] xl:left-[340px] 2xl:left-[380px]">
        <YMap location={location}>
          {/* Base layer — scheme OR satellite, mutually exclusive.
              YMapDefaultSatelliteLayer ships with ymaps3 core, so no
              extra ymaps3.import() is needed — it's just another named
              export from the main imperative module. */}
          {mapType === "satellite" ? (
            <YMapDefaultSatelliteLayer />
          ) : (
            <YMapDefaultSchemeLayer theme="light" />
          )}
          <YMapDefaultFeaturesLayer />

          {/* Village boundary — same green outline as the legacy 2.1
              component. No fill, just a thick emerald stroke so you
              can see the plot perimeter against the basemap. */}
          {data.villageCoords.length >= 3 && (
            <YMapFeature
              key="village-border"
              geometry={{
                type: "Polygon",
                coordinates: [ringLatLonToLonLat(data.villageCoords)],
              }}
              style={{
                fill: "#16a34a",
                fillOpacity: 0.04,
                stroke: [
                  { color: "#16a34a", width: 3, opacity: 0.85 },
                ],
              }}
            />
          )}

          {/* Plot polygons */}
          {visiblePlots.map((plot) => {
            if (!plot.coords || plot.coords.length < 3) return null;
            const palette = plotPalette(plot);
            const isSelected = selectedPlot?.number === plot.number;
            const ring = ringLatLonToLonLat(plot.coords);
            return (
              <YMapFeature
                key={`poly-${plot.number}`}
                geometry={{ type: "Polygon", coordinates: [ring] }}
                style={{
                  fill: palette.fill,
                  fillOpacity: isSelected
                    ? 0.88
                    : isPlotAvailable(plot.statusName)
                      ? 0.7
                      : 0.55,
                  stroke: [
                    {
                      color: isSelected ? "#16a34a" : palette.stroke,
                      width: isSelected ? 4 : 1.5,
                      opacity: 0.95,
                    },
                  ],
                }}
                onClick={() => setSelectedPlot(plot)}
              />
            );
          })}

          {/* Plot number markers.
              Wrap the visible dot in a 0×0 anchor div so YMapMarker
              pins the wrapper at the coordinate and the inner dot
              floats on top of it via absolute + translate(-50%,-50%).
              Without the 0×0 pattern the dot's top-left ends up at
              the coordinate and every marker drifts down-and-right
              off its plot centre — this was the exact "участки поехали"
              issue from the legacy component. */}
          {visiblePlots.map((plot) => {
            if (!isPlotActive(plot.statusName)) return null;
            const palette = plotPalette(plot);
            const isSelected = selectedPlot?.number === plot.number;
            const coord: LngLat = [plot.center[1], plot.center[0]];
            const size = isSelected ? 26 : 20;
            return (
              <YMapMarker
                key={`mark-${plot.number}`}
                coordinates={coord}
                draggable={false}
                zIndex={isSelected ? 1000 : isPlotAvailable(plot.statusName) ? 200 : 100}
                onClick={() => setSelectedPlot(plot)}
              >
                <div style={{ position: "relative", width: 0, height: 0 }}>
                  <div
                    className="flex items-center justify-center rounded-full cursor-pointer select-none shadow-[0_0_0_1.5px_#fff,0_2px_4px_rgba(0,0,0,0.35)]"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: size,
                      height: size,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      fontSize: isSelected ? 10 : 9,
                      fontWeight: 800,
                      color: "#fff",
                      background: isSelected ? "#22c55e" : palette.fill,
                      fontFamily:
                        "var(--font-inter), system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {plot.number}
                  </div>
                </div>
              </YMapMarker>
            );
          })}

          {/* Route polyline */}
          {routeGeometry && routeGeometry.length >= 2 && (
            <YMapFeature
              key="route-line"
              geometry={{ type: "LineString", coordinates: routeGeometry }}
              style={{
                stroke: [
                  { color: "#2563eb", width: 6, opacity: 0.9 },
                ],
              }}
            />
          )}

          {/* Route endpoints — labeled pills that sit above their
              coordinate via the same 0×0 anchor pattern as the plot
              markers. The pill's bottom edge lands on the point. */}
          {routeStart && (
            <YMapMarker
              key="route-start"
              coordinates={routeStart}
              draggable={false}
              zIndex={2000}
            >
              <div style={{ position: "relative", width: 0, height: 0 }}>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black shadow-[0_0_0_2px_#fff,0_2px_6px_rgba(0,0,0,0.35)] whitespace-nowrap"
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 4,
                    transform: "translate(-50%, 0)",
                  }}
                >
                  <HomeIcon className="w-3 h-3" strokeWidth={3} />
                  {routeStartLabel}
                </div>
              </div>
            </YMapMarker>
          )}
          {routeEnd && (
            <YMapMarker
              key="route-end"
              coordinates={routeEnd}
              draggable={false}
              zIndex={2000}
            >
              <div style={{ position: "relative", width: 0, height: 0 }}>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-[0_0_0_2px_#fff,0_2px_6px_rgba(0,0,0,0.35)] whitespace-nowrap"
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 4,
                    transform: "translate(-50%, 0)",
                  }}
                >
                  <MapPin className="w-3 h-3" strokeWidth={3} />
                  {villageName}
                </div>
              </div>
            </YMapMarker>
          )}

          <YMapListener
            onUpdate={(state) => {
              if (typeof state?.location?.zoom === "number") {
                setZoom(state.location.zoom);
              }
            }}
          />
        </YMap>

        {/* Top-left "Мои места" button + panel */}
        <div className="absolute top-3 left-3 z-30">
          <button
            type="button"
            onClick={handlePlacesButtonClick}
            className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold shadow-xl ring-1 ring-black/5 transition-all ${
              showPlacesPanel || activeRouteId
                ? "bg-gradient-to-r from-green-700 to-emerald-700 text-white"
                : "bg-white/95 backdrop-blur-md text-gray-800 hover:bg-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Мои места
            {places.length > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
                  showPlacesPanel || activeRouteId
                    ? "bg-white text-green-800"
                    : "bg-green-600 text-white"
                }`}
              >
                {places.length}
              </span>
            )}
          </button>

          {showPlacesPanel && (
            <div className="mt-2 w-[min(86vw,340px)] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900">Мои места</h3>
                {places.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllPlaces}
                    className="text-[10px] font-semibold text-red-500 hover:text-red-700"
                  >
                    Очистить всё
                  </button>
                )}
              </div>

              {/* Saved places */}
              {places.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto">
                  {places.map((p) => {
                    const active = activeRouteId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
                          active ? "bg-emerald-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            active ? clearRoute() : drawRoute(p)
                          }
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        >
                          <div
                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              active
                                ? "bg-emerald-600 text-white"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {p.label.toLowerCase().includes("работ") ? (
                              <Briefcase className="w-4 h-4" />
                            ) : (
                              <HomeIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-black text-gray-900 truncate">
                              {p.label}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {p.address}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => removePlace(p.id)}
                          className="shrink-0 w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          aria-label="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add form */}
              {addingPlace ? (
                <div className="px-3 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-1">
                    {(["Дом", "Работа", "Дача"] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewPlaceLabel(preset)}
                        className={`px-2 h-6 rounded-full text-[10px] font-bold transition-colors ${
                          newPlaceLabel === preset
                            ? "bg-emerald-700 text-white"
                            : "bg-white ring-1 ring-gray-200 text-gray-700 hover:ring-gray-300"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geocodeLoading}
                    className="w-full h-9 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 ring-1 ring-blue-200 text-blue-800 text-[11px] font-bold hover:from-blue-100 hover:to-indigo-100 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 transition-all"
                  >
                    {geocodeLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                    Определить моё местоположение
                  </button>

                  <div className="relative text-center">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
                    <span className="relative bg-gray-50 px-2 text-[9px] uppercase text-gray-400 tracking-wider">
                      или
                    </span>
                  </div>

                  <input
                    type="text"
                    value={newPlaceAddress}
                    onChange={(e) => setNewPlaceAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addPlace(newPlaceLabel, newPlaceAddress);
                      }
                    }}
                    placeholder="Адрес, например «Москва, Тверская 1»"
                    className="w-full h-9 px-3 rounded-xl bg-white ring-1 ring-gray-200 text-[11px] placeholder:text-gray-400 focus:ring-emerald-400 focus:outline-none"
                  />

                  {geocodeError && (
                    <div className="text-[10px] text-red-500 font-semibold leading-snug">
                      {geocodeError}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addPlace(newPlaceLabel, newPlaceAddress)}
                      disabled={geocodeLoading || !newPlaceAddress.trim()}
                      className="flex-1 h-9 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 text-white text-[11px] font-bold disabled:opacity-50 inline-flex items-center justify-center gap-1.5 transition-colors hover:from-green-600 hover:to-emerald-600"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Проложить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingPlace(false);
                        setGeocodeError("");
                        setNewPlaceAddress("");
                      }}
                      className="h-9 px-3 rounded-xl bg-white ring-1 ring-gray-200 text-gray-700 text-[11px] font-bold hover:ring-gray-300"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingPlace(true)}
                  className="w-full h-10 border-t border-dashed border-gray-300 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить место
                </button>
              )}

              {places.length === 0 && !addingPlace && (
                <div className="px-4 pb-3 pt-1 text-[10px] text-gray-400 text-center">
                  Добавьте важные точки — увидите расстояние от посёлка.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top-right stack: map-type toggle + zoom controls.
            Moving everything to the top-right cleanly avoids the
            global "Подберу участок" FAB that the page layout places
            at bottom-right. One vertical stack, one location.

            Map-type toggle is a single icon-only button whose icon
            is the TARGET state: on scheme it shows the satellite
            Layers icon (tap → satellite); on satellite it shows the
            scheme Map icon (tap → scheme). Default = scheme. */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              setMapType((m) => (m === "map" ? "satellite" : "map"))
            }
            className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-white/95 backdrop-blur-md text-emerald-700 hover:bg-white shadow-xl ring-1 ring-black/5 transition-all flex items-center justify-center active:scale-95"
            aria-label={mapType === "map" ? "Переключить на Спутник" : "Переключить на Схему"}
            title={mapType === "map" ? "Спутник" : "Схема"}
          >
            {mapType === "map" ? (
              <Layers className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={2.4} />
            ) : (
              <MapIcon className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={2.4} />
            )}
          </button>
          <div className="flex flex-col bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-10 h-10 xl:w-11 xl:h-11 flex items-center justify-center hover:bg-gray-50 text-emerald-700 active:scale-95 transition-all"
              aria-label="Приблизить"
            >
              <Plus className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={2.5} />
            </button>
            <div className="h-px bg-gray-100 mx-1.5" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-10 h-10 xl:w-11 xl:h-11 flex items-center justify-center hover:bg-gray-50 text-emerald-700 active:scale-95 transition-all"
              aria-label="Отдалить"
            >
              <Minus className="w-4 h-4 xl:w-5 xl:h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Route info bar */}
        {routeInfo && activeRouteId && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-white rounded-full shadow-2xl ring-1 ring-black/5 pl-3 pr-1.5 py-1.5 flex items-center gap-2 max-w-[min(94vw,460px)]">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <HomeIcon className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-xs font-bold text-gray-900 truncate">
                {places.find((p) => p.id === activeRouteId)?.label}
              </span>
              <span className="text-gray-400 text-xs">→</span>
              <span className="text-xs font-semibold text-gray-700 truncate">
                {villageName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-gray-200">
              <span className="text-xs font-black text-green-700 tabular-nums whitespace-nowrap">
                {routeInfo.distance}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                · {routeInfo.duration}
              </span>
            </div>
            <button
              type="button"
              onClick={clearRoute}
              className="shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Скрыть маршрут"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Mobile: selected plot sheet (lg hidden) — full-width card
            with price, area, status, FavoriteHeart and the Записаться
            CTA so the mobile experience is first-class. */}
        {selectedPlot && (
          <div className="lg:hidden absolute bottom-3 left-3 right-3 z-20 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">
                    Участок № {selectedPlot.number}
                  </div>
                  <span
                    className={`inline-flex items-center px-1.5 h-4 rounded-full text-[8px] font-black ${
                      isPlotAvailable(selectedPlot.statusName)
                        ? "bg-green-100 text-green-800"
                        : isPlotReserved(selectedPlot.statusName)
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedPlot.statusName}
                  </span>
                </div>
                <div className="text-sm font-black text-gray-900 truncate mt-0.5">
                  {selectedPlot.area} сот · {formatRub(selectedPlot.totalCost)}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {formatRub(selectedPlot.pricePerHundred)} / сот
                </div>
              </div>
              <FavoriteHeart
                kind="plot"
                plot={{
                  villageSlug,
                  villageName,
                  plotNumber: selectedPlot.number,
                  area: selectedPlot.area,
                  pricePerHundred: selectedPlot.pricePerHundred,
                  totalCost: selectedPlot.totalCost,
                  status: selectedPlot.statusName,
                }}
                variant="light"
                className="!w-8 !h-8 shrink-0"
              />
            </div>
            {!isSoldSelected && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <a
                  href="#contact-form"
                  className="flex items-center justify-center gap-1 h-9 rounded-lg bg-gradient-to-r from-green-700 to-emerald-700 text-white text-[11px] font-bold shadow-md shadow-green-800/25"
                >
                  Забронировать
                </a>
                <a
                  href="#contact-form"
                  className="flex items-center justify-center gap-1 h-9 rounded-lg bg-white ring-1 ring-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-50 transition-colors"
                >
                  Записаться
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function LegendDot({
  color,
  label,
  muted = false,
  pulsing = false,
}: {
  color: string;
  label: string;
  muted?: boolean;
  pulsing?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{
          background: color,
          boxShadow: pulsing
            ? "0 0 0 1.5px #fff, 0 0 0 3px rgba(34,197,94,0.35)"
            : "0 0 0 1.5px #fff, 0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
      <span
        className={`text-[10px] font-semibold ${
          muted ? "text-gray-500" : "text-gray-800"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
