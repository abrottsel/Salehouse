"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, Check } from "lucide-react";
import { LEGAL } from "@/lib/legal";

/**
 * Подвал /v3 — перенос боевого src/components/Footer.tsx.
 *
 * Предыдущая версия была высокой трёхколоночной простынёй, заказчик
 * сказал, что на проде лучше. Здесь та же компактная карточка: одна
 * строка «логотип · навигация · контакты», под ней тонкая юридическая
 * полоска и дисклеймер. Отличие от прода одно: ссылки ведут внутрь /v3.
 * Карточка тёмная в обеих темах — как на боевом сайте.
 *
 * Год — константа: new Date() в рендере разъезжается между сервером
 * и клиентом.
 */

const YEAR = 2026;
const LEGAL_LINE = `© ${YEAR} ${LEGAL.shortName} · ИНН ${LEGAL.inn} · ОГРНИП ${LEGAL.ogrn}`;

const NAV = [
  { href: "/v3/catalog", label: "Посёлки" },
  { href: "/v3/mortgage", label: "Ипотека" },
  { href: "/v3/how-to-buy", label: "Как купить" },
  { href: "/v3/reviews", label: "Отзывы" },
  { href: "/v3/contacts", label: "Контакты" },
];

export default function SiteFooter() {
  const [emailCopied, setEmailCopied] = useState(false);

  /** Тап по почте открывает почтовик И молча кладёт адрес в буфер: на
   *  телефонах без почтового клиента ссылка иначе просто мертва.
   *  preventDefault не делаем — mailto обязан отработать. */
  const handleEmailClick = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(LEGAL.email);
        setEmailCopied(true);
        window.setTimeout(() => setEmailCopied(false), 1500);
      }
    } catch {
      /* insecure context — остаётся обычное поведение mailto */
    }
  };

  // pt-8 = 32px: заказчик просил зазор до подвала не больше сантиметра,
  // а это примерно 38px. Отступ общий для всех страниц /v3, поэтому свой
  // нижний отступ страницы больше не держат.
  return (
    // data-float-guard — плавающие мессенджеры уходят, когда доезжают
    // до подвала (см. FloatingMessengers).
    <footer data-float-guard className="pb-4 pt-8">
      <div className="mx-auto max-w-[1920px] px-3 sm:px-4 lg:px-6">
        {/* v3-on-dark — подвал остаётся тёмной карточкой и в дневной теме
            (как на проде): переменные палитры внутри него не подменяются. */}
        <div className="v3-on-dark overflow-hidden rounded-3xl bg-[#121821] text-white ring-1 ring-white/10">
          {/* Тонкая emerald→teal градиентная полоса сверху */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

          {/* Главная строка: логотип · навигация · контакты */}
          <div className="flex flex-col items-start gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-center md:gap-6">
            <div className="flex shrink-0 items-center gap-2">
              <svg viewBox="0 0 44 40" className="h-[26px] w-7" fill="none" aria-hidden="true">
                <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
                <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
                <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
              </svg>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Зем<span className="text-emerald-400">+</span>Плюс
              </span>
            </div>

            {/* Прижата к логотипу, как в шапке. Раньше растягивалась на всю ширину
                (md:flex-1 + justify-center) и висела посреди пустоты. */}
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-300 md:mr-auto">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Контакты — цели тапа не меньше 44px */}
            <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 text-sm sm:gap-x-2">
              {/* Только трубка, как в шапке: номер длинный и растягивал ряд.
                  Сам номер остаётся на /v3/contacts и в мобильном меню,
                  плюс подсказкой при наведении. */}
              <a
                href={`tel:${LEGAL.phoneRaw}`}
                aria-label={`Позвонить ${LEGAL.phone}`}
                title={LEGAL.phone}
                className="inline-flex items-center justify-center p-1.5 text-emerald-400 transition-colors hover:text-emerald-300"
              >
                <Phone className="h-5 w-5" />
              </a>

              <a
                href={`mailto:${LEGAL.email}`}
                onClick={handleEmailClick}
                aria-label={
                  emailCopied ? `Скопировано: ${LEGAL.email}` : `Написать на ${LEGAL.email}`
                }
                title={emailCopied ? "Скопировано в буфер" : `Написать · ${LEGAL.email}`}
                className="inline-flex items-center justify-center p-1.5 text-red-400 transition-colors hover:text-red-300"
              >
                {emailCopied ? (
                  <Check className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </a>

              <a
                href={LEGAL.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="inline-flex items-center justify-center p-1.5 transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/telegram-logo.png"
                  alt="Telegram"
                  className="h-5 w-5 rounded-md bg-gradient-to-br from-[#2AABEE] to-[#229ED9]"
                />
              </a>

              <a
                href={LEGAL.max}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MAX Messenger"
                className="inline-flex items-center justify-center p-1.5 transition-opacity hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/max-logo.png" alt="MAX" className="h-5 w-5 rounded-md" />
              </a>
            </div>
          </div>

          {/* Тонкая legal-полоска: реквизиты · ссылки */}
          <div className="-mt-1 flex flex-col justify-between gap-2 px-5 pb-4 text-[11px] text-gray-500 sm:flex-row sm:items-center sm:px-6">
            <span>{LEGAL_LINE}</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/v3/privacy" className="transition-colors hover:text-gray-300">
                Политика
              </Link>
              <span className="opacity-40">·</span>
              <Link href="/v3/oferta" className="transition-colors hover:text-gray-300">
                Оферта
              </Link>
              <span className="opacity-40">·</span>
              <Link href="/v3/contacts" className="transition-colors hover:text-gray-300">
                Реквизиты
              </Link>
            </div>
          </div>

          <div className="px-5 pb-4 text-[10px] leading-relaxed text-gray-600 sm:px-6">
            Сайт носит информационный характер и не является публичной офертой;
            окончательные условия — в договоре.
          </div>
        </div>
      </div>
    </footer>
  );
}
