import { Landmark, Check } from "lucide-react";

/**
 * BanksRow — финальная версия (V8)
 * Центральный stat «от 6.5%» как якорь, банки по бокам (3 слева + 3 справа).
 * На мобиле stat сверху, банки 2x3 сеткой снизу.
 */

const banksLeft = [
  { name: "ВТБ", rate: "6.5%", dot: "#002D5F" },
  { name: "Сбер", rate: "7.0%", dot: "#1A9F29" },
  { name: "Альфа", rate: "6.9%", dot: "#EF3124" },
];

const banksRight = [
  { name: "ГПБ", rate: "6.8%", dot: "#0072C6" },
  { name: "РСХБ", rate: "6.7%", dot: "#009540" },
  { name: "Т-Банк", rate: "7.2%", dot: "#FFDD2D" },
];

function BankPill({
  name,
  rate,
  dot,
}: {
  name: string;
  rate: string;
  dot: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-white ring-1 ring-emerald-200 shadow-sm hover:ring-emerald-400 transition-colors cursor-default">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dot }}
      />
      <span className="text-[11px] font-black text-gray-900">{name}</span>
      <span className="text-[10px] text-emerald-700 font-bold tabular-nums">
        {rate}
      </span>
    </div>
  );
}

export default function BanksRow() {
  return (
    <section className="py-6 lg:py-8 bg-gradient-to-b from-white to-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap md:flex-nowrap">
          {/* Banks left (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {banksLeft.map((b) => (
              <BankPill key={b.name} {...b} />
            ))}
          </div>

          {/* Center stat — always visible */}
          <div className="flex flex-col items-center shrink-0 px-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-widest mb-1">
              <Landmark className="w-3 h-3" />
              Ипотека
            </div>
            <div className="text-2xl md:text-3xl font-black text-emerald-700 leading-none tabular-nums">
              от 6.5%
            </div>
            <div className="text-[9px] text-gray-500 font-semibold mt-0.5">
              в 6 банках РФ
            </div>
          </div>

          {/* Banks right (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {banksRight.map((b) => (
              <BankPill key={b.name} {...b} />
            ))}
          </div>

          {/* Banks all (mobile) */}
          <div className="md:hidden basis-full flex flex-wrap justify-center gap-1.5 mt-2">
            {[...banksLeft, ...banksRight].map((b) => (
              <BankPill key={b.name} {...b} />
            ))}
          </div>
        </div>

        <div className="text-center mt-4">
          <a
            href="#calculator"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
          >
            <Check className="w-3 h-3" />
            Рассчитать платёж →
          </a>
        </div>
      </div>
    </section>
  );
}
