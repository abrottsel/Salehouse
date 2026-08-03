"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Loader2, Navigation, Search, X } from "lucide-react";
import { glassStyle } from "./ui/primitives";

/**
 * «Дорога к мечте» — тёмный вариант для /v3.
 *
 * Визуал новый, логика та же, что у эталонного HomeDistanceBadge:
 * те же ключи localStorage (адрес дома переносится между версиями
 * сайта) и те же эндпоинты — /api/my-ip-location, /api/dadata-suggest
 * с откатом на /api/geocode, /api/route с haversine-подстраховкой.
 *
 * Боевой компонент src/components/HomeDistanceBadge.tsx не тронут.
 */

const PLACES_KEY = "zemplus_user_places";
const ROUTE_CACHE_KEY = "zemplus_route_cache_v1";

interface UserPlace {
  id: string;
  label: string;
  address: string;
  coords: [number, number];
}
interface RouteInfo {
  distanceKm: number;
  durationMin: number;
}
interface Suggestion {
  address: string;
  coords: [number, number];
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Дом живёт в localStorage и общий для вкладок, поэтому читаем его как
 * внешний источник, а не через useState + эффект: так нет ни каскадного
 * рендера, ни расхождения гидрации (на сервере снимок — null).
 */
const homeListeners = new Set<() => void>();
let homeRaw: string | null = null;
let homeValue: UserPlace | null = null;

function emitHomeChanged() {
  homeListeners.forEach((l) => l());
}

function subscribeHome(cb: () => void) {
  homeListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    homeListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Снимок обязан быть стабильным по ссылке, пока строка в хранилище
 *  не изменилась, иначе useSyncExternalStore уйдёт в вечный ререндер. */
function homeSnapshot(): UserPlace | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PLACES_KEY);
  } catch {
    raw = null;
  }
  if (raw !== homeRaw) {
    homeRaw = raw;
    homeValue = raw ? ((JSON.parse(raw) as UserPlace[])[0] ?? null) : null;
  }
  return homeValue;
}

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchRoute(from: [number, number], to: [number, number]): Promise<RouteInfo> {
  const cache = readJson<Record<string, RouteInfo>>(ROUTE_CACHE_KEY, {});
  const key = `${from[0].toFixed(3)},${from[1].toFixed(3)}-${to[0].toFixed(3)},${to[1].toFixed(3)}`;
  if (cache[key]) return cache[key];

  let info: RouteInfo | null = null;
  try {
    const res = await fetch(`/api/route?from=${from[0]},${from[1]}&to=${to[0]},${to[1]}`, {
      cache: "force-cache",
    });
    if (res.ok) {
      const json = await res.json();
      if (typeof json?.distanceKm === "number" && typeof json?.durationMin === "number") {
        info = { distanceKm: json.distanceKm, durationMin: json.durationMin };
      }
    }
  } catch {
    /* уходим на подстраховку ниже */
  }

  if (!info) {
    // Прямая линия × 1.35 — грубая, но честная оценка по дорогам.
    const km = haversineKm(from, to) * 1.35;
    info = { distanceKm: Math.round(km), durationMin: Math.round((km / 55) * 60) };
  }

  try {
    window.localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify({ ...cache, [key]: info }));
  } catch {
    /* переполнено — не критично */
  }
  return info;
}

