/**
 * Цветные акценты светлой темы.
 *
 * Приём с боевого сайта: днём иконки групп разного цвета — зелёная, синяя,
 * оранжевая, фиолетовая, розовая, каждая на своей пастельной плашке. Именно
 * это оживляет светлую тему; без него страница получается монохромно-зелёной.
 *
 * Ночная тема не меняется. Везде, где сейчас стоит emerald, он и остаётся:
 * каждый тон дублируется `dark:`-вариантом обратно в зелёный, а `dark:`
 * в этом проекте — класс на <html> (см. @custom-variant в globals.css),
 * и по специфичности он перебивает базовый.
 *
 * Оттенки -300 днём подменяются на -600/-700 переменными в v3.css, поэтому
 * текст на пастельной плашке читается без отдельных правок.
 */

const DARK_PLATE = "dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25";
const DARK_INK = "dark:text-emerald-300";

/** Плашка под иконку: заливка + цвет иконки + кольцо. Класс `ring-1` — на месте. */
export const plate = {
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  sky: `bg-sky-500/15 text-sky-300 ring-sky-400/25 ${DARK_PLATE}`,
  amber: `bg-amber-500/15 text-amber-300 ring-amber-400/30 ${DARK_PLATE}`,
  violet: `bg-violet-500/15 text-violet-300 ring-violet-400/25 ${DARK_PLATE}`,
  rose: `bg-rose-500/15 text-rose-300 ring-rose-400/25 ${DARK_PLATE}`,
} as const;

/** Только цвет иконки — там, где плашки нет и заводить её незачем. */
export const ink = {
  emerald: "text-emerald-300",
  sky: `text-sky-300 ${DARK_INK}`,
  amber: `text-amber-300 ${DARK_INK}`,
  violet: `text-violet-300 ${DARK_INK}`,
  rose: `text-rose-300 ${DARK_INK}`,
} as const;

export type ToneName = keyof typeof plate;
