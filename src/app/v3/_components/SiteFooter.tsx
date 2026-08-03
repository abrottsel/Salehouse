"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Mail, Phone } from "lucide-react";
import { LEGAL } from "@/lib/legal";

/**
 * Подвал /v3.
 *
 * Взято у боевого src/components/Footer.tsx (он плотнее и содержательнее):
 *   • карточка со скруглением + градиентная emerald→teal полоса сверху;
 *   • настоящие логотипы Telegram и MAX, а не «ещё одна ссылка текстом»;
 *   • клик по почте открывает почтовик И молча кладёт адрес в буфер —
 *     на телефонах без почтового клиента ссылка иначе просто мертва;
 *   • тонкая legal-строка внизу: реквизиты · документы · дисклеймер.
 *
 * Обязательные юридические блоки (реквизиты из @/lib/legal, /privacy,
 * /oferta, «не является публичной офертой») сохранены: /v3 готовится
 * в замену проду, терять их нельзя.
 *
 * Год — константа: new Date() в рендере разъезжается между сервером
 * и клиентом.
 */

const YEAR = 2026;

const SECTIONS = [
  { href: "/v3/catalog", label: "Каталог посёлков" },
  { href: "/v3/mortgage", label: "Ипотека и рассрочка" },
  { href: "/v3/how-to-buy", label: "Как купить" },
  { href: "/v3/reviews", label: "Отзывы" },
  { href: "/v3/faq", label: "Вопросы и ответы" },
  { href: "/v3/favorites", label: "Избранное" },
  { href: "/v3/contacts", label: "Контакты" },
];

const REQUISITES = [
  { label: "Продавец", value: LEGAL.fullName },
  { label: "ИНН", value: LEGAL.inn },
  { label: "ОГРНИП", value: LEGAL.ogrn },
  { label: "Адрес", value: LEGAL.legalAddress },
];

export default function SiteFooter() {
  const [copied, setCopied] = useState(false);

  /** Не preventDefault: mailto обязан отработать, копия — подстраховка. */
  const copyEmail = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(LEGAL.email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* insecure context — остаётся обычное поведение mailto */
    }
  };

  return (
    <footer className="mt-24 px-3 pb-4 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="overflow-hidden rounded-[28px] bg-[#0e131b] ring-1 ring-white/10">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300" />

          <div className="grid gap-10 px-5 py-9 sm:px-7 sm:py-11 md:grid-cols-2 lg:grid-cols-[1.15fr_0.8fr_1.05fr] lg:gap-12">
            {/* Бренд + быстрые контакты */}
            <div>
              <div className="flex items-center gap-2.5 text-[19px] font-extrabold tracking-tight">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_8px_24px_-10px_rgba(16,185,129,0.9)]">
                  З
                </span>
                {LEGAL.brand}
              </div>

              <p className="mt-4 max-w-[44ch] text-[14px] leading-relaxed text-white/50">
                Земельные участки в коттеджных посёлках Подмосковья: газ,
                электричество, асфальтированные дороги и охрана. Показываем
                живые остатки и помогаем с документами.
              </p>

              <a
                href={`tel:${LEGAL.phoneRaw}`}
                className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-full bg-emerald-500 px-5 text-[15px] font-extrabold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-all hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98]"
              >
                <Phone className="h-4 w-4" />
                {LEGAL.phone}
              </a>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${LEGAL.email}`}
                  onClick={copyEmail}
                  title={copied ? "Скопировано в буфер" : `Написать · ${LEGAL.email}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-bold text-white/80 ring-1 ring-white/12 transition-colors hover:bg-white/[0.12] hover:text-white"
                >
                  {copied ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                  ) : (
                    <Mail className="h-4 w-4 shrink-0 text-emerald-300" />
                  )}
                  {LEGAL.email}
                  {!copied && <Copy className="h-3.5 w-3.5 shrink-0 text-white/30" />}
                </a>

                <a
                  href={LEGAL.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-bold text-white/80 ring-1 ring-white/12 transition-colors hover:bg-white/[0.12] hover:text-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/telegram-logo.png"
                    alt=""
                    className="h-5 w-5 shrink-0 rounded-md"
                  />
                  Telegram
                </a>

                <a
                  href={LEGAL.max}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="MAX Messenger"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-bold text-white/80 ring-1 ring-white/12 transition-colors hover:bg-white/[0.12] hover:text-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/max-logo.png" alt="" className="h-5 w-5 shrink-0 rounded-md" />
                  MAX
                </a>
              </div>

            </div>

            {/* Разделы */}
            <nav aria-label="Разделы сайта">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Разделы
              </h2>
              <ul className="space-y-0.5 text-[14px]">
                {SECTIONS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="-ml-2 inline-flex min-h-[40px] items-center rounded-lg px-2 text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Реквизиты + документы. На планшете сетка двухколоночная, и
                реквизиты растягиваем на всю ширину — иначе в правой
                колонке второго ряда остаётся дыра. */}
            <div className="md:col-span-2 lg:col-span-1">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                Реквизиты
              </h2>
              <dl className="space-y-2.5">
                {REQUISITES.map((r) => (
                  <div
                    key={r.label}
                    className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2.5 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <dt className="shrink-0 text-[12px] text-white/35">{r.label}</dt>
                    <dd className="text-[13px] font-semibold leading-snug text-white/75 sm:text-right">
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/privacy"
                  className="inline-flex min-h-[40px] items-center rounded-full bg-white/[0.05] px-3.5 text-[12px] font-semibold text-white/60 ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] hover:text-white"
                >
                  Политика конфиденциальности
                </Link>
                <Link
                  href="/oferta"
                  className="inline-flex min-h-[40px] items-center rounded-full bg-white/[0.05] px-3.5 text-[12px] font-semibold text-white/60 ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] hover:text-white"
                >
                  Публичная оферта
                </Link>
              </div>
            </div>
          </div>

          {/* Legal-строка */}
          <div className="border-t border-white/[0.07] px-5 py-5 sm:px-7">
            <p className="text-[12px] leading-relaxed text-white/35">
              Информация на сайте носит справочный характер и не является
              публичной офертой (ст. 437 ГК РФ). Актуальные цены, площади и
              статусы участков уточняйте у менеджера.
            </p>
            <p className="mt-2 text-[12px] text-white/30">
              © {YEAR} {LEGAL.shortName} · ИНН {LEGAL.inn} · ОГРНИП {LEGAL.ogrn} ·{" "}
              {LEGAL.domain}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
