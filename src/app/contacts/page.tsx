import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  Send,
  MapPin,
  Building2,
  Trees,
  Home,
  Compass,
  CalendarCheck,
  ShieldCheck,
  Handshake,
  Banknote,
  ListChecks,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEGAL } from "@/lib/legal";
import { villages } from "@/lib/data";

export const metadata: Metadata = {
  title: `О компании и контакты — ${LEGAL.brand}`,
  description: `${LEGAL.brand} — продажа земельных участков в Подмосковье. Контакты, реквизиты ${LEGAL.shortName}, статистика по посёлкам.`,
};

// ─── Stats: real data computed from villages list ──────────────────
const VILLAGE_COUNT = villages.length;
const PLOTS_TOTAL = villages.reduce((s, v) => s + (v.plotsCount ?? 0), 0);
const PLOTS_AVAILABLE = villages.reduce((s, v) => s + (v.plotsAvailable ?? 0), 0);
const DIRECTIONS = Array.from(new Set(villages.map((v) => v.direction)));

// Бренд работает с 2016 года (через партнёра ЗЕМЭКС, ИП оформлен в 2024)
const FOUNDING_YEAR = 2016;
const YEARS_ON_MARKET = new Date().getFullYear() - FOUNDING_YEAR;

const fmt = (n: number) => n.toLocaleString("ru-RU");

