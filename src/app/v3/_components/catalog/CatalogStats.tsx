"use client";

import type { ReactNode } from "react";
import { LayoutGrid, TreePine, Wallet } from "lucide-react";
import { Counter } from "../ui/motion";
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
}: {
  icon: ReactNode;
  prefix?: string;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex h-11 items-center gap-2.5 rounded-full bg-white/[0.05] pl-1.5 pr-4 ring-1 ring-white/10">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25">
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
      <StatChip
        icon={<TreePine className="h-4 w-4" strokeWidth={2.4} />}
        value={<Counter to={STAT_VILLAGES} />}
        label={villagesWord(STAT_VILLAGES)}
      />
      <StatChip
        icon={<LayoutGrid className="h-4 w-4" strokeWidth={2.4} />}
        value={<Counter to={available} />}
        label={`${plotsWord(available)} в продаже`}
      />
      <StatChip
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
