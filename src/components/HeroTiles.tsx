import {
  TreePine,
  CalendarCheck,
  Calculator,
  Star,
  ListChecks,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { villages } from "@/lib/data";

/**
 * HeroTiles — Avito-style tile hero for the main route (/).
 *
 * Layout: full-bleed photo background + dark overlay, with headline and a
 * 4×2 tile grid (1 wide primary + 6 regular) on top. Fits in one `min-h-svh`
 * viewport on desktop and mobile.
 *
 * Server Component.
 */

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const VILLAGE_COUNT = villages.length;
const PLOTS_AVAILABLE = villages.reduce(
  (s, v) => s + (v.plotsAvailable || 0),
  0
);
const PLOTS_AVAILABLE_FMT = PLOTS_AVAILABLE.toLocaleString("ru-RU");
const VILLAGE_LABEL = plural(VILLAGE_COUNT, "посёлок", "посёлка", "посёлков");

interface HeroTile {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Tailwind class for the icon background. */
  iconBg: string;
  wide?: boolean;
}

const tiles: HeroTile[] = [
  {
    href: "#catalog",
    Icon: TreePine,
    title: "Каталог посёлков",
    subtitle: `${VILLAGE_COUNT} ${VILLAGE_LABEL} · ${PLOTS_AVAILABLE_FMT}+ участков`,
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-600",
    wide: true,
  },
  {
    href: "#contacts",
    Icon: CalendarCheck,
    title: "Записаться на просмотр",
    subtitle: "Бесплатно, с выездом",
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-600",
  },
  {
    href: "#calculator",
    Icon: Calculator,
    title: "Ипотека от 6.5%",
    subtitle: "Расчёт за 30 секунд",
    iconBg: "bg-gradient-to-br from-sky-400 to-cyan-600",
  },
  {
    href: "#advantages",
    Icon: Star,
    title: "Преимущества",
    subtitle: "Почему выбирают нас",
    iconBg: "bg-gradient-to-br from-sky-400 to-cyan-600",
  },
  {
    href: "#steps-block",
    Icon: ListChecks,
    title: "Как купить",
    subtitle: "6 шагов до ключей",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
  },
  {
    href: "#faq-block",
    Icon: HelpCircle,
    title: "Частые вопросы",
    subtitle: "Ответы на главное",
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
  },
  {
    href: "#reviews-block",
    Icon: MessageSquare,
    title: "Отзывы",
    subtitle: "От наших клиентов",
    iconBg: "bg-gradient-to-br from-rose-400 to-pink-600",
  },
];

export default function HeroTiles() {
  return (
    <section
      className="relative min-h-svh overflow-hidden flex bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/hero-home.jpg)" }}
    >
      {/* Dark overlay — readable text without killing the photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/65" />

      {/* Subtle bottom fade to white so next section transitions smoothly */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 flex flex-col justify-center min-h-svh">
        {/* Headline */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight">
            Ваш участок
            <br />
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
              для жизни мечты
            </span>
          </h1>
        </div>

        {/* Tile grid: 2 cols mobile / 4 cols desktop; 7 tiles with 1 wide (2×) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          {tiles.map((tile) => (
            <a
              key={tile.title}
              href={tile.href}
              className={`group relative overflow-hidden rounded-[22px] p-3.5 sm:p-4 lg:p-5 hero-glass-tile hover:-translate-y-0.5 transition-all duration-300 ${
                tile.wide ? "col-span-2 lg:col-span-2 flex flex-col items-center text-center" : ""
              }`}
              style={{
                backdropFilter: "blur(1px) saturate(2)",
                WebkitBackdropFilter: "blur(1px) saturate(2)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
                boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 8px 32px -4px rgba(0,0,0,0.25)",
              }}
            >
              {/* Top specular highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.45] to-transparent" />

              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-[14px] ${tile.iconBg} flex items-center justify-center mb-2.5 sm:mb-3`}
                style={{ boxShadow: "0 4px 16px -2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)" }}
              >
                <tile.Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
              </div>

              <div className="text-white text-sm sm:text-base font-semibold leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                {tile.title}
              </div>
              {tile.subtitle && (
                <div className="text-white/70 text-[11px] sm:text-xs mt-1 leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                  {tile.subtitle}
                </div>
              )}

              <ArrowRight className={`absolute top-4 right-4 w-4 h-4 text-white/25 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white/60 transition-all duration-200 ${tile.wide ? "hidden" : ""}`} />
            </a>
          ))}
        </div>
      </div>
      {/* Rainbow border for liquid glass tiles */}
      <style>{`
        .hero-glass-tile {
          position: relative;
        }
        .hero-glass-tile::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(
            from 0deg,
            rgba(255,0,0,0.4),
            rgba(255,165,0,0.4),
            rgba(255,255,0,0.3),
            rgba(0,255,0,0.3),
            rgba(0,200,255,0.4),
            rgba(100,100,255,0.4),
            rgba(200,0,255,0.4),
            rgba(255,0,0,0.4)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
