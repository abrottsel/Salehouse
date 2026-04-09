import {
  Flame,
  Zap,
  Droplets,
  Car,
  ShieldCheck,
  Lightbulb,
  Trash2,
  Snowflake,
} from "lucide-react";

const infrastructure = [
  {
    icon: Flame,
    title: "Магистральный газ",
    description: "Газопровод подведён к каждому участку. Подключение — по договору.",
  },
  {
    icon: Zap,
    title: "Электричество",
    description: "Выделенная мощность 15 кВт на участок. Подстанция внутри посёлка.",
  },
  {
    icon: Droplets,
    title: "Водоснабжение",
    description: "Центральный водопровод или индивидуальная скважина.",
  },
  {
    icon: Car,
    title: "Асфальтированные дороги",
    description: "Дороги с твёрдым покрытием внутри посёлка и подъездные пути.",
  },
  {
    icon: ShieldCheck,
    title: "Охрана и КПП",
    description: "Круглосуточная охрана, контрольно-пропускной пункт, видеонаблюдение.",
  },
  {
    icon: Lightbulb,
    title: "Уличное освещение",
    description: "Освещение дорог и общественных зон внутри посёлка.",
  },
  {
    icon: Trash2,
    title: "Вывоз мусора",
    description: "Организованный сбор и вывоз бытовых отходов.",
  },
  {
    icon: Snowflake,
    title: "Уборка зимой",
    description: "Регулярная чистка дорог от снега в зимний период.",
  },
];

export default function Infrastructure() {
  return (
    <section id="infrastructure" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Готовая инфраструктура
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Наши посёлки — это не просто земля. Это готовая среда для комфортной
              жизни с первого дня. Все коммуникации подведены, дороги построены,
              охрана работает.
            </p>

            <div className="bg-green-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Экономия на подключении
              </h3>
              <p className="text-green-700 text-sm">
                Покупая участок в готовом посёлке, вы экономите от 500 000 до 2 000 000 рублей
                на проведение коммуникаций по сравнению с покупкой «голой» земли.
              </p>
            </div>

            <a
              href="#contacts"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Получить презентацию посёлка
            </a>
          </div>

          <div className="mt-12 lg:mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infrastructure.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <item.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
