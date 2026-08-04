"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/v2/ThemeContext";

/**
 * Переключатель день/ночь для /v3.
 *
 * Механизм не свой: класс `dark` на <html> ставит анти-FOUC скрипт в корневом
 * layout (ручной выбор в localStorage `v2-theme`, иначе авто по часам), а
 * состояние и запись выбора держит боевой ThemeWrapper. Здесь только кнопка.
 *
 * Какая иконка видна, решает CSS, а не React-состояние. У ThemeWrapper на
 * первом рендере всегда dark=true, и рисовать иконку по нему значило бы
 * показать солнце на светлой странице и переставить его после гидрации.
 * Класс на <html> к этому моменту уже стоит, поэтому `dark:` разводит
 * иконки без единого лишнего кадра и без расхождения разметки.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  if (!theme) return null;

  return (
    <button
      type="button"
      onClick={theme.toggle}
      aria-label="Переключить тему: день или ночь"
      title="День / ночь"
      className={`grid shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:text-white ${className}`}
    >
      <Sun className="hidden h-[22px] w-[22px] text-amber-400 dark:block" />
      <Moon className="block h-[22px] w-[22px] text-emerald-500 dark:hidden" />
    </button>
  );
}
