import { TreePine, ArrowRight } from "lucide-react";
import { villages } from "@/lib/data";

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const VILLAGE_COUNT = villages.length;
const PLOTS_AVAILABLE = villages.reduce((s, v) => s + (v.plotsAvailable || 0), 0);
const PLOTS_FMT = PLOTS_AVAILABLE.toLocaleString("ru-RU");
const LABEL = plural(VILLAGE_COUNT, "посёлок", "посёлка", "посёлков");

const title = "Каталог посёлков";
const subtitle = `${VILLAGE_COUNT} ${LABEL} · ${PLOTS_FMT}+ участков`;

interface Variant {
  name: string;
  note: string;
  titleCls: string;
  subtitleCls: string;
}

const variants: Variant[] = [
  {
    name: "V0 — текущий прод (откат)",
    note: "Базовая версия. Title: text-sm sm:text-base font-semibold. Subtitle: text-[11px] sm:text-xs text-white/70.",
    titleCls: "text-white text-sm sm:text-base font-semibold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
    subtitleCls: "text-white/70 text-[11px] sm:text-xs mt-1 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
  },
  {
    name: "V1 — только цвет/вес (без увеличения)",
    note: "Размеры прод, подпись белая + semibold. Title prod. Subtitle: text-[11px] sm:text-xs font-semibold text-white/90.",
    titleCls: "text-white text-sm sm:text-base font-semibold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
    subtitleCls: "text-white/90 text-[11px] sm:text-xs font-semibold mt-1 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
  },
  {
    name: "V2 — мягкое увеличение",
    note: "Title: text-sm sm:text-base font-bold. Subtitle: text-xs sm:text-sm font-medium text-white/85.",
    titleCls: "text-white text-sm sm:text-base font-bold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
    subtitleCls: "text-white/85 text-xs sm:text-sm font-medium mt-1 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
  },
  {
    name: "V3 — среднее (+1 шаг)",
    note: "Title: text-base sm:text-lg font-bold. Subtitle: text-xs sm:text-sm font-semibold text-white/90.",
    titleCls: "text-white text-base sm:text-lg font-bold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
    subtitleCls: "text-white/90 text-xs sm:text-sm font-semibold mt-1 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
  },
  {
    name: "V4 — жирный был (слишком)",
    note: "Title: text-base sm:text-lg font-bold. Subtitle: text-sm sm:text-base font-bold text-white.",
    titleCls: "text-white text-base sm:text-lg font-bold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
    subtitleCls: "text-white text-sm sm:text-base font-bold mt-1.5 leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
  },
];

function Tile({ titleCls, subtitleCls }: { titleCls: string; subtitleCls: string }) {
  return (
    <a
      href="#"
      className="group relative overflow-hidden rounded-[22px] p-3.5 sm:p-4 lg:p-5 xl:p-6 hover:-translate-y-0.5 transition-all duration-300 col-span-2 lg:col-span-2 flex flex-col items-center text-center hero-glass-tile-wide"
      style={{
        backdropFilter: "blur(1px) saturate(2)",
        WebkitBackdropFilter: "blur(1px) saturate(2)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
        boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 8px 32px -4px rgba(0,0,0,0.25)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.45] to-transparent" />
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-[14px] bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-2.5 sm:mb-3"
        style={{ boxShadow: "0 4px 16px -2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)" }}
      >
        <TreePine className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
      </div>
      <div className={titleCls}>{title}</div>
      <div className={subtitleCls}>{subtitle}</div>
      <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-white/25 opacity-0 hidden" />
    </a>
  );
}

export default function PreviewHeroFonts() {
  return (
    <main className="min-h-screen bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Hero Tile Fonts — варианты</h1>
          <p className="text-white/70 text-sm">
            Пять вариантов размера/веса шрифта плитки «Каталог посёлков». V0 — текущий прод. V4 — перестарался.
            Меняется <strong>только шрифт</strong> (размер, вес, цвет). Стекло/рамка/тени плитки не меняются.
          </p>
        </header>

        <div className="space-y-8">
          {variants.map((v) => (
            <section
              key={v.name}
              className="relative rounded-2xl overflow-hidden bg-cover bg-center border border-white/10"
              style={{ backgroundImage: "url(/hero-home.jpg)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/65" />

              <div className="relative z-10 p-5 sm:p-6">
                <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-lg sm:text-xl font-bold">{v.name}</div>
                    <div className="text-[11px] sm:text-xs text-white/60 mt-0.5 font-mono">{v.note}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                  <Tile titleCls={v.titleCls} subtitleCls={v.subtitleCls} />
                </div>
              </div>
            </section>
          ))}
        </div>

        <style>{`
          .hero-glass-tile-wide {
            position: relative;
          }
          .hero-glass-tile-wide::before {
            content: '';
            position: absolute;
            inset: -3px;
            border-radius: inherit;
            padding: 3px;
            background: conic-gradient(
              from 45deg,
              rgba(255,255,255,0.85),
              rgba(180,255,180,0.7),
              rgba(255,255,255,0.6),
              rgba(180,220,255,0.7),
              rgba(255,255,255,0.85),
              rgba(255,200,180,0.7),
              rgba(255,255,255,0.6),
              rgba(200,180,255,0.7),
              rgba(255,255,255,0.85)
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
        `}</style>
      </div>
    </main>
  );
}
