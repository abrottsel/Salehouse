"use client";

import type { ReactNode } from "react";
import { LayoutGrid, TreePine, Wallet } from "lucide-react";
import { Counter } from "../ui/motion";
import { plate, type ToneName } from "../tones";
import {
  STAT_PLOTS_AVAILABLE,
  STAT_PRICE_MIN,
  STAT_VILLAGES,
  plotsWord,
  villagesWord,
} from "./data";

function StatChip({
  icon,
  prefix,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  prefix?: string;
  value: ReactNode;
  label: string;
  tone: ToneName;
}) {
  return (
    <div className="inline-flex h-11 items-center gap-2.5 rounded-full bg-white/[0.05] pl-1.5 pr-4 ring-1 ring-white/10">
      <span className={`grid h-8 w-8 place-items-center rounded-full ring-1 ${plate[tone]}`}>
        {icon}
      </span>
      {prefix && <span className="text-[12px] font-semibold text-white/45">{prefix}</span>}
      <span className="text-[15px] font-extrabold text-white">{value}</span>
      <span className="text-[12px] font-semibold text-white/45">{label}</span>
    </div>
  );
}

/** Три цифры шапки каталога — все считаются из data.ts, не выдуманы. */
export default function CatalogStats({ plotsAvailable }: { plotsAvailable?: number } = {}) {
  const available = plotsAvailable ?? STAT_PLOTS_AVAILABLE;
  return (
    <div className="flex flex-wrap gap-2.5">
      {/* Три тона, как в шапке боевого каталога: посёлки — зелёный,
          участки — синий, цена — оранжевый. */}
      <StatChip
        tone="emerald"
        icon={<TreePine className="h-4 w-4" strokeWidth={2.4} />}
        value={<Counter to={STAT_VILLAGES} />}
        label={villagesWord(STAT_VILLAGES)}
      />
      <StatChip
        tone="sky"
        icon={<LayoutGrid className="h-4 w-4" strokeWidth={2.4} />}
        value={<Counter to={available} />}
        label={`${plotsWord(available)} в продаже`}
      />
      <StatChip
        tone="amber"
        icon={<Wallet className="h-4 w-4" strokeWidth={2.4} />}
        prefix="от"
        value={
          <>
            <Counter to={STAT_PRICE_MIN} /> ₽
          </>
        }
        label="за сотку"
      />
    </div>
  );
}
