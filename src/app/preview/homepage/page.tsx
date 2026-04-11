/* eslint-disable @next/next/no-html-link-for-pages */

export const metadata = {
  title: "Preview — Homepage restructure variants",
  robots: { index: false, follow: false },
};

interface BlockProps {
  label: string;
  height?: string;
  tone?: "hero" | "catalog" | "primary" | "secondary" | "muted" | "cta";
  sub?: string;
}

const toneStyles: Record<NonNullable<BlockProps["tone"]>, string> = {
  hero: "bg-gradient-to-br from-green-700 to-emerald-800 text-white",
  catalog: "bg-gradient-to-br from-emerald-100 to-green-200 ring-1 ring-emerald-300 text-emerald-950",
  primary: "bg-emerald-50 ring-1 ring-emerald-200 text-emerald-900",
  secondary: "bg-gray-50 ring-1 ring-gray-200 text-gray-700",
  muted: "bg-gray-100 ring-1 ring-gray-200 text-gray-500",
  cta: "bg-gradient-to-br from-green-600 to-emerald-600 text-white",
};

function Block({ label, height = "h-20", tone = "secondary", sub }: BlockProps) {
  return (
    <div
      className={`rounded-xl px-4 ${height} ${toneStyles[tone]} flex flex-col items-center justify-center text-center`}
    >
      <div className="text-sm font-black">{label}</div>
      {sub && <div className="text-[10px] opacity-75 mt-0.5">{sub}</div>}
    </div>
  );
}

