"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Navigation,
  Loader2,
  Plus,
  Minus,
  Map as MapIcon,
  Layers,
  Phone,
  X,
  MapPin,
  Home as HomeIcon,
  Briefcase,
  Trash2,
  Loader,
  LocateFixed,
} from "lucide-react";
import FavoriteHeart from "./FavoriteHeart";

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

interface Props {
  villageUuid: string;
  villageName: string;
  villageSlug: string;
}

interface UserPlace {
  id: string;
  label: string;
  address: string;
  coords: [number, number];
}

const PLACES_STORAGE_KEY = "zemplus_user_places";

function loadPlaces(): UserPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLACES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        Array.isArray(p.coords) &&
        p.coords.length === 2
    );
  } catch {
    return [];
  }
}

function savePlaces(places: UserPlace[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
  } catch {}
}

/* ─── Palette matching map.zemexx.ru reference ─── */
/* 5 price tiers: yellow → green → cyan → orange → red */
const TIER_COLORS = [
  { fill: "#facc15", stroke: "#a16207", dot: "#eab308", label: "Эконом" },   // yellow
  { fill: "#22c55e", stroke: "#15803d", dot: "#16a34a", label: "Стандарт" }, // green
  { fill: "#22d3ee", stroke: "#0e7490", dot: "#06b6d4", label: "Комфорт" },  // cyan
  { fill: "#f97316", stroke: "#9a3412", dot: "#ea580c", label: "Бизнес" },   // orange
  { fill: "#ef4444", stroke: "#991b1b", dot: "#dc2626", label: "Премиум" },  // red
];
const RESERVED_COLOR = { fill: "#93c5fd", stroke: "#2563eb", dot: "#3b82f6" };
const SOLD_COLOR = { fill: "#d1d5db", stroke: "#9ca3af", dot: "#9ca3af" };
const TECHNICAL_COLOR = { fill: "#e5e7eb", stroke: "#9ca3af", dot: "#9ca3af" };

function isPlotAvailable(status: string): boolean {
  return status === "Свободен" || status === "Свободный";
}
function isPlotReserved(status: string): boolean {
  return status === "Бронь" || status === "Забронирован";
}
function isPlotSold(status: string): boolean {
  return status === "Продан" || status === "Продано";
}
function isPlotActive(status: string): boolean {
  return status !== "Технический" && status !== "Обманка";
}

function formatRub(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

/* Haversine distance in kilometers between two [lat, lon] points */
function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    sinLat * sinLat +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.sqrt(c));
}

/* Rough road distance ≈ straight × 1.35 */
function estimateRoadKm(straightKm: number): number {
  return straightKm * 1.35;
}

/* Rough travel time at ~55 km/h average */
function estimateDurationMin(roadKm: number): number {
  return Math.round((roadKm / 55) * 60);
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  if (km < 10) return `${km.toFixed(1)} км`;
  return `${Math.round(km)} км`;
}

