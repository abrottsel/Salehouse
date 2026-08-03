import {
  FileSearch,
  FileSignature,
  Home as HomeIcon,
  Lock,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";

/**
 * Оформление шагов покупки. Иконки и подписи «сколько займёт» — один в один
 * из боевого src/components/Steps.tsx (STEP_META). Сами тексты шагов живут
 * в `steps` (@/lib/data) и здесь не дублируются.
 *
 * Цвет каждого шага задан дважды: классами Tailwind (статичная строка, чтобы её
 * видел сборщик) и hex — для inline-подложек, рамок и свечений: их считаем
 * от состояния шага, а Tailwind динамические классы не собирает.
 */
export interface StepMeta {
  Icon: LucideIcon;
  duration: string;
  /** цвет иконки */
  tone: string;
  /** тот же цвет в hex — для box-shadow и radial-gradient */
  hex: string;
}

export const STEP_META: StepMeta[] = [
  {
    Icon: Phone,
    duration: "5 мин",
    tone: "text-emerald-300",
    hex: "#34d399",
  },
  {
    Icon: MapPin,
    duration: "1–2 дня",
    tone: "text-sky-300",
    hex: "#38bdf8",
  },
  {
    Icon: Lock,
    duration: "15 мин",
    tone: "text-amber-300",
    hex: "#fbbf24",
  },
  {
    Icon: FileSearch,
    duration: "1 день",
    tone: "text-violet-300",
    hex: "#a78bfa",
  },
  {
    Icon: FileSignature,
    duration: "5–7 дней",
    tone: "text-rose-300",
    hex: "#fb7185",
  },
  {
    Icon: HomeIcon,
    duration: "готово!",
    tone: "text-green-300",
    hex: "#4ade80",
  },
];

/** Метаданные шага с подстраховкой: данных всегда шесть, но индекс из data.ts. */
export const metaFor = (i: number): StepMeta => STEP_META[i] ?? STEP_META[0];
