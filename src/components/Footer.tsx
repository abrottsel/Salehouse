import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { LEGAL } from "@/lib/legal";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 44 40" className="w-9 h-8" fill="none">
                <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
                <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
                <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
              </svg>
              <span className="text-xl font-extrabold text-white tracking-tight">ЗемПлюс</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              ЗемПлюс — продажа земельных участков в Подмосковье.
              Проверенные посёлки с готовыми коммуникациями.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "#advantages", label: "Преимущества" },
                { href: "#catalog", label: "Посёлки" },
                { href: "#infrastructure", label: "Инфраструктура" },
                { href: "#calculator", label: "Ипотека" },
                { href: "#reviews", label: "Отзывы" },
                { href: "#steps", label: "Как купить" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Directions */}
          <div>
            <h4 className="font-semibold mb-4">Направления</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Каширское шоссе</li>
              <li>Симферопольское шоссе</li>
              <li>Дмитровское шоссе</li>
              <li>Новорижское шоссе</li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+79859052555"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                +7 (985) 905-25-55
              </a>
              <a
                href="mailto:info@zem-plus.ru"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@zem-plus.ru
              </a>
              <a
                href="https://t.me/zemplus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </a>
              <a
                href="https://max.ru/id503440358928_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <img src="/max-logo.png" alt="MAX" className="w-4 h-4 rounded-sm" />
                MAX
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 space-y-3 text-center text-xs text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Политика конфиденциальности
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/oferta" className="hover:text-white transition-colors">
              Оферта на бронирование
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/contacts" className="hover:text-white transition-colors">
              Контакты и реквизиты
            </Link>
          </div>
          <div className="text-gray-600 leading-relaxed">
            {LEGAL.shortName} · ИНН {LEGAL.inn} · ОГРНИП {LEGAL.ogrn}
          </div>
          <div className="text-gray-500 leading-relaxed max-w-3xl mx-auto px-4">
            Сайт носит информационный характер и не является публичной офертой; окончательные условия — в договоре.
          </div>
          <div>
            &copy; {new Date().getFullYear()} {LEGAL.brand}. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}