function formatDuration(min: number): string {
  // Always round to whole minutes — OSRM returns seconds, we convert to
  // minutes as a float, and the route info bar must not show a raw
  // 51.78333333333333 mess to the user.
  const m = Math.round(min);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h} ч`;
  return `${h} ч ${rem} мин`;
}

type MapType = "map" | "satellite" | "hybrid";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ymaps?: any;
  }
}

export default function InteractivePlotMap({
  villageUuid,
  villageName,
  villageSlug,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const plotObjectsRef = useRef<any[]>([]);
  const markerObjectsRef = useRef<Map<string, any>>(new Map());
  const multiRouteRef = useRef<any>(null);
  const initialSelectDone = useRef(false);

  const [data, setData] = useState<NormalizedVillageMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<NormalizedPlot | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapBlocked, setMapBlocked] = useState(false);
  const [enabledTiers, setEnabledTiers] = useState<Set<number>>(new Set());
  const [mapType, setMapType] = useState<MapType>("map");
  const [currentZoom, setCurrentZoom] = useState(17);

  // User places (home/work) — stored in localStorage, show route to village
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

  // Load places from localStorage on mount
  useEffect(() => {
    setPlaces(loadPlaces());
  }, []);

  // Fetch plot data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    initialSelectDone.current = false;
    fetch(`/api/village-map/${villageUuid}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NormalizedVillageMap>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setEnabledTiers(
          new Set(Array.from({ length: json.priceTiers.length }, (_, i) => i))
        );
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Не удалось загрузить карту");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [villageUuid]);

  // Load Yandex Maps API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.ymaps && window.ymaps.Map) {
      setMapReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-ymaps-loader="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setMapReady(true));
      existing.addEventListener("error", () => setMapBlocked(true));
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=package.full";
    script.async = true;
    script.dataset.ymapsLoader = "true";
    // Safari Private Browsing blocks *.yandex.ru as "trackers" and the
    // script never loads. Detect both onerror and a 12-second silence as
    // the map being blocked, and surface a clear fallback message.
    const blockTimeout = window.setTimeout(() => {
      if (!window.ymaps) setMapBlocked(true);
    }, 12000);
    script.onload = () => {
      window.clearTimeout(blockTimeout);
      window.ymaps?.ready(() => setMapReady(true));
    };
    script.onerror = () => {
      window.clearTimeout(blockTimeout);
      setMapBlocked(true);
    };
    document.head.appendChild(script);
    return () => {
      window.clearTimeout(blockTimeout);
    };
  }, []);

  // Filter plots based on enabled tiers
  const visiblePlots = useMemo(() => {
    if (!data) return [];
    return data.plots.filter((p) => {
      if (!isPlotActive(p.statusName)) return true;
      if (enabledTiers.size > 0 && !enabledTiers.has(p.priceTier)) return false;
      return true;
    });
  }, [data, enabledTiers]);

  // Draw route line from a place to the village center.
  //
  // Strategy:
  //   1. Fetch a real driving route from /api/route (OSRM proxy). The
  //      returned geometry is a list of [lat, lon] points following
  //      actual roads, so the drawn polyline looks like the blue line
  //      on ai-zem.com / Yandex Navigator rather than a straight-edge
  //      dashed line.
  //   2. On any failure (OSRM unreachable, no route, timeout), fall
  //      back to a straight [from, to] polyline with a haversine-based
  //      distance estimate so the feature still works end-to-end.
  //
  // In both cases the markers at either end are labeled stretchy pins
  // ("Дом" / village name) so the user always knows which end is which.
  const drawRoute = useCallback(
    (place: UserPlace) => {
      const map = mapInstanceRef.current;
      const ymaps = window.ymaps;
      if (!map || !data || !ymaps) return;

      // Remove previous route
      if (multiRouteRef.current) {
        try {
          const prev = multiRouteRef.current;
          if (Array.isArray(prev)) {
            prev.forEach((o: any) => map.geoObjects.remove(o));
          } else {
            map.geoObjects.remove(prev);
          }
        } catch {}
        multiRouteRef.current = null;
      }

      const from = place.coords;
      const to = data.center;
      // Keep a stable reference for the draw closure — place may be
      // mutated elsewhere.
      const label = place.label || "Дом";

      const addMarkersAndFit = (
        geometry: [number, number][],
        distanceKm: number,
        durationMin: number,
      ) => {
        const polyline = new ymaps.Polyline(
          geometry,
          {},
          {
            strokeColor: "#2563eb",
            strokeWidth: 6,
            strokeOpacity: 0.9,
            // Solid line looks more like a real route; dashed was a
            // workaround for the straight-line fallback.
          },
        );

        const startMark = new ymaps.Placemark(
          from,
          { iconContent: label },
          {
            preset: "islands#blueStretchyIcon",
            iconColor: "#2563eb",
            zIndex: 900,
          },
        );
        const endMark = new ymaps.Placemark(
          to,
          { iconContent: villageName },
          {
            preset: "islands#greenStretchyIcon",
            iconColor: "#16a34a",
            zIndex: 900,
          },
        );

        map.geoObjects.add(polyline);
        map.geoObjects.add(startMark);
        map.geoObjects.add(endMark);
        multiRouteRef.current = [polyline, startMark, endMark];

        // Fit bounds over the entire route geometry so both the
        // winding road and both markers are visible at once. The
        // zoomMargin is asymmetric to compensate for UI overlays that
        // sit on top of the map and eat into the usable area —
        // especially on mobile where the Мои места panel, the stats
        // chip, and the selected-plot card cover ~40% of the viewport.
        //
        // Yandex setBounds accepts zoomMargin as [top, right, bottom, left]
        // in pixels.
        try {
          let minLat = Infinity;
          let maxLat = -Infinity;
          let minLon = Infinity;
          let maxLon = -Infinity;
          for (const [lat, lon] of geometry) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
          }
          // Detect coarse viewport size from the map container so the
          // margins scale with the device. On a desktop the overlays
          // are narrower relative to the canvas; on a phone they are
          // giant, so we need much larger insets.
          const mapEl = mapRef.current;
          const w = mapEl?.clientWidth ?? 800;
          const h = mapEl?.clientHeight ?? 600;
          const isMobile = w < 640;
          const zoomMargin = isMobile
            ? [180, 30, 160, 20] // top Мои места + stats, bottom plot card
            : [60, 60, 60, 60];
          map.setBounds(
            [
              [minLat, minLon],
              [maxLat, maxLon],
            ],
            { checkZoomRange: true, zoomMargin },
          );
          // Sanity: avoid squashing bounds to invisibility when the
          // overlays are larger than the canvas itself.
          void h;
        } catch {}

        setRouteInfo({
          distance: formatDistance(distanceKm),
          duration: formatDuration(durationMin),
        });
        setActiveRouteId(place.id);
        // Close the Мои места panel on mobile once the route is drawn
        // so the user can actually see it — the panel otherwise covers
        // the top half of the screen.
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setShowPlacesPanel(false);
          setAddingPlace(false);
        }
      };

      // Kick off the real routing request. If it fails, fall through to
      // the straight-line fallback so the feature still works when
      // OSRM is unreachable.
      (async () => {
        try {
          const res = await fetch(
            `/api/route?from=${from[0]},${from[1]}&to=${to[0]},${to[1]}`,
            { cache: "no-store" },
          );
          if (!res.ok) throw new Error(`route ${res.status}`);
          const payload = (await res.json()) as {
            ok?: boolean;
            distanceKm?: number;
            durationMin?: number;
            geometry?: [number, number][];
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
          addMarkersAndFit(
            payload.geometry,
            payload.distanceKm,
            payload.durationMin,
          );
        } catch (e) {
          console.warn("[route] OSRM failed, falling back to straight line:", e);
          const straight = haversineKm(from, to);
          const roadKm = estimateRoadKm(straight);
          const duration = estimateDurationMin(roadKm);
          addMarkersAndFit([from, to], roadKm, duration);
        }
      })();
    },
    [data, villageName]
  );

  // Clear route (also re-fits the village bounds so the user always
  // ends back at the plot-picking view; otherwise clearing the panel
  // mid-route leaves the map zoomed way out with just a blue line).
  const clearRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (multiRouteRef.current && map) {
      try {
        const prev = multiRouteRef.current;
        if (Array.isArray(prev)) {
          prev.forEach((o: any) => map.geoObjects.remove(o));
        } else {
          map.geoObjects.remove(prev);
        }
      } catch {}
      multiRouteRef.current = null;
    }
    setActiveRouteId(null);
    setRouteInfo(null);
    // Re-fit to village bounds
    if (map && data?.villageCoords?.length) {
      try {
        const bounds = data.villageCoords.reduce(
          (acc, [lat, lon]) => {
            acc.minLat = Math.min(acc.minLat, lat);
            acc.maxLat = Math.max(acc.maxLat, lat);
            acc.minLon = Math.min(acc.minLon, lon);
            acc.maxLon = Math.max(acc.maxLon, lon);
            return acc;
          },
          { minLat: Infinity, maxLat: -Infinity, minLon: Infinity, maxLon: -Infinity },
        );
        map.setBounds(
          [
            [bounds.minLat, bounds.minLon],
            [bounds.maxLat, bounds.maxLon],
          ],
          { checkZoomRange: true, zoomMargin: 30 },
        );
      } catch {}
    }
  }, [data]);

  // Helper — persist a new place and activate route
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
    [places, drawRoute]
  );

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  // Add new place via text address → our /api/geocode proxy (Nominatim)
  const addPlace = useCallback(
    async (label: string, address: string) => {
      const trimmed = address.trim();
      const labelTrimmed = label.trim() || "Место";
      if (trimmed.length < 3) {
        setGeocodeError("Введите адрес (минимум 3 символа)");
        return;
      }
      setGeocodeError("");
      setGeocodeLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`
        );
        if (res.status === 404) {
          setGeocodeError(
            `«${trimmed}» не найден. Попробуйте точнее: «Москва, Тверская, 1»`
          );
          return;
        }
        if (!res.ok) {
          setGeocodeError(
            `Ошибка поиска (код ${res.status}). Попробуйте ещё раз`
          );
          return;
        }
        const data = (await res.json()) as {
          lat: number;
          lon: number;
          address: string;
        };
        persistPlace({
          id: makeId(),
          label: labelTrimmed,
          address: data.address || trimmed,
          coords: [data.lat, data.lon],
        });
      } catch (e) {
        console.error("geocode err:", e);
        setGeocodeError("Ошибка сети. Проверьте подключение");
      } finally {
        setGeocodeLoading(false);
      }
    },
    [persistPlace]
  );

  // Detect user location with a 3-stage strategy for reliability in RU:
  //   1. navigator.geolocation, enableHighAccuracy:true (10s) — GPS fix,
  //      works on mobile with location services enabled.
  //   2. navigator.geolocation, enableHighAccuracy:false (20s) — browser
  //      Wi-Fi/cell tower triangulation. Usually fails inside Russia
  //      because the provider (Google Geolocation API) is blocked at
  //      the network level on most connections.
  //   3. Server-side IP lookup via /api/my-ip-location. Our Moscow box
  //      hits ip-api.com (unblocked in RU) and returns approximate
  //      city/district coordinates. City-level accuracy is fine for a
  //      "Дом → Посёлок" distance estimate, and the user can still
  //      refine the address manually. Yandex's own ymaps.geolocation.get
  //      is intentionally NOT used here: in JS API 2.1 it requires a
  //      paid API key and silently fails without one.
  // PERMISSION_DENIED short-circuits stages 2/3 with a clear message
  // about how to unblock the site permission.
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
      accuracy?: number,
      labelOverride?: string,
    ) => {
      // eslint-disable-next-line no-console
      console.info(`[geolocation] fix from ${source}:`, {
        lat: coordsArr[0],
        lon: coordsArr[1],
        accuracy,
      });

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
          } else {
            console.warn("[geolocation] reverse geocode HTTP", res.status);
          }
        } catch (e) {
          console.warn("[geolocation] reverse geocode failed:", e);
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

    // Server-side IP lookup via our Moscow proxy. Always works inside
    // Russia because ip-api.com is unblocked and the request leaves
    // from our server, not from the client device.
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
        if (!data.ok || typeof data.lat !== "number" || typeof data.lon !== "number") {
          throw new Error(data.error || "ip lookup failed");
        }
        await commitFix(
          [data.lat, data.lon],
          "ip",
          undefined,
          data.address || `${data.lat.toFixed(3)}, ${data.lon.toFixed(3)}`,
        );
      } catch (e) {
        console.error("[geolocation] ip fallback failed:", e);
        setGeocodeError(
          "Не удалось определить местоположение. Введите адрес вручную — например «Москва, Тверская 1»",
        );
      } finally {
        setGeocodeLoading(false);
      }
    };

    const onSuccess = async (pos: GeolocationPosition, source: "gps" | "wifi") => {
      try {
        await commitFix(
          [pos.coords.latitude, pos.coords.longitude],
          source,
          pos.coords.accuracy,
        );
      } catch (e) {
        console.error("[geolocation] success handler threw:", e);
        setGeocodeError(
          `Ошибка обработки координат: ${e instanceof Error ? e.message : "unknown"}`,
        );
      } finally {
        setGeocodeLoading(false);
      }
    };

    const onError = (err: GeolocationPositionError, stage: "hi" | "lo") => {
      console.warn(`[geolocation] ${stage} error code=${err.code}: ${err.message}`);

      if (err.code === err.PERMISSION_DENIED) {
        setGeocodeLoading(false);
        setGeocodeError(
          "Нет разрешения на геолокацию. Кликните на 🔒 в адресной строке → Геолокация → Разрешить",
        );
        return;
      }

      // POSITION_UNAVAILABLE / TIMEOUT: try next stage
      if (stage === "hi") {
        navigator.geolocation.getCurrentPosition(
          (pos) => onSuccess(pos, "wifi"),
          (err2) => onError(err2, "lo"),
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
        );
      } else {
        // Both native stages failed → server-side IP lookup.
        tryIpLookup();
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess(pos, "gps"),
      (err) => onError(err, "hi"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [newPlaceLabel, persistPlace]);

  const removePlace = useCallback(
    (id: string) => {
      const next = places.filter((p) => p.id !== id);
      setPlaces(next);
      savePlaces(next);
      if (activeRouteId === id) clearRoute();
    },
    [places, activeRouteId, clearRoute]
  );

  const clearAllPlaces = useCallback(() => {
    setPlaces([]);
    savePlaces([]);
    clearRoute();
  }, [clearRoute]);

  // Render plots
  useEffect(() => {
    if (!mapReady || !data || !mapRef.current || !window.ymaps) return;
    const ymaps = window.ymaps;

    // Init map once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new ymaps.Map(
        mapRef.current,
        {
          center: data.center,
          zoom: 17,
          controls: [],
        },
        { suppressMapOpenBlock: true }
      );
      // Allow zooming out far enough to see a full home→village route
      // (can be 50–100 km, would not fit at zoom 14). Plot-picking view
      // is still fit to village bounds on init via setBounds.
      mapInstanceRef.current.options.set("minZoom", 5);
      mapInstanceRef.current.options.set("maxZoom", 19);
      mapInstanceRef.current.setType(
        mapType === "satellite"
          ? "yandex#satellite"
          : mapType === "hybrid"
            ? "yandex#hybrid"
            : "yandex#map"
      );
      // Track zoom changes for marker scaling
      mapInstanceRef.current.events.add("boundschange", () => {
        const z = Math.round(mapInstanceRef.current.getZoom());
        setCurrentZoom(z);
      });
      setCurrentZoom(17);
    }

    const map = mapInstanceRef.current;
    map.setType(
      mapType === "satellite"
        ? "yandex#satellite"
        : mapType === "hybrid"
          ? "yandex#hybrid"
          : "yandex#map"
    );

    // Clear
    plotObjectsRef.current.forEach((o) => map.geoObjects.remove(o));
    plotObjectsRef.current = [];
    markerObjectsRef.current.clear();

    // Village border — thick bright green
    if (data.villageCoords.length > 0) {
      const border = new ymaps.Polygon(
        [data.villageCoords],
        {},
        {
          fillColor: "#10b98100",
          strokeColor: "#22c55e",
          strokeWidth: 4,
          strokeStyle: "solid",
        }
      );
      map.geoObjects.add(border);
      plotObjectsRef.current.push(border);
    }

    // Marker template — small round dot with number.
    //
    // Anchor trick: wrap the visible dot in a 0×0 positioning div so
    // Yandex Maps places the wrapper exactly at the plot center. The
    // inner .zp-dot is absolutely positioned with transform:translate(-50%,-50%)
    // so it renders centered on the point regardless of its own size
    // (dots grow/shrink across zoom levels). Without this wrapper the
    // dot's top-left would sit at the point and all markers would drift
    // down-and-right from their intended plot centers.
    const DotLayout = ymaps.templateLayoutFactory.createClass(
      [
        '<div class="zp-dot-wrap">',
        '<div class="zp-dot zp-dot-$[properties.zpStatus] zp-tier-$[properties.zpTier]">',
        '<span class="zp-dot-num">$[properties.zpNumber]</span>',
        "</div>",
        "</div>",
      ].join("")
    );

    // Render polygons for ALL plots. Styling mirrors map.zemexx.ru:
    //   available → tier color (yellow/green/cyan/orange/red)
    //   reserved  → light blue
    //   sold      → light gray
    //   technical → neutral gray (even fainter)
    // All polygons are fully visible (no 0.25 ghost opacity) so the
    // map reads at a glance regardless of status mix.
    visiblePlots.forEach((plot) => {
      if (!plot.coords || plot.coords.length < 3) return;

      const available = isPlotAvailable(plot.statusName);
      const reserved = isPlotReserved(plot.statusName);
      const sold = isPlotSold(plot.statusName);
      const technical = !isPlotActive(plot.statusName);

      let palette: { fill: string; stroke: string };
      let opacity = 0.65;
      if (available) {
        const tier = TIER_COLORS[plot.priceTier] || TIER_COLORS[0];
        palette = { fill: tier.fill, stroke: tier.stroke };
        opacity = 0.7;
      } else if (reserved) {
        palette = { fill: RESERVED_COLOR.fill, stroke: RESERVED_COLOR.stroke };
        opacity = 0.6;
      } else if (sold) {
        palette = { fill: SOLD_COLOR.fill, stroke: SOLD_COLOR.stroke };
        opacity = 0.55;
      } else {
        // technical / obmanka
        palette = { fill: TECHNICAL_COLOR.fill, stroke: TECHNICAL_COLOR.stroke };
        opacity = 0.35;
      }
      // Mark `technical` used for the conditional path even though the
      // value lives in `palette` already — keeps the intent readable
      // when someone greps for the branch later.
      void technical;

      const isSelected = selectedPlot?.number === plot.number;

      const polygon = new ymaps.Polygon(
        [plot.coords],
        {
          hintContent: `№ ${plot.number} · ${plot.area} сот · ${formatRub(
            plot.totalCost
          )}`,
        },
        {
          fillColor: palette.fill,
          fillOpacity: isSelected ? 0.88 : opacity,
          strokeColor: isSelected ? "#16a34a" : palette.stroke,
          strokeWidth: isSelected ? 4 : 1.5,
          strokeOpacity: 0.95,
          cursor: "pointer",
        }
      );

      polygon.events.add("click", () => setSelectedPlot(plot));
      polygon.events.add("mouseenter", () => {
        if (isSelected) return;
        polygon.options.set("strokeWidth", 2.5);
        polygon.options.set("fillOpacity", Math.min(opacity + 0.2, 0.92));
      });
      polygon.events.add("mouseleave", () => {
        if (isSelected) return;
        polygon.options.set("strokeWidth", 1.5);
        polygon.options.set("fillOpacity", opacity);
      });

      map.geoObjects.add(polygon);
      plotObjectsRef.current.push(polygon);
    });

    // Numbered dots — one per plot, all statuses including sold/reserved.
    visiblePlots.forEach((plot) => {
      const available = isPlotAvailable(plot.statusName);
      const reserved = isPlotReserved(plot.statusName);
      const sold = isPlotSold(plot.statusName);
      const technical = !isPlotActive(plot.statusName);

      const status = available
        ? "free"
        : reserved
          ? "reserved"
          : sold
            ? "sold"
            : technical
              ? "technical"
              : "reserved";
      const isSelected = selectedPlot?.number === plot.number;

      const placemark = new ymaps.Placemark(
        plot.center,
        {
          zpNumber: plot.number,
          zpStatus: isSelected ? "selected" : status,
          zpTier: status === "free" ? String(plot.priceTier ?? 0) : "na",
          hintContent: `№ ${plot.number}`,
        },
        {
          iconLayout: DotLayout,
          iconShape: {
            type: "Circle",
            coordinates: [0, 0],
            radius: 11,
          },
          zIndex: isSelected ? 1000 : isPlotAvailable(plot.statusName) ? 200 : 100,
        }
      );
      placemark.events.add("click", () => setSelectedPlot(plot));
      map.geoObjects.add(placemark);
      plotObjectsRef.current.push(placemark);
      markerObjectsRef.current.set(plot.number, placemark);
    });

    // Fit bounds initial
    if (!initialSelectDone.current && data.villageCoords.length > 0) {
      try {
        const bounds = data.villageCoords.reduce(
          (acc, [lat, lon]) => {
            acc.minLat = Math.min(acc.minLat, lat);
            acc.maxLat = Math.max(acc.maxLat, lat);
            acc.minLon = Math.min(acc.minLon, lon);
            acc.maxLon = Math.max(acc.maxLon, lon);
            return acc;
          },
          {
            minLat: Infinity,
            maxLat: -Infinity,
            minLon: Infinity,
            maxLon: -Infinity,
          }
        );
        map.setBounds(
          [
            [bounds.minLat, bounds.minLon],
            [bounds.maxLat, bounds.maxLon],
          ],
          { checkZoomRange: true, zoomMargin: 30 }
        );
      } catch {
        /* ignore */
      }
    }

    // Auto-select "featured" — median-priced free plot
    // (not the cheapest, not the most expensive — a representative average)
    if (!initialSelectDone.current) {
      const avail = data.plots
        .filter((p) => isPlotAvailable(p.statusName))
        .sort((a, b) => a.pricePerHundred - b.pricePerHundred);
      const featured =
        avail[Math.floor(avail.length / 2)] || avail[0] || data.plots[0];
      if (featured) {
        setSelectedPlot(featured);
        initialSelectDone.current = true;
      }
    }
  }, [mapReady, data, visiblePlots, mapType, selectedPlot]);

  // Pan to selected
  useEffect(() => {
    if (!selectedPlot || !mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.panTo(selectedPlot.center, {
        flying: true,
        duration: 400,
      });
    } catch {}
  }, [selectedPlot]);

  const zoomIn = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(Math.min(map.getZoom() + 1, 19), { duration: 200 });
  }, []);
  const zoomOut = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(Math.max(map.getZoom() - 1, 14), { duration: 200 });
  }, []);

  const toggleTier = useCallback((tierIdx: number) => {
    setEnabledTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tierIdx)) next.delete(tierIdx);
      else next.add(tierIdx);
      return next;
    });
  }, []);


  const statusOf = (plot: NormalizedPlot | null) => {
    if (!plot) return null;
    if (isPlotAvailable(plot.statusName)) return "free";
    if (isPlotReserved(plot.statusName)) return "reserved";
    if (isPlotSold(plot.statusName)) return "sold";
    return "other";
  };

  return (
    <section className="relative bg-stone-50 py-4 lg:py-6">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-3 lg:px-5">
        {/* Main container — uses viewport height for full-screen feel */}
        <div className="relative h-[calc(100vh-5.5rem)] min-h-[540px] max-h-[820px]">
          {/* ─── Sidebar (lg+ only, compact 280px) ─── */}
          <aside className="hidden lg:flex absolute top-0 left-0 bottom-0 w-[280px] bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5 z-20 flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[9px] font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-2.5 h-2.5" />
                Карта участков
              </div>
              <h2 className="text-base font-black text-green-900 tracking-tight leading-tight truncate">
                {villageName}
              </h2>
            </div>

            {/* Stats — compact */}
            {data && (
              <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                      Всего
                    </div>
                    <div className="text-lg font-black text-gray-900 leading-none mt-0.5">
                      {data.plots.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">
                      Свободно
                    </div>
                    <div className="text-lg font-black text-emerald-700 leading-none mt-0.5">
                      {data.statistics.free}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">
                      Бронь
                    </div>
                    <div className="text-lg font-black text-blue-600 leading-none mt-0.5">
                      {data.statistics.reserved}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                      Продано
                    </div>
                    <div className="text-lg font-black text-gray-500 leading-none mt-0.5">
                      {data.statistics.sold}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected plot — TOP priority, right after stats */}
            <div className="px-4 pt-3 pb-3 border-b border-gray-100">
              {selectedPlot ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl ring-1 ring-emerald-200/70">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                        Участок
                      </div>
                      <div className="text-xl font-black text-green-900 leading-none mt-0.5">
                        №&nbsp;{selectedPlot.number}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          statusOf(selectedPlot) === "free"
                            ? "bg-emerald-600 text-white"
                            : statusOf(selectedPlot) === "reserved"
                            ? "bg-blue-500 text-white"
                            : statusOf(selectedPlot) === "sold"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {selectedPlot.statusName}
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
                        variant="inline"
                        stopPropagation={false}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
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
                    <div className="flex justify-between items-baseline pt-1 border-t border-emerald-200/60 mt-1">
                      <span className="text-gray-500">Итого</span>
                      <span className="font-black text-green-700 text-sm tabular-nums">
                        {formatRub(selectedPlot.totalCost)}
                      </span>
                    </div>
                  </div>

                  {statusOf(selectedPlot) !== "sold" && (
                    <a
                      href="#contact-form"
                      className="mt-2.5 block w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white py-2 rounded-lg font-bold text-[11px] text-center shadow-md shadow-green-800/25 transition-all"
                    >
                      Записаться на просмотр
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 text-center py-3">
                  Кликните на участок на карте
                </div>
              )}
            </div>

            {/* Status legend — 2x2 compact grid (matches map.zemexx.ru) */}
            <div className="px-4 pt-3 pb-3 border-b border-gray-100">
              <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                Статус
              </h3>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      background: "#22c55e",
                      boxShadow: "0 0 0 1.5px #fff, 0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                  <span className="text-[10px] font-semibold text-gray-800">
                    Свободен
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      background: "#3b82f6",
                      boxShadow: "0 0 0 1.5px #fff, 0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                  <span className="text-[10px] font-semibold text-gray-800">
                    Забронирован
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      background: "#9ca3af",
                      boxShadow: "0 0 0 1.5px #fff, 0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                  <span className="text-[10px] font-semibold text-gray-600">
                    Продан
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"
                    style={{
                      boxShadow:
                        "0 0 0 1.5px #fff, 0 0 0 3px rgba(34,197,94,0.35)",
                    }}
                  />
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Выбран
                  </span>
                </div>
              </div>
            </div>

            {/* Price filters — clickable colored dot, scrollable if many */}
            {data && data.priceTiers.length > 0 && (
              <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3">
                <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Цена за сотку
                </h3>
                <div className="space-y-1.5">
                  {TIER_COLORS.slice(0, data.priceTiers.length).map(
                    (tier, i) => {
                      const min = data.priceTiers[i];
                      const max =
                        i + 1 < data.priceTiers.length
                          ? data.priceTiers[i + 1] - 1
                          : null;
                      const on = enabledTiers.has(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleTier(i)}
                          className="flex items-center gap-2 w-full text-left group"
                        >
                          <span
                            className={`w-3 h-3 rounded-full shrink-0 ring-2 shadow-sm transition-all ${
                              on
                                ? "ring-white"
                                : "ring-gray-200 opacity-40 grayscale"
                            }`}
                            style={{ backgroundColor: tier.dot }}
                          />
                          <span
                            className={`text-[10px] font-semibold tabular-nums transition-colors ${
                              on
                                ? "text-gray-800 group-hover:text-gray-900"
                                : "text-gray-400 line-through"
                            }`}
                          >
                            {max
                              ? `от ${min.toLocaleString(
                                  "ru-RU"
                                )} ₽ до ${max.toLocaleString("ru-RU")} ₽`
                              : `от ${min.toLocaleString("ru-RU")} ₽`}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Sticky bottom: contact sales */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <a
                href="tel:+79859052555"
                className="flex items-center justify-center gap-1.5 w-full text-green-700 font-bold py-2 hover:bg-green-50 rounded-lg transition-all text-[11px]"
              >
                <Phone className="w-3.5 h-3.5" />
                +7 (985) 905-25-55
              </a>
            </div>
          </aside>

          {/* ─── Map container ─── */}
          <div
            className={`absolute inset-0 lg:left-[296px] rounded-2xl overflow-hidden bg-stone-200 ring-1 ring-black/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] zp-zoom-${currentZoom}`}
          >
            <div ref={mapRef} className="w-full h-full" />

            {/* Safari Private / Brave-strict fallback — Yandex Maps script
                domains (*.yandex.ru) get blocked as "trackers" and the
                whole map silently fails to initialize. Show a clear
                explanation + CTA so the user knows why the map is empty
                and what to do about it. */}
            {mapBlocked && !mapReady && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-100 px-6">
                <div className="max-w-md text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 mb-1.5">
                      Карта участков недоступна
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Браузер заблокировал загрузку Яндекс&nbsp;Карт — скорее всего вы
                      в приватном режиме Safari или в браузере с жёстким блокировщиком.
                      Откройте эту страницу в обычном окне Chrome/Safari, и карта загрузится.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 text-white text-xs font-bold shadow-md hover:from-green-600 hover:to-emerald-600 transition-all"
                    >
                      Попробовать ещё раз
                    </button>
                    <a
                      href="tel:+79859052555"
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-white text-green-800 ring-1 ring-green-200 text-xs font-bold hover:bg-green-50 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      +7 (985) 905-25-55 — уточнить участки
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Top toolbar — «Мои места» + dropdown panel */}
            <div className="absolute top-3 left-3 z-30">
              <button
                onClick={() => {
                  // Tapping the button when the panel is already open or a
                  // route is drawn should bring the user back to the village
                  // view — otherwise they end up stranded mid-route with no
                  // obvious way back.
                  if (showPlacesPanel || activeRouteId) {
                    clearRoute();
                    setShowPlacesPanel(false);
                    setAddingPlace(false);
                  } else {
                    setShowPlacesPanel(true);
                  }
                }}
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
                    <h3 className="text-sm font-black text-gray-900">
                      Мои места
                    </h3>
                    {places.length > 0 && (
                      <button
                        onClick={clearAllPlaces}
                        className="text-[10px] font-semibold text-red-500 hover:text-red-700"
                      >
                        Очистить всё
                      </button>
                    )}
                  </div>

                  <div className="max-h-[280px] overflow-y-auto">
                    {places.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-gray-500">
                        Добавьте важные точки — увидите расстояние от посёлка.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-50">
                        {places.map((p) => {
                          const isActive = activeRouteId === p.id;
                          const Icon =
                            p.label.toLowerCase().includes("работ") ||
                            p.label.toLowerCase().includes("офис")
                              ? Briefcase
                              : HomeIcon;
                          return (
                            <li
                              key={p.id}
                              className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
                                isActive ? "bg-blue-50" : "hover:bg-gray-50"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  if (isActive) clearRoute();
                                  else drawRoute(p);
                                }}
                                className="flex-1 min-w-0 flex items-center gap-2 text-left"
                              >
                                <div
                                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isActive
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-gray-900 truncate">
                                    {p.label}
                                  </div>
                                  <div className="text-[10px] text-gray-500 truncate">
                                    {p.address}
                                  </div>
                                </div>
                              </button>
                              <button
                                onClick={() => removePlace(p.id)}
                                className="shrink-0 w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                aria-label="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Add place form */}
                  <div className="px-3 py-2.5 bg-gray-50 border-t border-gray-100">
                    {addingPlace ? (
                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          {["Дом", "Работа", "Дача"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setNewPlaceLabel(preset)}
                              className={`px-2 h-6 rounded-full text-[10px] font-bold transition-colors ${
                                newPlaceLabel === preset
                                  ? "bg-green-600 text-white"
                                  : "bg-white text-gray-600 ring-1 ring-gray-200"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        {/* Detect location button */}
                        <button
                          type="button"
                          onClick={detectLocation}
                          disabled={geocodeLoading}
                          className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 ring-1 ring-blue-200 text-[11px] font-bold transition-colors disabled:opacity-60"
                        >
                          {geocodeLoading ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <LocateFixed className="w-3.5 h-3.5" />
                              Определить моё местоположение
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2 text-[9px] text-gray-400 uppercase tracking-wider">
                          <div className="h-px bg-gray-200 flex-1" />
                          или
                          <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <input
                          type="text"
                          value={newPlaceAddress}
                          onChange={(e) => setNewPlaceAddress(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              addPlace(newPlaceLabel, newPlaceAddress);
                          }}
                          placeholder="Адрес, например «Москва, Тверская 1»"
                          className="w-full bg-white rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 px-2.5 h-8 text-xs outline-none placeholder:text-gray-400"
                        />
                        {geocodeError && (
                          <div className="text-[10px] text-red-500 font-semibold leading-snug">
                            {geocodeError}
                          </div>
                        )}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              addPlace(newPlaceLabel, newPlaceAddress)
                            }
                            disabled={
                              geocodeLoading || !newPlaceAddress.trim()
                            }
                            className="flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[11px] font-bold"
                          >
                            {geocodeLoading ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Navigation className="w-3 h-3" />
                                Проложить
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setAddingPlace(false);
                              setGeocodeError("");
                              setNewPlaceAddress("");
                            }}
                            className="px-3 h-8 rounded-lg bg-white text-gray-500 text-[11px] font-bold ring-1 ring-gray-200 hover:bg-gray-100"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingPlace(true);
                          setGeocodeError("");
                        }}
                        className="w-full inline-flex items-center justify-center gap-1 h-8 rounded-lg border border-dashed border-gray-300 text-green-700 hover:text-green-800 hover:border-green-400 text-[11px] font-bold transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Добавить место
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right-bottom controls */}
            <div className="absolute right-3 bottom-3 z-30 flex flex-col gap-1.5">
              <div className="flex flex-col bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                <button
                  onClick={zoomIn}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-green-700 active:scale-95 transition-all"
                  aria-label="Приблизить"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <div className="h-px bg-gray-100 mx-1.5" />
                <button
                  onClick={zoomOut}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-green-700 active:scale-95 transition-all"
                  aria-label="Отдалить"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-xl ring-1 ring-black/5 p-0.5 flex flex-col gap-0.5">
                <button
                  onClick={() => setMapType("map")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    mapType === "map"
                      ? "bg-gradient-to-br from-green-700 to-emerald-700 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label="Схема"
                  title="Схема"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMapType("satellite")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    mapType === "satellite"
                      ? "bg-gradient-to-br from-green-700 to-emerald-700 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label="Спутник"
                  title="Спутник"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active route info bar — bottom center */}
            {routeInfo && activeRouteId && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-white rounded-full shadow-2xl ring-1 ring-black/5 pl-3 pr-1.5 py-1.5 flex items-center gap-2 max-w-[min(94vw,460px)]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <HomeIcon className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {
                      places.find((p) => p.id === activeRouteId)?.label
                    }
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
                    · ~{routeInfo.duration}
                  </span>
                </div>
                <button
                  onClick={clearRoute}
                  className="shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Скрыть маршрут"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile: inline stats top-right */}
            {data && (
              <div className="lg:hidden absolute top-16 right-3 z-20 bg-white/95 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-black/5 px-3 py-2 text-[10px] font-bold">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-700">●</span>
                    <span className="text-emerald-700 tabular-nums">
                      {data.statistics.free}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-blue-500">●</span>
                    <span className="text-blue-600 tabular-nums">
                      {data.statistics.reserved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400">●</span>
                    <span className="text-gray-500 tabular-nums">
                      {data.statistics.sold}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: bottom selection sheet */}
            {selectedPlot && (
              <div className="lg:hidden absolute bottom-3 left-3 right-16 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden z-20">
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                        Участок №{selectedPlot.number}
                      </div>
                      <div className="text-lg font-black text-gray-900 leading-none mt-0.5">
                        {selectedPlot.area} соток
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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
                        variant="inline"
                        stopPropagation={false}
                      />
                      <button
                        onClick={() => setSelectedPlot(null)}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <div
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        statusOf(selectedPlot) === "free"
                          ? "bg-emerald-600 text-white"
                          : statusOf(selectedPlot) === "reserved"
                          ? "bg-blue-500 text-white"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPlot.statusName}
                    </div>
                    <span className="font-black text-green-700 text-sm tabular-nums">
                      {formatRub(selectedPlot.totalCost)}
                    </span>
                  </div>
                  {statusOf(selectedPlot) !== "sold" && (
                    <a
                      href="#contact-form"
                      className="block w-full bg-gradient-to-r from-green-700 to-emerald-700 text-white py-2 rounded-lg font-bold text-xs text-center shadow-md"
                    >
                      Записаться на просмотр
                    </a>
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm z-40">
                <div className="flex flex-col items-center gap-2 text-gray-600">
                  <Loader2 className="w-7 h-7 animate-spin text-green-700" />
                  <span className="text-xs font-medium">Загружаем карту…</span>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-40">
                <div className="text-center p-6">
                  <div className="text-red-600 font-semibold mb-2">
                    Не удалось загрузить карту
                  </div>
                  <div className="text-gray-500 text-sm">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Round dot marker styles — zoom-responsive */}
      <style jsx global>{`
        /* 0×0 anchor div — Yandex Maps positions this at the plot
           center; the inner .zp-dot is centered on top of it via
           absolute positioning + translate(-50%,-50%). Without this
           wrapper, the dot's top-left would sit at the point. */
        .zp-dot-wrap {
          position: relative;
          width: 0;
          height: 0;
        }
        .zp-dot {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 9px;
          font-weight: 800;
          line-height: 1;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: width 0.15s ease, height 0.15s ease, font-size 0.15s ease;
          user-select: none;
        }
        .zp-dot:hover {
          transform: translate(-50%, -50%) scale(1.3);
          z-index: 500;
        }
        .zp-dot-num {
          pointer-events: none;
        }

        /* ─── Zoom-responsive sizing ─── */
        /* Far out (14-15) — tiny dots, no numbers visible */
        .zp-zoom-14 .zp-dot,
        .zp-zoom-15 .zp-dot {
          width: 9px;
          height: 9px;
        }
        .zp-zoom-14 .zp-dot-num,
        .zp-zoom-15 .zp-dot-num {
          display: none;
        }
        /* Mid (16) — small with tiny numbers */
        .zp-zoom-16 .zp-dot {
          width: 14px;
          height: 14px;
          font-size: 7px;
        }
        /* Default (17) — normal size */
        .zp-zoom-17 .zp-dot {
          width: 20px;
          height: 20px;
          font-size: 9px;
        }
        /* Close (18-19) — larger, clearer */
        .zp-zoom-18 .zp-dot,
        .zp-zoom-19 .zp-dot {
          width: 26px;
          height: 26px;
          font-size: 11px;
        }

        /* ─── Colors by status (matches reference map.zemexx.ru) ─── */
        /* Free — fallback amber; overridden below per price tier */
        .zp-dot-free {
          background: #f97316;
          color: #fff;
          box-shadow: 0 0 0 1.5px #fff, 0 2px 4px rgba(0, 0, 0, 0.35);
        }
        .zp-dot-free.zp-tier-0 { background: #eab308; }  /* yellow */
        .zp-dot-free.zp-tier-1 { background: #16a34a; }  /* green */
        .zp-dot-free.zp-tier-2 { background: #06b6d4; }  /* cyan */
        .zp-dot-free.zp-tier-3 { background: #ea580c; }  /* orange */
        .zp-dot-free.zp-tier-4 { background: #dc2626; }  /* red */
        /* Reserved — solid blue, like "Забронирован" in reference */
        .zp-dot-reserved {
          background: #3b82f6;
          color: #fff;
          box-shadow: 0 0 0 1.5px #fff, 0 2px 4px rgba(0, 0, 0, 0.35);
        }
        /* Sold — neutral gray, white number, visible but muted */
        .zp-dot-sold {
          background: #9ca3af;
          color: #fff;
          box-shadow: 0 0 0 1.5px #fff, 0 1px 3px rgba(0, 0, 0, 0.25);
        }
        /* Technical — same as sold but slightly fainter */
        .zp-dot-technical {
          background: #cbd5e1;
          color: #64748b;
          box-shadow: 0 0 0 1.5px #fff, 0 1px 3px rgba(0, 0, 0, 0.15);
        }
        /* Selected — bright green with white ring + glow + pulse */
        .zp-dot-selected {
          background: #22c55e;
          color: #fff;
          width: 26px !important;
          height: 26px !important;
          font-size: 10px !important;
          box-shadow: 0 0 0 3px #fff, 0 0 0 6px rgba(34, 197, 94, 0.4),
            0 4px 12px rgba(34, 197, 94, 0.5);
          animation: zp-pulse 2s ease-in-out infinite;
          z-index: 600;
        }
        /* Selected is always full size regardless of zoom */
        .zp-zoom-14 .zp-dot-selected,
        .zp-zoom-15 .zp-dot-selected {
          width: 22px !important;
          height: 22px !important;
          font-size: 9px !important;
        }
        .zp-zoom-14 .zp-dot-selected .zp-dot-num,
        .zp-zoom-15 .zp-dot-selected .zp-dot-num {
          display: inline;
        }
        @keyframes zp-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 3px #fff, 0 0 0 6px rgba(34, 197, 94, 0.4),
              0 4px 12px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 0 3px #fff, 0 0 0 10px rgba(34, 197, 94, 0.18),
              0 6px 16px rgba(34, 197, 94, 0.6);
          }
        }

        /* ─── Hide Yandex Maps footer buttons ───
           We want gone:
             1) "Открыть в Яндекс Картах" (despite suppressMapOpenBlock,
                this button still renders in some 2.1 builds since the
                option was renamed / behavior regressed).
             2) "Создать свою карту" link in the copyright block.
           Yandex's versioned class names change (2-1-79, 2-1-80, …) so
           we target everything via wildcard attribute selectors plus
           keep the specific versioned ones as belt-and-braces. © Яндекс
           and the ToS link must stay (license requirement). */
        [class*="ymaps-"][class*="map-copyrights-promo"],
        [class*="ymaps-"][class*="copyrights-pane-text__promo"],
        [class*="ymaps-"][class*="gotoymaps"],
        [class*="ymaps-"][class*="gotomap"],
        [class*="ymaps-"][class*="copyright__link"][href*="constructor"],
        [class*="ymaps-"][class*="copyright__link"][href*="create"] {
          display: none !important;
        }
        /* Belt-and-braces: hide any <a> inside a ymaps copyright container
           whose href points at Yandex's "create your own map" wizard or
           the "open in Yandex Maps" deep link. Keeps the © Яндекс and
           ToS links (they don't match these patterns). */
        [class*="ymaps-"][class*="copyright"] a[href*="/constructor"],
        [class*="ymaps-"][class*="copyright"] a[href*="/?ll"],
        [class*="ymaps-"][class*="copyright"] a[href*="yandex.ru/maps/?"] {
          display: none !important;
        }
      `}</style>
    </section>
  );
}
