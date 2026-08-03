"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * «Дорога к мечте» — общая механика для /v3.
 *
 * Здесь живут адрес дома и расчёт маршрута: их используют и большая
 * плашка (RouteBadgeDark на странице посёлка), и мини-чип на карточке
 * каталога (RouteChipDark). Логика одна на двоих — иначе два места
 * начнут по-разному кэшировать и по-разному округлять.
 *
 * Ключи localStorage и эндпоинты те же, что у боевого HomeDistanceBadge:
 * адрес дома переносится между версиями сайта. Боевые файлы не тронуты.
 */

export const PLACES_KEY = "zemplus_user_places";
const ROUTE_CACHE_KEY = "zemplus_route_cache_v1";

export interface UserPlace {
  id: string;
  label: string;
  address: string;
  coords: [number, number];
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
}

export function readJson<T>(key: string, fallback: T): T {
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

export function emitHomeChanged() {
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
    try {
      homeValue = raw ? ((JSON.parse(raw) as UserPlace[])[0] ?? null) : null;
    } catch {
      homeValue = null;
    }
  }
  return homeValue;
}

/** «45 мин», «2ч», «31ч 55м» — как на боевой странице. Полторы тысячи
 *  минут человек в уме не переводит, а именно это и показывалось. */
export function formatDuration(min: number): string {
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m === 0 ? `${h}ч` : `${h}ч ${m}м`;
}

export function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function fetchRoute(
  from: [number, number],
  to: [number, number],
): Promise<RouteInfo> {
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

/** Сохранить дом. Первым в списке — его и читает homeSnapshot. */
export function saveHomePlace(place: UserPlace) {
  const rest = readJson<UserPlace[]>(PLACES_KEY, []).filter((p) => p.id !== place.id);
  const next = [place, ...rest].slice(0, 5);
  try {
    window.localStorage.setItem(PLACES_KEY, JSON.stringify(next));
  } catch {
    /* приватный режим — просто не сохраним */
  }
  emitHomeChanged();
}

/**
 * Дом + маршрут до посёлка. Пока дома нет — оба null, и вызывающий
 * не рисует ничего: на проде чип тоже появляется только с адресом.
 */
export function useHomeRoute(villageCoords: [number, number]) {
  const home = useSyncExternalStore(subscribeHome, homeSnapshot, () => null);
  const [route, setRoute] = useState<RouteInfo | null>(null);

  useEffect(() => {
    if (!home) return;
    let cancelled = false;
    fetchRoute(home.coords, villageCoords).then((r) => {
      if (!cancelled) setRoute(r);
    });
    return () => {
      cancelled = true;
    };
  }, [home, villageCoords]);

  return { home, route };
}