export default function RouteBadgeDark({
  villageCoords,
  villageName,
}: {
  villageCoords: [number, number];
  villageName: string;
}) {
  const home = useSyncExternalStore(subscribeHome, homeSnapshot, () => null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!home) return;
    let cancelled = false;
    fetchRoute(home.coords, villageCoords).then((r) => !cancelled && setRoute(r));
    return () => {
      cancelled = true;
    };
  }, [home, villageCoords]);

  const savePlace = useCallback((place: UserPlace) => {
    const rest = readJson<UserPlace[]>(PLACES_KEY, []).filter((p) => p.id !== place.id);
    const next = [place, ...rest].slice(0, 5);
    try {
      window.localStorage.setItem(PLACES_KEY, JSON.stringify(next));
    } catch {
      /* приватный режим — просто не сохраним */
    }
    emitHomeChanged();
    setOpen(false);
    setQuery("");
    setSuggestions([]);
  }, []);

  // Поиск адреса: DaData, при неудаче — Nominatim через наш /api/geocode.
  useEffect(() => {
    const q = query.trim();
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        let res = await fetch(`/api/dadata-suggest?q=${encodeURIComponent(query)}`);
        if (!res.ok) res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const json = await res.json();
        const raw: unknown[] = Array.isArray(json) ? json : (json?.suggestions ?? json?.results ?? []);
        setSuggestions(
          raw
            .map((r) => {
              const o = r as Record<string, unknown>;
              const lat = Number(o.lat ?? o.latitude);
              const lon = Number(o.lon ?? o.lng ?? o.longitude);
              const address = String(o.address ?? o.value ?? o.display_name ?? "");
              return Number.isFinite(lat) && Number.isFinite(lon) && address
                ? { address, coords: [lat, lon] as [number, number] }
                : null;
            })
            .filter((x): x is Suggestion => x !== null)
            .slice(0, 5),
        );
      } catch {
        /* сеть отвалилась — подсказок просто не будет */
      }
    }, 180);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  const useMyLocation = useCallback(async () => {
    setBusy(true);
    const finish = (coords: [number, number], address: string) => {
      savePlace({ id: "home", label: "Дом", address, coords });
      setBusy(false);
    };

    const byIp = async () => {
      try {
        const res = await fetch("/api/my-ip-location");
        const j = await res.json();
        if (typeof j?.lat === "number" && typeof j?.lon === "number") {
          finish([j.lat, j.lon], j.address ?? "Определено по IP");
          return;
        }
      } catch {
        /* ничего не поделать */
      }
      setBusy(false);
    };

    if (!navigator.geolocation) return byIp();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        let address = "Моё местоположение";
        try {
          const res = await fetch(`/api/geocode?lat=${coords[0]}&lon=${coords[1]}`);
          if (res.ok) {
            const j = await res.json();
            address = j?.address ?? j?.display_name ?? address;
          }
        } catch {
          /* оставим подпись по умолчанию */
        }
        finish(coords, address);
      },
      byIp,
      { timeout: 8000, maximumAge: 600000 },
    );
  }, [savePlace]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={home ? "Изменить адрес" : "Указать ваш адрес"}
        className="flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-transform active:scale-95"
        style={glassStyle}
      >
        <Navigation className="h-4 w-4 shrink-0 text-emerald-300" />
        {route ? (
          <span className="tabular-nums">
            {route.distanceKm} км · {route.durationMin} мин
          </span>
        ) : (
          "Дорога к мечте"
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[52px] z-50 w-[288px] max-w-[calc(100vw-24px)] rounded-[24px] p-4"
            style={glassStyle}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[14px] font-extrabold">Дорога к мечте</div>
                <div className="text-[11px] text-white/55">
                  Сколько ехать до «{villageName}»
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="-mr-1.5 -mt-1.5 grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={useMyLocation}
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 text-[13px] font-bold transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
              Моё местоположение
            </button>
            <p className="mt-1.5 text-center text-[11px] text-white/40">
              Координаты не покидают браузер
            </p>

            <div className="my-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
              <span className="h-px flex-1 bg-white/12" />
              или укажите адрес
              <span className="h-px flex-1 bg-white/12" />
            </div>

            <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 ring-1 ring-white/25">
              <Search className="h-4 w-4 shrink-0 text-white/55" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Москва, Тверская, 1"
                aria-label="Адрес вашего дома"
                className="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-white/45"
              />
            </div>

            {suggestions.length > 0 && (
              <ul className="v3-scroll mt-2 max-h-[168px] space-y-1 overflow-y-auto">
                {suggestions.map((s) => (
                  <li key={s.address}>
                    <button
                      onClick={() =>
                        savePlace({ id: "home", label: "Дом", address: s.address, coords: s.coords })
                      }
                      className="w-full rounded-xl px-3 py-2 text-left text-[12px] leading-snug text-white/75 transition-colors hover:bg-white/[0.09] hover:text-white"
                    >
                      {s.address}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {home && (
              <p className="mt-3 truncate border-t border-white/10 pt-2.5 text-[11px] text-white/40">
                Сейчас: {home.address}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
