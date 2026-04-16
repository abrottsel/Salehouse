import { Phone, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
                href="https://t.me/zemplus_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                @zemplus
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ЗемПлюс. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
