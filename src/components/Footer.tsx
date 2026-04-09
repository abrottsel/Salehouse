import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">ЗемЭкс</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Земельный Экспресс — продажа земельных участков в Подмосковье
              с 2017 года.
            </p>
            <div className="text-xs text-gray-500">
              <div>ООО &laquo;ЗЕМЭКС&raquo;</div>
              <div>ИНН: 9701087133</div>
              <div>ОГРН: 1177746937565</div>
            </div>
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
                href="tel:+74959891070"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                +7 (495) 989-10-70
              </a>
              <a
                href="mailto:office@zemexx.ru"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                office@zemexx.ru
              </a>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Москва, пр. Мира, д. 102, стр. 27, офис 214</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ООО &laquo;ЗЕМЭКС&raquo;. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
