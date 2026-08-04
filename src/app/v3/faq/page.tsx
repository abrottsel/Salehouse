import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { LEGAL } from "@/lib/legal";
import FaqAccordion from "../_components/pages/FaqAccordion";
import PageHero from "../_components/pages/PageHero";
import { faqItems } from "../_components/pages/faq-data";
import { Glass } from "../_components/ui/primitives";
import { Reveal } from "../_components/ui/motion";

export const metadata: Metadata = {
  title: "Вопросы и ответы",
  description:
    "Юридическая чистота, ИЖС и СНТ, ипотека и рассрочка, прописка, коммуникации, сделка через Росреестр — восемь ответов на то, что спрашивают чаще всего при покупке участка.",
};

/**
 * FAQPage-разметка для rich-сниппетов Google. На проде она уже стоит
 * (FAQv2), и при замене прода витриной терять её нельзя — поэтому
 * генерится из того же массива, что и видимый аккордеон.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function V3FaqPage() {
  return (
    <main className="mx-auto max-w-[920px] px-4 pt-2 sm:px-6 sm:pt-4">
      <PageHero
        eyebrow="Частые вопросы"
        title="Всё, что обычно"
        accent="спрашивают"
        sub="Нет вашего вопроса — позвоните, ответим развёрнуто и без воды."
      />

      <div className="mt-6 sm:mt-8">
        <FaqAccordion />
      </div>

      <Reveal className="mt-8 sm:mt-12">
        <Glass className="p-6 ring-1 ring-white/[0.07] sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-[22px] font-extrabold leading-tight sm:text-[28px]">
                Остался вопрос?
              </h2>
              <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-white/55">
                Позвоните — разберём вашу ситуацию по конкретному участку, без
                скриптов и общих слов.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={`tel:${LEGAL.phoneRaw}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-[14px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
              >
                <Phone className="h-4 w-4" />
                {LEGAL.phone}
              </a>
              <Link
                href="/v3/contacts"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.07] px-6 text-[14px] font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.13]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-300" />
                Написать
              </Link>
            </div>
          </div>
        </Glass>
      </Reveal>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
