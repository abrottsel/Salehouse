import { Home, MapPinned, ShieldCheck, Landmark } from "lucide-react";
import BanksRow from "@/components/BanksRow";

/**
 * TrustStrip — narrow horizontal trust band placed directly after the hero.
 * Warm Premium aesthetic: cream/white bg, emerald accent, large numerals.
 */

const metrics: {
  value: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "31", label: "посёлок", Icon: Home },
  { value: "1769+", label: "участков", Icon: MapPinned },
  { value: "5+", label: "лет на рынке", Icon: ShieldCheck },
  { value: "6.5%", label: "ипотека", Icon: Landmark },
];

export default function TrustStrip() {
  return (
    <section className="relative bg-gradient-to-b from-stone-50 via-white to-stone-50 border-y border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map(({ value, label, Icon }) => (
            <div
              key={label}
              className="group relative rounded-3xl bg-white ring-1 ring-stone-200/80 px-6 py-8 sm:py-10 text-center shadow-sm hover:shadow-xl hover:ring-emerald-300 transition-all duration-300"
            >
              <Icon className="w-6 h-6 text-emerald-500 mx-auto mb-3 opacity-80" />
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-emerald-600 leading-none tabular-nums">
                {value}
              </div>
              <div className="mt-3 text-sm sm:text-base font-semibold text-stone-600 uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Banks row — quiet, supportive */}
        <div className="mt-10 lg:mt-12">
          <BanksRow />
        </div>
      </div>
    </section>
  );
}
