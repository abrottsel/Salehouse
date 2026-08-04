import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import BuyTimeline from "../_components/pages/BuyTimeline";
import PageHero from "../_components/pages/PageHero";
import { Reveal } from "../_components/ui/motion";

export const metadata: Metadata = {
  title: "Как купить участок",
  description:
    "Шесть шагов от консультации до собственности: показ участка, бронирование, проверка документов, сделка в Росреестре. Сроки на каждом шаге и юрист на всей сделке.",
};

export default function V3HowToBuyPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-2 sm:px-6 sm:pt-4">
      <PageHero
        eyebrow="Как купить участок"
        title="От звонка до ключей —"
        accent="две недели"
        sub="Шесть понятных шагов. Мы рядом на каждом — документы, юрист, сопровождение в Росреестре."
      />

      <div className="mt-6 sm:mt-8">
        <BuyTimeline />
      </div>

      {/* Баннер гарантии — по смыслу и текстам из боевого Steps.tsx */}
      <Reveal className="mt-8 sm:mt-12">
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-6 shadow-[0_30px_70px_-30px_rgba(16,185,129,0.8)] sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(163,230,53,0.35) 0%, rgba(163,230,53,0) 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(52,211,153,0.35) 0%, rgba(52,211,153,0) 70%)",
            }}
          />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                  Гарантия безопасности
                </div>
                <h2 className="text-[20px] font-black leading-tight sm:text-[26px]">
                  Юридическая чистота{" "}
                  <span className="text-emerald-200">в&nbsp;договоре</span>
                </h2>
                <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-emerald-50/75">
                  Штатный юрист + сделка через Росреестр + полный пакет
                  документов на руки
                </p>
              </div>
            </div>

            <Link
              href="/v3/contacts"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 text-[14px] font-black text-emerald-800 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-emerald-50 active:scale-[0.98]"
            >
              Забронировать участок
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