function PhoneFrame({
  children,
  title,
  desc,
  accent,
}: {
  children: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col">
      <div className={`mb-3 ${accent}`}>
        <div className="text-xs font-bold uppercase tracking-widest opacity-70">
          Концепт
        </div>
        <h3 className="text-xl font-black mt-0.5 leading-tight">{title}</h3>
        <p className="text-xs text-gray-600 mt-1 leading-snug">{desc}</p>
      </div>
      <div className="bg-gray-900 rounded-[32px] p-3 shadow-2xl max-w-[340px] mx-auto w-full">
        <div className="bg-white rounded-[22px] overflow-hidden">
          <div className="h-7 bg-white flex items-center justify-center border-b border-gray-100">
            <div className="w-16 h-1 rounded-full bg-gray-800" />
          </div>
          <div className="flex flex-col gap-2 p-3 max-h-[540px] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopFrame({
  children,
  title,
  desc,
}: {
  children: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col mt-8">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className="bg-gray-900 rounded-2xl p-2 shadow-xl">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="h-6 bg-gray-50 flex items-center gap-1.5 px-3 border-b border-gray-100">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="flex flex-col gap-2 p-4 max-h-[480px] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantDivider({ n, title }: { n: string; title: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
      <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-bold shadow-lg">
        <span className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center">
          {n}
        </span>
        {title}
      </div>
    </div>
  );
}

/* ─────────────────────── Variant A ─────────────────────── */
function VariantA() {
  return (
    <section className="bg-stone-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PhoneFrame
            title="A · Минималистский лендинг"
            desc="На главной только супер-важное: hero, каталог, быстрые переходы на отдельные страницы. Остальное — на /about, /mortgage, /faq, /how-to-buy."
            accent="text-gray-900"
          >
            <Block tone="hero" height="h-32" label="HERO" sub="Фото + заголовок + кнопки" />
            <Block tone="catalog" height="h-64" label="КАТАЛОГ ПОСЁЛКОВ" sub="31 посёлок, фильтры, карточки" />
            <Block tone="cta" height="h-16" label="Оставить заявку" sub="Быстрая форма с телефоном" />
            <div className="grid grid-cols-2 gap-2">
              <Block tone="secondary" height="h-20" label="О нас →" sub="/about" />
              <Block tone="secondary" height="h-20" label="Ипотека →" sub="/mortgage" />
              <Block tone="secondary" height="h-20" label="Как купить →" sub="/how-to-buy" />
              <Block tone="secondary" height="h-20" label="FAQ →" sub="/faq" />
            </div>
            <Block tone="muted" height="h-12" label="Footer" />
          </PhoneFrame>

          <DesktopFrame
            title="Десктоп версия"
            desc="То же самое, но горизонтально — грид с посёлками 3 в ряд"
          >
            <Block tone="hero" height="h-28" label="HERO" sub="Full-bleed фото + CTA" />
            <Block tone="catalog" height="h-52" label="КАТАЛОГ (главный экран)" sub="31 посёлок, 3 в ряд" />
            <Block tone="cta" height="h-14" label="Форма заявки inline" />
            <div className="grid grid-cols-4 gap-2">
              <Block tone="secondary" height="h-20" label="О нас" />
              <Block tone="secondary" height="h-20" label="Ипотека" />
              <Block tone="secondary" height="h-20" label="Как купить" />
              <Block tone="secondary" height="h-20" label="FAQ" />
            </div>
            <Block tone="muted" height="h-10" label="Footer" />
          </DesktopFrame>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-5 ring-1 ring-gray-200 text-sm text-gray-700 max-w-2xl mx-auto">
          <h4 className="font-bold text-gray-900 mb-2">Плюсы</h4>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600 mb-3">
            <li>Очень быстрая загрузка главной — минимум блоков</li>
            <li>Клиент сразу видит посёлки, не листает 8 секций</li>
            <li>SEO-структура через отдельные страницы</li>
            <li>Аналитика — видно на какие подстраницы переходят</li>
          </ul>
          <h4 className="font-bold text-gray-900 mb-2">Минусы</h4>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
            <li>Больше кликов до полной инфы — нужно переходить</li>
            <li>Часть клиентов не дочитают до контактов</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Variant B ─────────────────────── */
function VariantB() {
  return (
    <section className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PhoneFrame
            title="B · Табы/аккордеоны на главной"
            desc="Всё на одной странице, но длинные секции схлопнуты в переключатели. Клик по табу — раскрывается нужный контент."
            accent="text-gray-900"
          >
            <Block tone="hero" height="h-32" label="HERO" sub="Фото + заголовок" />
            <Block tone="catalog" height="h-56" label="КАТАЛОГ" sub="31 посёлок" />
            <Block tone="cta" height="h-14" label="Оставить заявку" />
            <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl p-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 text-center">
                Подробности (свернуто)
              </div>
              <div className="flex gap-1 mb-2 overflow-x-auto">
                <div className="shrink-0 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Преимущества
                </div>
                <div className="shrink-0 bg-white ring-1 ring-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Инфраструктура
                </div>
                <div className="shrink-0 bg-white ring-1 ring-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Ипотека
                </div>
                <div className="shrink-0 bg-white ring-1 ring-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Отзывы
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-[10px] text-gray-500 text-center">
                Контент выбранного таба
              </div>
            </div>
            <Block tone="primary" height="h-14" label="FAQ (accordion)" />
            <Block tone="muted" height="h-12" label="Footer" />
          </PhoneFrame>

          <DesktopFrame
            title="Десктоп версия"
            desc="Табы горизонтально, контент снизу без перезагрузки"
          >
            <Block tone="hero" height="h-24" label="HERO" />
            <Block tone="catalog" height="h-44" label="КАТАЛОГ" />
            <Block tone="cta" height="h-12" label="Быстрая форма" />
            <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl p-3">
              <div className="flex gap-2 mb-2">
                {[
                  "Преимущества",
                  "Инфраструктура",
                  "Ипотека",
                  "Отзывы",
                  "Как купить",
                  "FAQ",
                ].map((t, i) => (
                  <div
                    key={t}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${
                      i === 0
                        ? "bg-green-600 text-white"
                        : "bg-white ring-1 ring-gray-200 text-gray-600"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg h-24 text-[11px] text-gray-500 flex items-center justify-center">
                Контент «Преимущества»
              </div>
            </div>
            <Block tone="muted" height="h-10" label="Footer" />
          </DesktopFrame>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-5 ring-1 ring-gray-200 text-sm text-gray-700 max-w-2xl mx-auto">
          <h4 className="font-bold text-gray-900 mb-2">Плюсы</h4>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600 mb-3">
            <li>Всё на одной странице — без перезагрузок и кликов</li>
            <li>Короткий путь до важного: Hero → Каталог → сразу заявка</li>
            <li>Контент не исчезает — доступен за один клик</li>
            <li>Хорошо работает для SEO (весь контент на одной странице)</li>
          </ul>
          <h4 className="font-bold text-gray-900 mb-2">Минусы</h4>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
            <li>Табы/аккордеоны — не все клиенты поймут что там есть ещё контент</li>
            <li>Сложнее вёрстка и синхронизация состояний</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Variant C ─────────────────────── */
function VariantC() {
  return (
    <section className="bg-stone-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PhoneFrame
            title="C · Sticky-бар с быстрым доступом"
            desc="Главное сверху. Внизу — плавающий бар с иконками-якорями на свёрнутые секции. Клик → плавный скролл вниз к нужному."
            accent="text-gray-900"
          >
            <Block tone="hero" height="h-32" label="HERO" sub="Короткий, с 3 trust-badges" />
            <Block tone="catalog" height="h-56" label="КАТАЛОГ" />
            <Block tone="cta" height="h-14" label="Оставить заявку" />
            {/* Collapsed sections preview */}
            <Block tone="primary" height="h-14" label="▶ Преимущества (свернуто)" sub="клик — развернуть" />
            <Block tone="primary" height="h-14" label="▶ Ипотека (свернуто)" />
            <Block tone="primary" height="h-14" label="▶ Отзывы (свернуто)" />
            <Block tone="primary" height="h-14" label="▶ FAQ (свернуто)" />
            <Block tone="muted" height="h-10" label="Footer" />
            {/* Sticky bottom bar preview */}
            <div className="sticky bottom-0 -mx-3 -mb-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2 rounded-b-[22px] flex items-center justify-around text-[9px] font-bold">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded-full bg-green-500" />
                <span>Плюсы</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded-full bg-sky-500" />
                <span>Ипотека</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded-full bg-amber-500" />
                <span>FAQ</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded-full bg-rose-500" />
                <span>Заявка</span>
              </div>
            </div>
          </PhoneFrame>

          <DesktopFrame
            title="Десктоп версия"
            desc="Секции в аккордеонах, справа плавающий TOC"
          >
            <div className="grid grid-cols-[1fr_140px] gap-3">
              <div className="flex flex-col gap-2">
                <Block tone="hero" height="h-24" label="HERO" />
                <Block tone="catalog" height="h-44" label="КАТАЛОГ" />
                <Block tone="cta" height="h-12" label="Заявка" />
                <Block tone="primary" height="h-12" label="▶ Преимущества" />
                <Block tone="primary" height="h-12" label="▶ Инфраструктура" />
                <Block tone="primary" height="h-12" label="▶ Ипотека" />
                <Block tone="primary" height="h-12" label="▶ FAQ" />
              </div>
              <div className="sticky top-0 bg-gray-900 rounded-xl p-2 h-fit text-[10px] text-white">
                <div className="font-bold text-center mb-2 opacity-70 uppercase tracking-wider">
                  На странице
                </div>
                <div className="space-y-1">
                  <div className="bg-green-600 rounded-md px-2 py-1 font-bold">
                    · Каталог
                  </div>
                  <div className="px-2 py-1 opacity-70">· Преимущества</div>
                  <div className="px-2 py-1 opacity-70">· Ипотека</div>
                  <div className="px-2 py-1 opacity-70">· Отзывы</div>
                  <div className="px-2 py-1 opacity-70">· FAQ</div>
                </div>
              </div>
            </div>
          </DesktopFrame>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-5 ring-1 ring-gray-200 text-sm text-gray-700 max-w-2xl mx-auto">
          <h4 className="font-bold text-gray-900 mb-2">Плюсы</h4>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600 mb-3">
            <li>Клиент видит весь оглавление — знает что есть</li>
            <li>Секции свёрнутые компактно — быстрый скролл</li>
            <li>Sticky-бар всегда под рукой — один тап до нужного</li>
            <li>Весь контент на одной странице, SEO не страдает</li>
          </ul>
          <h4 className="font-bold text-gray-900 mb-2">Минусы</h4>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
            <li>Больше состояний (expanded/collapsed) → сложнее тестить</li>
            <li>Бар внизу на мобиле — конфликт с чат-виджетом справа-снизу</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function HomepagePreview() {
  return (
    <main className="min-h-screen bg-stone-100">
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.2em] text-green-400 mb-2">
            Preview · Information Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Реструктуризация главной
          </h1>
          <p className="text-gray-300 max-w-2xl text-sm sm:text-base">
            Сейчас на главной 10 секций — клиент должен скроллить 5+ экранов
            чтобы дойти до контактов. Три концепта как сократить путь до
            заявки и упростить навигацию. Это мокапы-схемы (wireframes), не
            живой код — покажут структуру, чтобы выбрать направление. После
            выбора реализую полноценно.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 ring-1 ring-amber-400/40 text-amber-200 px-3 py-1.5 rounded-full text-xs font-bold">
            ⚠ Это схематичные мокапы, не финальный дизайн
          </div>
        </div>
      </div>

      <VariantDivider n="A" title="Минималистский лендинг" />
      <VariantA />

      <VariantDivider n="B" title="Табы на главной" />
      <VariantB />

      <VariantDivider n="C" title="Sticky-бар + аккордеоны" />
      <VariantC />

      <div className="py-16 text-center text-sm text-gray-500">
        Выберите вариант — реализую по-настоящему за 30–60 минут
      </div>
    </main>
  );
}
