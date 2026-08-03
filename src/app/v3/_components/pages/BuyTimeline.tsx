import {
  FileSearch,
  FileSignature,
  Home as HomeIcon,
  Lock,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { steps } from "@/lib/data";
import { glassStyle } from "../ui/primitives";
import { Reveal } from "../ui/motion";

/**
 * Вертикальный таймлайн покупки.
 *
 * Тексты шагов — из `steps` (@/lib/data), иконки и длительности — из
 * боевого `src/components/Steps.tsx` (STEP_META), один в один. Отличается
 * только палитра: на проде плитки светлые (bg-emerald-50), здесь тёмная
 * тема, поэтому те же шесть цветовых семейств взяты в 300-х тонах.
 *
 * Серверный компонент: анимацию даёт клиентский Reveal, которому хватает
 * children — лишний JS в бандл не едет.
 */
const STEP_META: {
  Icon: LucideIcon;
  duration: string;
  tone: string;
  tile: string;
}[] = [
  { Icon: Phone, duration: "5 мин", tone: "text-emerald-300", tile: "bg-emerald-400/10 ring-emerald-400/25" },
  { Icon: MapPin, duration: "1–2 дня", tone: "text-sky-300", tile: "bg-sky-400/10 ring-sky-400/25" },
  { Icon: Lock, duration: "15 мин", tone: "text-amber-300", tile: "bg-amber-400/10 ring-amber-400/25" },
  { Icon: FileSearch, duration: "1 день", tone: "text-violet-300", tile: "bg-violet-400/10 ring-violet-400/25" },
  { Icon: FileSignature, duration: "5–7 дней", tone: "text-rose-300", tile: "bg-rose-400/10 ring-rose-400/25" },
  { Icon: HomeIcon, duration: "готово!", tone: "text-green-300", tile: "bg-green-400/10 ring-green-400/25" },
];

export default function BuyTimeline() {
  return (
    <ol className="relative">
      {/* Линия таймлайна. Обрезана сверху и снизу, чтобы не торчала за
          крайние плитки. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-6 top-8 w-px -translate-x-1/2 bg-gradient-to-b from-emerald-400/50 via-white/12 to-transparent sm:left-7"
      />

      {steps.map((step, i) => {
        const meta = STEP_META[i] ?? STEP_META[0];
        const Icon = meta.Icon;

        return (
          <li key={step.number} className="relative">
            <Reveal delay={i * 0.05} className="flex gap-3 pb-3 sm:gap-5 sm:pb-4">
              {/* Плитка с иконкой сидит на линии */}
              <div className="relative shrink-0">
                {/* без backdrop-filter: внутри анимируемого по opacity
                    родителя Chromium иногда рисует его подложку не по
                    радиусу — плитка на миг становится квадратом */}
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 sm:h-14 sm:w-14 ${meta.tile}`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${meta.tone}`} strokeWidth={2.2} />
                </div>
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#0b0e13] text-[10px] font-black tabular-nums text-emerald-300 ring-1 ring-emerald-400/50">
                  {step.number}
                </span>
              </div>

              <div
                className="min-w-0 flex-1 rounded-[22px] px-4 py-4 ring-1 ring-white/[0.06] sm:px-6 sm:py-5"
                style={glassStyle}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="text-[16px] font-extrabold leading-tight sm:text-[20px]">
                    {step.title}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 ring-1 ring-white/10">
                    {meta.duration}
                  </span>
                </div>
                <p className="mt-2 max-w-[60ch] text-[13.5px] leading-relaxed text-white/55 sm:text-[15px]">
                  {step.description}
                </p>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
