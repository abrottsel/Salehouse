"use client";

import { useSyncExternalStore } from "react";

/**
 * Уровень эффектов под устройство.
 *
 * Пользователь выбрал «богато + автоупрощение на слабых»: на мощных
 * машинах крутим всё, а на iPhone 7/8 (iOS 15), слабых андроидах и при
 * prefers-reduced-motion падаем на лёгкий вариант. Сайт таргетит
 * safari >= 15 (см. browserslist), поэтому это не теория.
 *
 *   "full" — аврора, звёзды, параллакс, blur-слои, длинные анимации
 *   "lite" — статичный градиент вместо авроры, короткие fade, без blur
 */
export type Tier = "full" | "lite";

interface Nav extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

function detect(): Tier {
  if (typeof window === "undefined") return "lite";

  const nav = navigator as Nav;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "lite";
  if (nav.connection?.saveData) return "lite";
  if (/2g|slow-2g/.test(nav.connection?.effectiveType ?? "")) return "lite";

  // Мало ядер или мало памяти — почти наверняка старый телефон.
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return "lite";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return "lite";

  // iOS 15 и старше: Safari не отдаёт deviceMemory, ловим по версии.
  const m = navigator.userAgent.match(/OS (\d+)_/);
  if (m && Number(m[1]) < 16) return "lite";

  // backdrop-filter без префикса — грубый признак свежего движка.
  if (typeof CSS !== "undefined" && !CSS.supports?.("backdrop-filter", "blur(1px)")) return "lite";

  return "full";
}

let cached: Tier | null = null;
const noopSubscribe = () => () => {};

/**
 * Серверный снимок всегда "lite" — на сервере ни матчмедиа, ни навигатора
 * нет, и первый клиентский кадр обязан совпасть с серверным, иначе
 * гидрация ругается. Реальный уровень React подставит сразу после неё.
 * Детект считаем один раз на вкладку: он не меняется по ходу жизни.
 */
export function useTier(): Tier {
  return useSyncExternalStore(
    noopSubscribe,
    () => (cached ??= detect()),
    () => "lite" as Tier,
  );
}
