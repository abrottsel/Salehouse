import {
  PhoneCall,
  Search,
  MapPin,
  BookmarkCheck,
  FileSignature,
  KeyRound,
  Star,
} from "lucide-react";

/**
 * /v3 — How it works + social proof + stats.
 * Warm premium aesthetic: cream bg, emerald accents.
 */

const STEPS = [
  { n: 1, title: "Звонок", desc: "Менеджер уточнит бюджет и пожелания", Icon: PhoneCall },
  { n: 2, title: "Подбор", desc: "Покажем 3–5 участков под ваш запрос", Icon: Search },
  { n: 3, title: "Просмотр", desc: "Выезд с агентом, осмотр на местности", Icon: MapPin },
  { n: 4, title: "Бронь", desc: "Снимаем участок с продажи на 5 дней", Icon: BookmarkCheck },
  { n: 5, title: "Договор", desc: "Сделка в Росреестре под ключ", Icon: FileSignature },
  { n: 6, title: "Ключи", desc: "Документы на руки — участок ваш", Icon: KeyRound },
] as const;

const REVIEWS = [
  {
    name: "Анна Соколова",
    initials: "АС",
    quote:
      "Купили участок за месяц от первого звонка. Менеджер показал 4 варианта, остановились на третьем — рядом с лесом. Никакого давления.",
    where: "посёлок «Сосновый бор»",
    color: "from-rose-200 to-amber-200",
  },
  {
    name: "Дмитрий Орлов",
    initials: "ДО",
    quote:
      "Сравнивал с двумя другими агентствами — у ЗемПлюс цены прозрачные, документы все на месте. Сделка прошла гладко.",
    where: "посёлок «Зелёная роща»",
    color: "from-emerald-200 to-teal-200",
  },
  {
    name: "Екатерина Лебедева",
    initials: "ЕЛ",
    quote:
      "Помогли с ипотекой Сбера — одобрение за 2 дня. Подсказали, какие документы готовить. Всё чётко, спасибо команде!",
    where: "посёлок «Берёзки»",
    color: "from-sky-200 to-indigo-200",
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="v3-how-it-works"
      className="relative py-16 lg:py-24 scroll-mt-16 bg-[#fffaf3]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-4">
            6 шагов
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            Как мы работаем
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            От звонка до ключей — в среднем 21 день
          </p>
        </div>

        {/* Steps timeline */}
        <div className="relative mb-20">
          {/* Desktop horizontal connector */}
          <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" />

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4">
            {STEPS.map(({ n, title, desc, Icon }) => (
              <li key={n} className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3 lg:text-center">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-600/30 ring-4 ring-[#fffaf3]">
                    {n}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white ring-2 ring-emerald-100 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900 mb-1">{title}</div>
                  <p className="text-sm text-gray-600 leading-snug">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">
            Что говорят клиенты
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <article
                key={r.name}
                className="rounded-3xl bg-white p-6 sm:p-7 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${r.color} flex items-center justify-center font-bold text-gray-700`}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{r.name}</div>
                    <div className="flex gap-0.5 mt-0.5" aria-label="5 из 5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-sm text-gray-700 leading-relaxed flex-1">
                  «{r.quote}»
                </blockquote>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-emerald-700 font-semibold">
                  Купил(а) в {r.where}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-6 sm:px-10 sm:py-8 shadow-lg shadow-emerald-600/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center sm:divide-x sm:divide-emerald-400/40">
            <Stat n="100+" label="сделок за год" />
            <Stat n="21 день" label="средний срок" />
            <Stat n="97%" label="рекомендуют друзьям" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="px-4">
      <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
        {n}
      </div>
      <div className="text-sm text-emerald-50/90 mt-1">{label}</div>
    </div>
  );
}
