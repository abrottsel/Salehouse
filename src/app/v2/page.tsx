import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import PoselokCarousel from "@/components/v2/PoselokCarousel";
import CallbackForm from "@/components/CallbackForm";
import BanksRow from "@/components/BanksRow";
import {
  ShieldCheck,
  Landmark,
  ListChecks,
  HelpCircle,
  ArrowRight,
  PhoneCall,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "ЗемПлюс v2 — короткий путь до участка",
  robots: { index: false, follow: false },
  description:
    "Тестовая версия главной с компактной структурой: hero, карусель посёлков, быстрая заявка.",
};

interface NavCard {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  bg: string;
  iconBg: string;
  ring: string;
}

const navCards: NavCard[] = [
  {
    href: "/v2/about",
    Icon: ShieldCheck,
    title: "О нас",
    subtitle: "Преимущества, инфраструктура, отзывы",
    bg: "bg-gradient-to-br from-emerald-50 to-green-100",
    ring: "ring-emerald-200/70",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
  },
  {
    href: "/v2/mortgage",
    Icon: Landmark,
    title: "Ипотека от 6.5%",
    subtitle: "6 банков РФ, расчёт платежа",
    bg: "bg-gradient-to-br from-sky-50 to-blue-100",
    ring: "ring-sky-200/70",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
  },
  {
    href: "/v2/how-to-buy",
    Icon: ListChecks,
    title: "Как купить",
    subtitle: "6 шагов от звонка до ключей",
    bg: "bg-gradient-to-br from-amber-50 to-orange-100",
    ring: "ring-amber-200/70",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    href: "/v2/faq",
    Icon: HelpCircle,
    title: "Вопросы и ответы",
    subtitle: "ИЖС, прописка, документы",
    bg: "bg-gradient-to-br from-violet-50 to-purple-100",
    ring: "ring-violet-200/70",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
];

export default function HomeV2() {
  return (
    <>
      {/* Small v2-banner strip for test URL */}
      <div className="fixed top-12 left-0 right-0 z-40 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-0.5 shadow-md">
        <Sparkles className="inline w-3 h-3 mr-1 -mt-0.5" />
        v2 · тестовая версия ·{" "}
        <a href="/" className="underline hover:no-underline">
          вернуться на текущую
        </a>
      </div>

      <Header />

      <main className="min-h-screen bg-white pt-[72px]">
        {/* Compact hero */}
        <Hero />

        {/* Catalog — carousel instead of grid */}
        <section
          id="catalog"
          className="py-4 lg:py-6 bg-gradient-to-b from-white to-stone-50 scroll-mt-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Каталог посёлков
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Найдите свой{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  идеальный участок
                </span>
              </h2>
            </div>

            <PoselokCarousel />

            {/* Link to full catalog */}
            <div className="text-center mt-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base sm:text-lg font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100 hover:ring-emerald-300 hover:text-emerald-800 transition-all"
              >
                Открыть полный каталог
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Banks row — now AFTER the catalog */}
        <BanksRow />

        {/* Quick callback */}
        <section id="callback" className="py-5 lg:py-8 bg-white scroll-mt-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-green-100 to-emerald-200 ring-1 ring-emerald-300/70 p-6 sm:p-8">
              <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-green-400/20 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white ring-1 ring-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <PhoneCall className="w-3 h-3" />
                    За 15 минут
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
                    Перезвоним{" "}
                    <span className="text-green-700">и подберём участок</span>
                  </h3>
                  <p className="text-sm text-emerald-900/75 mt-1">
                    Оставьте номер — расскажем про посёлки и поможем с выбором
                  </p>
                </div>
                <CallbackForm context="/v2 quick callback" compact />
              </div>
            </div>
          </div>
        </section>

        {/* Navigation cards to sub-pages */}
        <section className="py-5 lg:py-8 bg-stone-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-3">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Узнайте больше
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Подробные разделы — за один клик
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {navCards.map((card) => {
                const Icon = card.Icon;
                return (
                  <a
                    key={card.href}
                    href={card.href}
                    className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 ${card.bg} ring-1 ${card.ring} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-md shadow-black/10 mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h4 className="text-sm font-black text-gray-900 mb-0.5 leading-tight">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      {card.subtitle}
                    </p>
                    <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
