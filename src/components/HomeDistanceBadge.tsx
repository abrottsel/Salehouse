"use client";

/**
 * HomeDistanceBadge — «Дорога к мечте» pill + liquid-glass dropdown.
 *
 * Variants:
 *   - "hero"  — для VillageHeroSwiper (тёмная пилюля в шапке + dropdown под ней)
 *   - "frame" — поверх iframe карты (тот же стиль, anchored к самой кнопке)
 *   - "card"  — мини-чип для карточки в каталоге (без dropdown, открывает hero modal)
 *
 * Storage:
 *   - localStorage key "zemplus_user_places" — синхронно с InteractivePlotMap3
 *   - Первый "Дом" из списка используется как точка отсчёта
 *
 * Geolocation cascade: GPS → IP fallback (/api/my-ip-location) → ручной адрес (/api/geocode)
 * Routing: /api/route (OSRM) с haversine fallback.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Route,
  Navigation2,
  X,
  Search,
  Loader2,
  MapPin,
  Home,
} from "lucide-react";

const PLACES_STORAGE_KEY = "zemplus_user_places";
const ROUTE_CACHE_KEY = "zemplus_route_cache_v1";

interface UserPlace {
  id: string;
  label: string;
  address: string;
  coords: [number, number]; // [lat, lon]
}

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
}

interface Props {
  villageCoords: [number, number]; // [lat, lon]
  villageName: string;
  variant?: "hero" | "frame" | "card";
}

// ─────────────────────────────────────────────────────────────────
// Storage helpers (shared with InteractivePlotMap3)
// ─────────────────────────────────────────────────────────────────

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

function getHome(places: UserPlace[]): UserPlace | null {
  if (!places.length) return null;
  return places.find((p) => /дом|home/i.test(p.label)) || places[0];
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  return m === 0 ? `${h}ч` : `${h}ч ${m}м`;
}

function cacheKey(from: [number, number], to: [number, number]) {
  return `${from[0].toFixed(4)},${from[1].toFixed(4)}->${to[0].toFixed(4)},${to[1].toFixed(4)}`;
}

function loadRouteCache(): Record<string, RouteInfo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ROUTE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRouteCache(cache: Record<string, RouteInfo>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

async function fetchRoute(
  from: [number, number],
  to: [number, number],
): Promise<RouteInfo> {
  const cache = loadRouteCache();
  const key = cacheKey(from, to);
  if (cache[key]) return cache[key];

  try {
    const res = await fetch(
      `/api/route?from=${from[0]},${from[1]}&to=${to[0]},${to[1]}`,
      { cache: "force-cache" },
    );
    if (res.ok) {
      const json = await res.json();
      if (
        typeof json?.distanceKm === "number" &&
        typeof json?.durationMin === "number"
      ) {
        const info = {
          distanceKm: json.distanceKm,
          durationMin: json.durationMin,
        };
        cache[key] = info;
        saveRouteCache(cache);
        return info;
      }
    }
  } catch {
    /* fall through */
  }

  // Haversine fallback
  const km = haversineKm(from, to) * 1.35;
  const info = {
    distanceKm: Math.round(km),
    durationMin: Math.round((km / 55) * 60),
  };
  cache[key] = info;
  saveRouteCache(cache);
  return info;
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export default function HomeDistanceBadge({
  villageCoords,
  villageName,
  variant = "hero",
}: Props) {
  const [home, setHome] = useState<UserPlace | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Sync home from localStorage on mount + listen for changes
  useEffect(() => {
    const sync = () => setHome(getHome(loadPlaces()));
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PLACES_STORAGE_KEY) sync();
    };
    const onCustom = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("zemplus:places-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("zemplus:places-changed", onCustom);
    };
  }, []);

  // Recompute route when home or village changes
  useEffect(() => {
    if (!home) {
      setRoute(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchRoute(home.coords, villageCoords)
      .then((r) => {
        if (!cancelled) setRoute(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [home, villageCoords]);

  const handleSavePlace = useCallback((place: UserPlace) => {
    const places = loadPlaces();
    const filtered = places.filter((p) => !/дом|home/i.test(p.label));
    const next = [place, ...filtered];
    savePlaces(next);
    setHome(place);
    window.dispatchEvent(new CustomEvent("zemplus:places-changed"));
    setOpen(false);
  }, []);

  // ── CARD variant: tiny glass chip on catalog card photo ──
  if (variant === "card") {
    if (!home) {
      return (
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-black/35 backdrop-blur-md ring-1 ring-white/30 text-white text-[10px] font-bold shadow-lg [&_*]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          <MapPin className="w-3 h-3" />
          {`${Math.round(haversineKm([55.7558, 37.6176], villageCoords))} км от Москвы`}
        </span>
      );
    }
    const durationText = route ? formatDuration(route.durationMin) : "…";
    return (
      <span className="inline-flex items-center gap-1 h-6 pl-1 pr-2 rounded-full bg-black/35 backdrop-blur-md ring-1 ring-white/30 text-white text-[10px] font-bold shadow-lg [&_*]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <Home className="w-2.5 h-2.5 text-white" />
        </span>
        {loading ? "…" : `${durationText} от вас`}
      </span>
    );
  }

  // ── HERO / FRAME variant: pill + liquid-glass dropdown ──
  const showLiveBadge = !!home && !!route;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="inline-block group/badge">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-full ring-1 text-white text-[11px] font-bold backdrop-blur-md transition shadow-lg ${
          showLiveBadge
            ? "bg-emerald-500/85 ring-emerald-300/50 hover:bg-emerald-500/95"
            : "bg-black/40 ring-white/25 hover:bg-black/55"
        }`}
        aria-label={home ? `От ${home.label}: ${home.address}` : "Указать ваш адрес"}
      >
        <span
          className={`w-4 h-4 rounded-full flex items-center justify-center ${
            showLiveBadge ? "bg-white/25" : "bg-emerald-500"
          }`}
        >
          <Route className="w-2.5 h-2.5 text-white" />
        </span>
        {showLiveBadge ? (
          <span className="leading-none whitespace-nowrap">
            {loading ? "…" : `${formatDuration(route.durationMin)} · ${Math.round(route.distanceKm)} км`}
          </span>
        ) : (
          <span>Дорога к мечте</span>
        )}
      </button>

      {/* Custom glass tooltip — only when home is set and dropdown closed */}
      {home && !open && (
        <div
          className="pointer-events-none absolute left-0 top-full mt-1.5 z-30 w-max max-w-[260px] sm:max-w-[300px] opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 rounded-xl px-3 py-2 text-[11px] font-semibold text-gray-900 leading-snug hd-glass-tooltip"
          style={{
            backdropFilter: "blur(20px) saturate(1.8)",
            WebkitBackdropFilter: "blur(20px) saturate(1.8)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%)",
            boxShadow:
              "inset 0 1.5px 0 rgba(255,255,255,0.7), 0 6px 20px -4px rgba(0,0,0,0.25)",
          }}
        >
          <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-black mb-0.5">
            От «{home.label}»
          </div>
          {home.address}
          <style>{`
            .hd-glass-tooltip { position: absolute; overflow: hidden; }
            .hd-glass-tooltip::before {
              content: '';
              position: absolute;
              inset: -1.5px;
              border-radius: inherit;
              padding: 1.5px;
              background: conic-gradient(
                from 45deg,
                rgba(255,255,255,0.85),
                rgba(180,255,180,0.7),
                rgba(255,255,255,0.6),
                rgba(180,220,255,0.7),
                rgba(255,255,255,0.85),
                rgba(255,200,180,0.7),
                rgba(255,255,255,0.6),
                rgba(200,180,255,0.7),
                rgba(255,255,255,0.85)
              );
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              pointer-events: none;
            }
          `}</style>
        </div>
      )}

      {open && mounted && (
        <DropdownPanel
          anchor={buttonRef.current}
          home={home}
          onSave={handleSavePlace}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DropdownPanel — liquid-glass card with geolocation + address search
// ─────────────────────────────────────────────────────────────────

interface DropdownProps {
  anchor: HTMLElement | null;
  home: UserPlace | null;
  onSave: (place: UserPlace) => void;
  onClose: () => void;
}

function DropdownPanel(props: DropdownProps) {
  // Render in portal to body — escapes any parent overflow:hidden / inline-flex layout effect.
  // We're guarded by `mounted` in the parent so this only renders client-side.
  if (typeof document === "undefined") return null;
  return createPortal(<DropdownPanelInner {...props} />, document.body);
}

function DropdownPanelInner({ anchor, home, onSave, onClose }: DropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Compute fixed position synchronously via useLayoutEffect-equivalent (useEffect is fine
  // because we render with opacity:0 until pos is set, so no flash).
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    const compute = () => {
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const dropdownWidth = vw < 640 ? 260 : 340;
      const isFrame = !!anchor.closest("[data-frame-overlay]");

      let desiredLeft: number;
      let desiredTop: number;
      if (isFrame) {
        // Frame: правый край панели = правый край кнопки (сдвигается ЛЕВЕЕ на карту)
        desiredLeft = r.right - dropdownWidth;
        desiredTop = r.bottom + 8;
      } else {
        // Hero: anchor под рядом пилюль. На мобиле — по левому краю,
        // на десктопе — центрировать между «Каширское» pill и бейджем,
        // чтобы dropdown не перекрывал стрелку слайдера слева.
        const row = anchor.closest("[data-hero-pills-row]") as HTMLElement | null;
        const rowRect = row?.getBoundingClientRect();
        const leftPad = vw >= 1024 ? 64 : vw >= 640 ? 32 : 16;
        if (row && row.children[0] && row.children[1]) {
          // Вариант B + сдвиг вправо: центр между Каширское (children[0]) и бейджем (children[1]) + 40px
          const leftPill = row.children[0] as HTMLElement;
          const badgeWrap = row.children[1] as HTMLElement;
          const leftEdge = leftPill.getBoundingClientRect().left;
          const rightEdge = badgeWrap.getBoundingClientRect().right;
          const center = (leftEdge + rightEdge) / 2;
          desiredLeft = center - dropdownWidth / 2 + 40;
        } else {
          desiredLeft = leftPad;
        }
        desiredTop = (rowRect ? rowRect.bottom : r.bottom) + 8;
      }

      const maxLeft = vw - dropdownWidth - 8;
      const clampedLeft = Math.max(8, Math.min(desiredLeft, maxLeft));
      setPos({ top: desiredTop, left: clampedLeft });
    };
    compute();
    // Close on scroll, но НЕ когда фокус внутри панели (iOS keyboard)
    const onScroll = () => {
      const active = document.activeElement;
      if (panelRef.current && active && panelRef.current.contains(active)) return;
      onClose();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchor, onClose]);

  // Click outside → close. Use mousedown so we don't fight with the button's own click toggle.
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (anchor && anchor.contains(target)) return; // let the button toggle
      onClose();
    };
    // Defer one tick so the opening click doesn't immediately close us
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("touchstart", onDown);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [anchor, onClose]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Close on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced address search (DaData-first, Nominatim fallback)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        let res = await fetch(`/api/dadata-suggest?q=${encodeURIComponent(query)}`);
        if (!res.ok || (await res.clone().json())?.results?.length === 0) {
          res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
            cache: "force-cache",
          });
        }
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.results)) {
            setResults(
              json.results
                .slice(0, 5)
                .map(
                  (r: {
                    lat: number;
                    lon: number;
                    display_name?: string;
                    name?: string;
                  }) => ({
                    id: makeId(),
                    label: "Дом",
                    address: r.display_name || r.name || "",
                    coords: [r.lat, r.lon] as [number, number],
                  }),
                ),
            );
          }
        }
      } finally {
        setSearching(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [query]);

  const useGeolocation = useCallback(async () => {
    setGeoError(null);
    setGeoLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Геолокация не поддерживается"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      let address = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      try {
        const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const json = await res.json();
          address = json?.display_name || json?.address || address;
        }
      } catch {
        /* keep coords */
      }
      onSave({ id: makeId(), label: "Дом", address, coords: [lat, lon] });
    } catch (e) {
      // IP fallback
      try {
        const res = await fetch("/api/my-ip-location");
        if (res.ok) {
          const json = await res.json();
          if (typeof json?.lat === "number" && typeof json?.lon === "number") {
            onSave({
              id: makeId(),
              label: "Дом",
              address:
                json?.address ||
                `${json.lat.toFixed(4)}, ${json.lon.toFixed(4)} (по IP)`,
              coords: [json.lat, json.lon],
            });
            return;
          }
        }
      } catch {
        /* ignore */
      }
      setGeoError(
        e instanceof Error
          ? e.message
          : "Не удалось определить местоположение",
      );
    } finally {
      setGeoLoading(false);
    }
  }, [onSave]);

  return (
    <>
      <div
        ref={panelRef}
        className="fixed z-[100] w-[260px] sm:w-[340px] rounded-[20px] text-white [&_*]:drop-shadow-[0_2px_4px_rgba(0,0,0,1)] hd-glass-tile hd-glass-enter"
        style={{
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          opacity: pos ? 1 : 0,
          pointerEvents: pos ? "auto" : "none",
          backdropFilter: "blur(1px) saturate(2)",
          WebkitBackdropFilter: "blur(1px) saturate(2)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
          boxShadow:
            "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 8px 32px -4px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 pt-2.5 pb-3 sm:px-4 sm:pt-3 sm:pb-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black flex items-center gap-1.5 tracking-tight text-emerald-300">
                <Route className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-300 flex-shrink-0" />
                Дорога к мечте
              </h3>
              <p className="text-xs sm:text-sm text-white mt-0.5 font-bold leading-snug">
                {home
                  ? `Сохранено: ${home.address.split(",").slice(0, 2).join(",")}`
                  : "Сколько ехать от вашего дома"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full hover:bg-white/15 flex items-center justify-center -mr-0.5 flex-shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>

          <button
            onClick={useGeolocation}
            disabled={geoLoading}
            className="w-full flex items-center justify-center gap-2 h-10 sm:h-11 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-white text-sm sm:text-base font-black transition shadow-lg shadow-emerald-500/40"
          >
            {geoLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Определяю…
              </>
            ) : (
              <>
                <Navigation2 className="w-3.5 h-3.5" />
                {home ? "Обновить" : "Моё местоположение"}
              </>
            )}
          </button>
          <p className="text-[11px] text-white text-center mt-1.5 leading-snug font-semibold">
            Координаты не покидают браузер
          </p>

          {geoError && (
            <p className="text-xs text-red-200 text-center mt-1 font-bold">
              {geoError}
            </p>
          )}

          <div className="text-center my-2.5">
            <span className="text-[11px] uppercase text-white tracking-[0.15em] font-black">
              или укажите адрес
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/85" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Москва, Тверская, 1"
              className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-lg bg-white/15 ring-1 ring-white/40 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:bg-white/20 transition font-bold"
            />
          </div>

          {searching && (
            <div className="text-xs text-white mt-2 flex items-center gap-1.5 font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ищу адрес…
            </div>
          )}

          {results.length > 0 && (
            <ul className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => onSave(r)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/20 text-sm text-white flex items-center gap-2 transition font-bold"
                  >
                    <MapPin className="w-3.5 h-3.5 text-white/85 flex-shrink-0" />
                    <span className="truncate">{r.address}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Liquid-glass border (matches HeroTiles wide variant) */}
      <style>{`
        @keyframes hd-glass-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hd-glass-enter { animation: hd-glass-in 200ms ease-out both; }
        .hd-glass-tile::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          padding: 3px;
          background: conic-gradient(
            from 45deg,
            rgba(255,255,255,0.85),
            rgba(180,255,180,0.7),
            rgba(255,255,255,0.6),
            rgba(180,220,255,0.7),
            rgba(255,255,255,0.85),
            rgba(255,200,180,0.7),
            rgba(255,255,255,0.6),
            rgba(200,180,255,0.7),
            rgba(255,255,255,0.85)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
