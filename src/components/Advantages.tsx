import {
  Shield,
  TreePine,
  Zap,
  Car,
  Fence,
  Eye,
  Droplets,
  Sun,
} from "lucide-react";

const advantages = [
  {
    icon: Shield,
    title: "Юридическая чистота",
    description:
      "Каждый участок проходит тщательную юридическую проверку. Гарантия чистоты сделки закреплена в договоре.",
  },
  {
    icon: Car,
    title: "Асфальтированные дороги",
    description:
      "Дороги с твёрдым покрытием внутри посёлков и удобные подъезды от основных шоссе.",
  },
  {
    icon: Fence,
    title: "Охраняемая территория",
    description:
      "Круглосуточная охрана, КПП, видеонаблюдение. Ваша семья в безопасности.",
  },
  {
    icon: Zap,
    title: "Все коммуникации",
    description:
      "Газ, электричество, водоснабжение — всё подведено к участку. Начинайте строить сразу.",
  },
  {
    icon: TreePine,
    title: "Природа рядом",
    description:
      "Посёлки расположены у лесов и рек. Чистый воздух и красивые виды каждый день.",
  },
  {
    icon: Eye,
    title: "Прозрачные цены",
    description:
      "Никаких скрытых платежей. Стоимость фиксируется в договоре и не меняется.",
  },
  {
    icon: Droplets,
    title: "Развитая инфраструктура",
    description:
      "Магазины, школы, медицинские учреждения — всё в доступности от наших посёлков.",
  },
  {
    icon: Sun,
    title: "Рассрочка без переплат",
    description:
      "Гибкие условия оплаты: рассрочка до 12 месяцев, программа для молодых семей.",
  },
];

export default function Advantages() {
  return (
    <section id="advantages" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Более 9 лет мы помогаем людям обрести свой участок земли в Подмосковье.
            44 награды в сфере загородного девелопмента.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <item.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
