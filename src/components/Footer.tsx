"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, Copy, Check } from "lucide-react";
import { LEGAL } from "@/lib/legal";

const FOOTER_EMAIL = LEGAL.email;
const PHONE_RAW = LEGAL.phoneRaw;
const PHONE_FMT = LEGAL.phone;
const TG_URL = LEGAL.telegram;
const MAX_URL = LEGAL.max;
const YEAR = new Date().getFullYear();
const LEGAL_LINE = `© ${YEAR} ${LEGAL.shortName} · ИНН ${LEGAL.inn} · ОГРНИП ${LEGAL.ogrn}`;

function TgIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function Footer() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(FOOTER_EMAIL);
      }
    } catch {
      // clipboard might be unavailable in insecure context — silently ignore
    }
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1500);
  };

  return (
    <footer className="bg-gray-100 px-4 py-6">
      <div className="max-w-[1920px] mx-auto">
        <div className="rounded-3xl bg-gray-900 text-white overflow-hidden shadow-lg shadow-emerald-900/10">
          {/* Тонкая emerald→teal градиентная полоса сверху */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

          {/* Главная строка: логотип · навигация · контакты */}
          <div className="px-5 sm:px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2 shrink-0">
              <svg viewBox="0 0 44 40" className="w-7 h-[26px]" fill="none" aria-hidden="true">
                <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
                <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
                <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
              </svg>
              <span className="font-extrabold tracking-tight text-lg text-white">
                Зем<span className="text-emerald-400">+</span>Плюс
              </span>
            </div>

            {/* Nav */}
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-300 md:flex-1 md:justify-center">
              <a href="#catalog" className="hover:text-white transition-colors">Посёлки</a>
              <a href="#calculator" className="hover:text-white transition-colors">Ипотека</a>
              <a href="#steps" className="hover:text-white transition-colors">Как купить</a>
              <a href="#contacts" className="hover:text-white transition-colors">Контакты</a>
            </nav>

            {/* Contacts */}
            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <a
                href={`tel:${PHONE_RAW}`}
                className="flex items-center gap-1.5 font-semibold hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="hidden sm:inline">{PHONE_FMT}</span>
              </a>

              {/* Email + copy */}
              <div className="flex items-center gap-1">
                <a
                  href={`mailto:${FOOTER_EMAIL}`}
                  aria-label={`Написать на ${FOOTER_EMAIL}`}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={emailCopied ? "Скопировано" : "Скопировать email"}
                  title={emailCopied ? "Скопировано" : `Скопировать ${FOOTER_EMAIL}`}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-0.5 -m-0.5"
                >
                  {emailCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                <TgIcon />
              </a>

              <a
                href={MAX_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MAX"
                className="shrink-0"
              >
                <img src="/max-logo.png" alt="MAX" className="w-4 h-4 rounded-sm" />
              </a>
            </div>
          </div>

          {/* Тонкая legal-полоска: реквизиты · ссылки · disclaimer */}
          <div className="px-5 sm:px-6 pb-4 -mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500">
            <span>{LEGAL_LINE}</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Политика</Link>
              <span className="opacity-40">·</span>
              <Link href="/oferta" className="hover:text-gray-300 transition-colors">Оферта</Link>
              <span className="opacity-40">·</span>
              <Link href="/contacts" className="hover:text-gray-300 transition-colors">Реквизиты</Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-5 sm:px-6 pb-4 text-[10px] text-gray-600 leading-relaxed">
            Сайт носит информационный характер и не является публичной офертой; окончательные условия — в договоре.
          </div>
        </div>
      </div>
    </footer>
  );
}