// ─── Page ──────────────────────────────────────────────────────────
export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
          {/* Hero */}
          <section className="mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              О компании
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">
              {LEGAL.brand} — земельные участки
              <br className="hidden sm:block" />{" "}
              <span className="text-emerald-700">в Подмосковье под ключ</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl">
              Помогаем выбрать и купить участок: подбираем по бюджету и
              направлению, проверяем документы, сопровождаем сделку и оформление
              ипотеки.
            </p>
          </section>

          {/* Stats grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
            <StatCard
              icon={CalendarCheck}
              value={`${YEARS_ON_MARKET}+`}
              label="лет на рынке"
              hint={`с ${FOUNDING_YEAR} года`}
              accent="emerald"
            />
            <StatCard
              icon={Trees}
              value={String(VILLAGE_COUNT)}
              label="посёлков"
              hint="в каталоге"
              accent="teal"
            />
            <StatCard
              icon={Home}
              value={fmt(PLOTS_AVAILABLE)}
              label="участков"
              hint={`свободно из ${fmt(PLOTS_TOTAL)}`}
              accent="emerald"
            />
            <StatCard
              icon={Compass}
              value={String(DIRECTIONS.length)}
              label="направления"
              hint={DIRECTIONS.map((d) => d.replace(" шоссе", "")).join(" · ")}
              accent="teal"
            />
          </section>

          {/* About */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">О нас</h2>
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>{LEGAL.brand}</strong> — официальный партнёр{" "}
                <span className="font-semibold">ООО «ЗЕМЭКС»</span> по продаже
                земельных участков в коттеджных посёлках Московской области.
              </p>
              <p>
                Мы работаем напрямую с застройщиком: показываем планы,
                согласовываем выбор участка на интерактивной карте, готовим
                договор и сопровождаем регистрацию в Росреестре. Для покупателей
                с ипотекой — подаём заявки в 6 банков-партнёров (ВТБ, Сбер,
                Альфа, ГПБ, РСХБ, Т-Банк) с предодобрением за 2 дня.
              </p>
              <p>
                Все участки имеют категорию земель сельхозназначения с
                разрешённым использованием для дачного строительства, межевание
                и кадастровый номер. Проверяем юридическую чистоту до сделки —
                выписки ЕГРН, обременения, аресты.
              </p>
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-5">
              Почему выбирают нас
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <AdvCard
                icon={ShieldCheck}
                title="Юридическая чистота"
                text="Все участки с межеванием и кадастровым номером. Проверяем обременения, аресты и историю владения до сделки."
              />
              <AdvCard
                icon={Handshake}
                title="Прямой партнёр застройщика"
                text="Работаем без агентских комиссий — цены такие же, как от ЗЕМЭКС напрямую."
              />
              <AdvCard
                icon={Banknote}
                title="Ипотека за 2 дня"
                text="6 банков-партнёров, ставки от 6.5%. Помогаем собрать документы и получить одобрение."
              />
              <AdvCard
                icon={ListChecks}
                title="Сопровождение сделки"
                text="Договор, регистрация в Росреестре, расчёт через аккредитив или эскроу — берём всё на себя."
              />
              <AdvCard
                icon={Compass}
                title="3 направления"
                text="Каширское, Дмитровское и Новорижское шоссе — от 30 до 70 км от МКАД."
              />
              <AdvCard
                icon={Trees}
                title="Готовые посёлки"
                text="Газ, электричество, асфальт, охрана. Можно строиться сразу после сделки."
              />
            </div>
          </section>

          {/* Contacts grid */}
          <section className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-5">Контакты</h2>
            <p className="text-gray-600 mb-5">
              Свяжитесь удобным способом — отвечаем в рабочие часы за 5–15 минут.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <ContactCard
                href={`tel:${LEGAL.phoneRaw}`}
                icon={Phone}
                iconBg="bg-emerald-500"
                eyebrow="Телефон"
                title={LEGAL.phone}
                hint="Ежедневно, 9:00–21:00"
              />
              <ContactCard
                href={`mailto:${LEGAL.email}`}
                icon={Mail}
                iconBg="bg-blue-500"
                eyebrow="E-mail"
                title={LEGAL.email}
                hint="Отвечаем в течение дня"
              />
              <ContactCard
                href={LEGAL.telegram}
                external
                icon={Send}
                iconBg="bg-[#2AABEE]"
                eyebrow="Telegram"
                title="@zemplus"
                hint="Бот для подбора участка"
              />
              <ContactCard
                href={LEGAL.max}
                external
                imgSrc="/max-logo.png"
                iconBg="bg-purple-500"
                eyebrow="MAX Messenger"
                title="ЗемПлюс"
                hint="Российский мессенджер"
              />
            </div>
          </section>

          {/* Requisites */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 sm:p-8 mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Реквизиты
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="text-gray-500 font-semibold">Полное имя</dt>
              <dd className="text-gray-900">{LEGAL.fullName}</dd>

              <dt className="text-gray-500 font-semibold">Краткое</dt>
              <dd className="text-gray-900">{LEGAL.shortName}</dd>

              <dt className="text-gray-500 font-semibold">ИНН</dt>
              <dd className="text-gray-900 font-mono">{LEGAL.inn}</dd>

              <dt className="text-gray-500 font-semibold">ОГРНИП</dt>
              <dd className="text-gray-900 font-mono">{LEGAL.ogrn}</dd>

              <dt className="text-gray-500 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Адрес
              </dt>
              <dd className="text-gray-900">{LEGAL.legalAddress}</dd>
            </dl>
          </section>

          <p className="text-sm text-gray-500">
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Политика конфиденциальности
            </Link>{" "}
            ·{" "}
            <Link href="/oferta" className="text-emerald-600 hover:underline">
              Оферта
            </Link>{" "}
            ·{" "}
            <Link href="/" className="text-emerald-600 hover:underline">
              На главную
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  hint?: string;
  accent: "emerald" | "teal";
}) {
  const iconBg = accent === "emerald" ? "bg-emerald-500" : "bg-teal-500";
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-4 sm:p-5 flex flex-col gap-2">
      <div
        className={`${iconBg} w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl sm:text-4xl font-black text-gray-900 tabular-nums leading-none">
        {value}
      </div>
      <div className="text-sm font-semibold text-gray-700 -mt-0.5">{label}</div>
      {hint && (
        <div className="text-[11px] text-gray-500 leading-tight">{hint}</div>
      )}
    </div>
  );
}

function AdvCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5 hover:shadow-md hover:ring-emerald-300 transition">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function ContactCard({
  href,
  external,
  icon: Icon,
  imgSrc,
  iconBg,
  eyebrow,
  title,
  hint,
}: {
  href: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  imgSrc?: string;
  iconBg: string;
  eyebrow: string;
  title: string;
  hint: string;
}) {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <a
      href={href}
      {...linkProps}
      className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-emerald-300 transition"
    >
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 overflow-hidden`}
      >
        {Icon ? (
          <Icon className="w-5 h-5 text-white" />
        ) : imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={eyebrow}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
          {eyebrow}
        </div>
        <div className="text-lg font-bold text-gray-900 mt-0.5">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5">{hint}</div>
      </div>
    </a>
  );
}
