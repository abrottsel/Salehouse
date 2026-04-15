/**
 * Hidden fees / дополнительные расходы beyond the price per sotka.
 *
 * Background: our main competitor (zemexx.ru) does NOT show these
 * costs anywhere in the UI — they leak out only after the sale is
 * booked. That leaves the buyer surprised by extra expenses later.
 *
 * Our angle: full transparency in the plot card. Each fee is either
 * "included" in the plot price (green checkmark, 0 ₽) or "at your
 * expense" (grey pill, range or fixed price, with an authoritative
 * source link).
 *
 * The list here is a reasonable default for ИЖС in Moscow region,
 * 2026 прайс-листы Росреестра / МОЭСК / Мособлгаза. Individual
 * villages can override any line by passing a partial list through
 * the component props.
 */

export type FeeGroupId = "paperwork" | "utilities" | "village";

export interface HiddenFee {
  /** Stable id for React key and optional per-village override */
  id: string;
  /** Which visual group the fee belongs to */
  group: FeeGroupId;
  /** Human-readable label shown in the UI */
  label: string;
  /** Short supporting copy under the label */
  hint?: string;
  /**
   * Included = fully covered by the plot price, shown with a green
   * checkmark and 0 ₽. false means the buyer pays separately.
   */
  included: boolean;
  /** Fixed ruble amount if known */
  priceRub?: number;
  /** Range [min, max] in rubles when price varies */
  priceRange?: [number, number];
  /** Optional trailing unit ("в год", "разово", "₽/мес") */
  unit?: string;
  /** Link to the source of the number (Rosreestr, MOESK, ...) */
  source?: { label: string; url: string };
}

export const FEE_GROUPS: { id: FeeGroupId; title: string; emoji: string }[] = [
  { id: "paperwork", title: "Оформление сделки", emoji: "📄" },
  { id: "utilities", title: "Коммуникации", emoji: "⚡" },
  { id: "village", title: "Посёлок", emoji: "🏡" },
];

export const DEFAULT_HIDDEN_FEES: HiddenFee[] = [
  // ── Paperwork ────────────────────────────────────────────────────
  {
    id: "rosreestr-electronic",
    group: "paperwork",
    label: "Электронная регистрация права",
    hint: "Росреестр, без нотариуса и госпошлины",
    included: true,
    source: { label: "Росреестр", url: "https://rosreestr.gov.ru/" },
  },
  {
    id: "rosreestr-gosposhlina",
    group: "paperwork",
    label: "Госпошлина Росреестра",
    hint: "Для физлица, ИЖС",
    included: false,
    priceRub: 2000,
    unit: "разово",
    source: { label: "Росреестр", url: "https://rosreestr.gov.ru/" },
  },
  {
    id: "boundary-mark",
    group: "paperwork",
    label: "Вынос границ в натуру",
    hint: "Закрепление межевых знаков на местности",
    included: false,
    priceRange: [8000, 15000],
    unit: "разово",
  },

  // ── Utilities ────────────────────────────────────────────────────
  {
    id: "electricity-15kw",
    group: "utilities",
    label: "Электричество 15 кВт",
    hint: "Льготное технологическое присоединение",
    included: false,
    priceRange: [50000, 80000],
    unit: "под ключ",
    source: {
      label: "Россети МР",
      url: "https://rossetimr.ru/",
    },
  },
  {
    id: "gas-connection",
    group: "utilities",
    label: "Газ — техусловия + врезка",
    hint: "Программа догазификации Мособлгаза",
    included: false,
    priceRange: [150000, 400000],
    unit: "под ключ",
    source: {
      label: "Мособлгаз",
      url: "https://mosoblgaz.ru/",
    },
  },
  {
    id: "water-septic",
    group: "utilities",
    label: "Скважина + септик",
    hint: "Автономная вода и канализация",
    included: false,
    priceRange: [100000, 250000],
    unit: "под ключ",
  },

  // ── Village ──────────────────────────────────────────────────────
  {
    id: "village-entry",
    group: "village",
    label: "Вступительный взнос в ТСН",
    hint: "Разово при оформлении собственности",
    included: false,
    priceRange: [0, 50000],
    unit: "разово",
  },
  {
    id: "village-membership",
    group: "village",
    label: "Членский взнос",
    hint: "Обслуживание дорог, вывоз мусора, охрана",
    included: false,
    priceRange: [2000, 5000],
    unit: "₽/мес",
  },
  {
    id: "village-road",
    group: "village",
    label: "Подъездная дорога",
    hint: "Асфальт до участка",
    included: true,
  },
];

/**
 * Format a fee's price as a short display string.
 * Examples: "0 ₽", "2 000 ₽", "50 000 – 80 000 ₽", "2–5 тыс ₽/мес".
 */
export function formatFeePrice(fee: HiddenFee): string {
  if (fee.included) return "0 ₽";
  if (typeof fee.priceRub === "number") {
    return `${fee.priceRub.toLocaleString("ru-RU")} ₽${fee.unit ? " " + fee.unit : ""}`;
  }
  if (fee.priceRange) {
    const [lo, hi] = fee.priceRange;
    if (lo === 0 && hi > 0) {
      return `до ${hi.toLocaleString("ru-RU")} ₽${fee.unit ? " " + fee.unit : ""}`;
    }
    return `${lo.toLocaleString("ru-RU")} – ${hi.toLocaleString("ru-RU")} ₽${
      fee.unit ? " " + fee.unit : ""
    }`;
  }
  return fee.unit ?? "";
}

/**
 * Compute a rough total "at your expense" sum for a fee list.
 * Uses the middle of the range when the exact price isn't known.
 * Only counts "разово" / "под ключ" / no-unit items to get a
 * one-off budget estimate, not recurring ₽/мес lines.
 */
export function estimateOneOffTotal(fees: HiddenFee[]): {
  low: number;
  high: number;
} {
  let low = 0;
  let high = 0;
  for (const f of fees) {
    if (f.included) continue;
    if (f.unit && /мес|год/i.test(f.unit)) continue;
    if (typeof f.priceRub === "number") {
      low += f.priceRub;
      high += f.priceRub;
    } else if (f.priceRange) {
      low += f.priceRange[0];
      high += f.priceRange[1];
    }
  }
  return { low, high };
}
