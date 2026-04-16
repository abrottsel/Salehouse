import { steps } from "@/lib/data";
import {
  Phone,
  MapPin,
  Lock,
  FileSearch,
  FileSignature,
  Home as HomeIcon,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Steps — «Дорожная карта покупки»
 * Изюминка: горизонтальный таймлайн с соединительными линиями,
 * цветными иконками и микро-подсказкой «сколько займёт».
 * На мобиле — вертикальный с боковой линией.
 */

const STEP_META: { Icon: LucideIcon; color: string; bg: string; duration: string }[] = [
  {
    Icon: Phone,
    color: "text-emerald-600",
    bg: "bg-emerald-50 ring-emerald-200",
    duration: "5 мин",
  },
  {
    Icon: MapPin,
    color: "text-sky-600",
    bg: "bg-sky-50 ring-sky-200",
    duration: "1–2 дня",
  },
  {
    Icon: Lock,
    color: "text-amber-600",
    bg: "bg-amber-50 ring-amber-200",
    duration: "15 мин",
  },
  {
    Icon: FileSearch,
    color: "text-violet-600",
    bg: "bg-violet-50 ring-violet-200",
    duration: "1 день",
  },
  {
    Icon: FileSignature,
    color: "text-rose-600",
    bg: "bg-rose-50 ring-rose-200",
    duration: "5–7 дней",
  },
  {
    Icon: HomeIcon,
    color: "text-green-600",
    bg: "bg-green-50 ring-green-200",
    duration: "готово!",
  },
];

export default function Steps() {
  return (
    <section
      id="steps"
      className="py-6 lg:py-10 bg-gradient-to-b from-stone-50 to-white scroll-mt-16"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Как купить участок
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-2 leading-tight">
            От звонка до ключей —{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              две недели
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Шесть понятных шагов. Мы рядом на каждом — документы, юрист,
            сопровождение в Росреестре.
          </p>
        </div>

        {/* Timeline — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Desktop horizontal connector line */}
          <div className="hidden lg:block absolute top-6 left-[8%] right-[8%] h-0.5 bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-200 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-3 relative">
            {steps.map((step, i) => {
              const meta = STEP_META[i] || STEP_META[0];
              const Icon = meta.Icon;
              return (
                <div
                  key={step.number}
                  className="relative group flex flex-col items-center text-center"
                >
                  {/* Number badge */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-5 h-5 rounded-full bg-white ring-2 ring-emerald-500 text-[10px] font-black text-emerald-700 flex items-center justify-center z-10 shadow-sm">
                    {step.number}
                  </div>

                  {/* Icon circle */}
                  <div
                    className={`relative w-12 h-12 rounded-2xl ${meta.bg} ring-1 flex items-center justify-center mb-3 mt-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm`}
                  >
                    <Icon className={`w-5 h-5 ${meta.color}`} strokeWidth={2.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-black text-gray-900 mb-1 leading-tight">
                    {step.title}
                  </h3>

                  {/* Duration pill */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white ring-1 ring-gray-200 text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {meta.duration}
                  </span>

                  {/* Description */}
                  <p className="text-[11px] text-gray-600 leading-snug max-w-[180px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guarantee — compact card */}
        <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-800 p-5 sm:p-6 shadow-xl shadow-emerald-900/25">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-green-400/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mb-0.5">
                  Гарантия безопасности
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  Юридическая чистота{" "}
                  <span className="text-emerald-200">в&nbsp;договоре</span>
                </h3>
                <p className="text-xs text-emerald-100/75 mt-1">
                  Штатный юрист + сделка через Росреестр + полный пакет
                  документов на руки
                </p>
              </div>
            </div>

            <a
              href="#contacts"
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 h-11 rounded-xl font-black text-sm shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              Забронировать участок
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
