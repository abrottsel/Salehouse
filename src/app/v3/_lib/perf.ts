"use client";

import { useEffect, useState } from "react";

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

  // Пороги намеренно низкие. Safari на iPhone отдаёт 4 ядра даже на свежих
  // моделях, а deviceMemory не отдаёт вовсе — прежние «<= 4» записывали в
  // слабые современные айфоны и гасили на них все эффекты.
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) return "lite";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return "lite";

  // iOS 15 и старше: Safari не отдаёт deviceMemory, ловим по версии.
  const m = navigator.userAgent.match(/OS (\d+)_/);
  if (m && Number(m[1]) < 16) return "lite";

  // Признак совсем древнего движка — отсутствие backdrop-filter в любом виде.
  // Проверять только беспрефиксный вариант нельзя: Safari до 18-й поддерживает
  // исключительно -webkit-backdrop-filter, и такая проверка записывала в
  // «слабые» все айфоны разом — то есть ровно ту платформу, где основной трафик.
  if (typeof CSS !== "undefined" && CSS.supports) {
    const hasBackdrop =
      CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)");
    if (!hasBackdrop) return "lite";
  }

  return "full";
}

let cached: Tier | null = null;

/**
 * Стартуем с "lite": на сервере ни matchMedia, ни navigator нет, а первый
 * клиентский кадр обязан совпасть с серверным, иначе ломается гидрация.
 * Настоящий уровень включаем сразу после монтирования.
 *
 * Раньше здесь стоял useSyncExternalStore с подпиской-пустышкой. Так делать
 * нельзя: подписка никогда не срабатывает, и React после гидрации не
 * пересчитывал значение — useTier() возвращал "lite" на любом устройстве,
 * и богатые эффекты не включались вообще ни у кого.
 *
 * Именно setTimeout, а не requestAnimationFrame: в фоновой вкладке кадры не
 * выдаются вовсе, и на rAF уровень так и остался бы заниженным.
 */
export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>("lite");

  useEffect(() => {
    const id = setTimeout(() => setTier((cached ??= detect())), 0);
    return () => clearTimeout(id);
  }, []);

  return tier;
}
