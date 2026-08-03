import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { LEGAL } from "@/lib/legal";
import LocalLeadForm from "../_components/pages/LocalLeadForm";
import PageHero from "../_components/pages/PageHero";
import { Glass } from "../_components/ui/primitives";
import { Reveal } from "../_components/ui/motion";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Телефон ${LEGAL.phone}, почта ${LEGAL.email}, Telegram и MAX. Реквизиты ${LEGAL.shortName} и форма обратной связи по участкам в коттеджных посёлках Подмосковья.`,
};

const CHANNELS: {
  Icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}[] = [
  { Icon: Phone, label: "Телефон", value: LEGAL.phone, href: `tel:${LEGAL.phoneRaw}` },
  { Icon: Mail, label: "Почта", value: LEGAL.email, href: `mailto:${LEGAL.email}` },
  { Icon: Send, label: "Telegram", value: "Написать в чат", href: LEGAL.telegram, external: true },
  { Icon: MessageSquare, label: "MAX", value: "Написать в чат", href: LEGAL.max, external: true },
];

const REQUISITES = [
  { label: "Продавец", value: LEGAL.fullName },
  { label: "ИНН", value: LEGAL.inn },
  { label: "ОГРНИП", value: LEGAL.ogrn },
  { label: "Адрес", value: LEGAL.legalAddress },
];

export default function V3ContactsPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-2 sm:px-6 sm:pt-4">
      <PageHero
        eyebrow="Контакты"
        title="Как с нами"
        accent="связаться"
        sub="Телефон, почта, Telegram и MAX — выберите удобный способ. Или оставьте заявку в форме, и мы свяжемся сами."
      />

      <div className="mt-9 grid gap-4 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* Каналы связи + реквизиты */}
        <div className="space-y-4">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHANNELS.map(({ Icon, label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-3.5 rounded-[22px] bg-white/[0.04] p-4 ring-1 ring-white/[0.08] transition-all hover:-translate-y-0.5 hover:bg-white/[0.07] hover:ring-emerald-400/30 sm:p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/25 transition-colors group-hover:bg-emerald-400/20">
                    <Icon className="h-5 w-5 text-emerald-300" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                      {label}
                    </span>
                    <span className="mt-0.5 block truncate text-[15px] font-extrabold sm:text-[16px]">
                      {value}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <Glass className="p-5 ring-1 ring-white/[0.07] sm:p-7">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/40">
                Реквизиты
              </h2>
              <dl className="mt-4 space-y-3">
                {REQUISITES.map((r) => (
                  <div
                    key={r.label}
                    className="flex flex-col gap-0.5 border-b border-white/[0.07] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <dt className="shrink-0 text-[13px] text-white/45">{r.label}</dt>
                    <dd className="text-[14px] font-bold leading-snug text-white sm:text-right">
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[12px] leading-relaxed text-white/35">
                Информация на сайте носит справочный характер и не является
                публичной офертой (ст. 437 ГК РФ). Актуальные цены, площади и
                статусы участков уточняйте у менеджера.
              </p>
            </Glass>
          </Reveal>
        </div>

        {/* Форма обратной связи */}
        <Reveal delay={0.1}>
          <Glass className="p-5 ring-1 ring-white/[0.07] sm:p-7">
            <h2 className="text-[22px] font-extrabold leading-tight sm:text-[26px]">
              Напишите нам
            </h2>
            <p className="mb-5 mt-1.5 text-[13px] leading-relaxed text-white/50">
              Расскажите, какой участок ищете — площадь, бюджет, направление. Подберём
              варианты и вышлем подборку.
            </p>
            <LocalLeadForm
              submitLabel="Отправить"
              withMessage
              messageLabel="Что ищете"
              messagePlaceholder="Например: 8–10 соток, ИЖС, до 3 млн, Новорижское направление"
              note="Демонстрационная витрина: форма ничего никуда не отправляет."
            />
          </Glass>
        </Reveal>
      </div>
    </main>
  );
}
