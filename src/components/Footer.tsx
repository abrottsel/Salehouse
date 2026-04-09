import { Phone, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <div className="flex items-baseline gap-0 mb-4">
              <span className="text-2xl font-extrabold text-white tracking-tight leading-none">Зем</span>
              <span className="text-3xl font-black text-green-400 leading-none">+</span>
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
                href="mailto:a.brottsel@mail.ru"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                a.brottsel@mail.ru
              </a>
              <a
                href="https://t.me/Abrottsel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                @Abrottsel
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
