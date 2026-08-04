"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  HelpCircle,
  ListChecks,
  MessageSquare,
  Phone,
  PhoneCall,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import { LEGAL } from "@/lib/legal";
import { glassStyle } from "./ui/primitives";
import FavoritesButton from "./FavoritesButton";
import SiteSearchV3 from "./SiteSearchV3";
import ThemeToggle from "./ThemeToggle";

/** Тон плитки в мобильном меню. Приём взят у карточек преимуществ: там
 *  каждая иконка своего цвета на своей плашке, и именно это отличает
 *  живое меню от серой сетки одинаковых значков. Работает в обеих темах. */
const LINKS: { href: string; label: string; Icon: LucideIcon; tone: string }[] = [
  { href: "/v3/catalog", label: "Посёлки", Icon: TreePine, tone: "bg-emerald-500/15 text-emerald-300" },
  { href: "/v3/mortgage", label: "Ипотека", Icon: Calculator, tone: "bg-sky-500/15 text-sky-300" },
  { href: "/v3/how-to-buy", label: "Как купить", Icon: ListChecks, tone: "bg-violet-500/15 text-violet-300" },
  { href: "/v3/reviews", label: "Отзывы", Icon: MessageSquare, tone: "bg-amber-500/15 text-amber-300" },
  { href: "/v3/faq", label: "Вопросы", Icon: HelpCircle, tone: "bg-rose-500/15 text-rose-300" },
  { href: "/v3/contacts", label: "Контакты", Icon: PhoneCall, tone: "bg-teal-500/15 text-teal-300" },
];

/** Знаки мельче прежних (18px против 22px), кнопка 38px и почти без
 *  зазора — четыре иконки по 44px распирали шапку на телефоне. Подложка
 *  появляется только под курсором, в покое её нет, как в боевой шапке.
 *  Класс v3-ico-btn включает оживление иконки внутри (см. v3.css). */
const ICON_BTN =
  "v3-ico-btn h-[38px] w-[38px] rounded-full transition-colors hover:bg-white/[0.07]";

export default function Nav() {
  const pathname = usePathname() || "";
  // Храним не «открыто/закрыто», а страницу, на которой меню открыли:
  // при переходе pathname меняется и меню закрывается само, без эффекта
  // с setState (он давал каскадный ререндер, react-hooks ругался).
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className="v3-nav mx-auto flex h-14 max-w-[1400px] items-center gap-2 rounded-full px-2 transition-shadow sm:gap-3 sm:px-4"
        // Не «прозрачный фон», а отсутствие инлайнового стиля: инлайн
        // перебил бы дневное стекло из v3.css (см. .v3-nav).
        style={solid ? glassStyle : undefined}
      >
        {/* Фирменный домик с плюсом — тот же знак, что на проде и в подвале.
            Зелёный квадрат с буквой «З» брендом не является. */}
        <Link href="/v3" className="flex shrink-0 items-center gap-2 pl-1 font-extrabold">
          <svg viewBox="0 0 44 40" className="h-[26px] w-7 shrink-0" fill="none" aria-hidden="true">
            <path d="M22 2L2 18h6v20h28V18h6L22 2z" fill="#22c55e" />
            <rect x="14" y="22" width="16" height="4" rx="2" fill="white" />
            <rect x="20" y="16" width="4" height="16" rx="2" fill="white" />
          </svg>
          {/* Ниже 380px четыре иконки справа и подпись логотипа в строку
              не помещаются — остаётся один знак. */}
          <span className="text-[15px] tracking-tight max-[379px]:hidden">
            Зем<span className="text-emerald-400">+</span>Плюс
          </span>
        </Link>

        <div className="ml-3 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                  active ? "bg-white/[0.10] text-white" : "text-white/65 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-0 sm:gap-0.5">
          <SiteSearchV3 className={ICON_BTN} />
          <FavoritesButton className={ICON_BTN} />
          <ThemeToggle className={ICON_BTN} />

          {/* Только трубка, без номера — как на проде. Номер длинный, он
              распирал шапку и спорил с иконками; сам номер остаётся
              в подвале, на контактах и в мобильном меню. */}
          <a
            href={`tel:${LEGAL.phoneRaw}`}
            aria-label={`Позвонить ${LEGAL.phone}`}
            title={LEGAL.phone}
            className={`grid ${ICON_BTN} place-items-center text-emerald-500 hover:text-emerald-400 dark:text-emerald-300`}
          >
            <Phone className="v3-ico v3-ico-phone h-[18px] w-[18px]" />
          </a>

          <button
            onClick={() => setOpenOn((v) => (v === pathname ? null : pathname))}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            className={`grid ${ICON_BTN} place-items-center text-white/70 hover:text-white lg:hidden`}
          >
            {/* Три полоски складываются в крестик — см. .v3-burger в v3.css */}
            <span className="v3-burger" data-open={open} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mx-auto mt-2 max-w-[1400px] overflow-hidden rounded-[24px] p-3 lg:hidden"
            style={glassStyle}
          >
            {/* Плитки по три в ряд: подпись под иконкой читается с одного
                взгляда, а список из шести строк — нет. Плитка 82px и знак
                16px — мельче прежних, но цель тапа вдвое больше
                минимальных 44px. Плитки въезжают гирляндой, по очереди. */}
            <div className="grid grid-cols-3 gap-1.5">
              {LINKS.map((l, i) => {
                const active = pathname === l.href;
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.04 + i * 0.035, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpenOn(null)}
                      className={`group flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-[18px] px-1.5 py-3 text-center ring-1 transition-colors ${
                        active
                          ? "bg-emerald-400/12 ring-emerald-400/35"
                          : "bg-white/[0.05] ring-white/10 active:bg-white/[0.10]"
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-[13px] ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-0.5 group-active:scale-90 ${l.tone}`}
                      >
                        <l.Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span
                        className={`text-[12px] font-semibold leading-tight ${
                          active ? "text-emerald-300" : "text-white/80"
                        }`}
                      >
                        {l.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Номер в кнопке не пишем — он остаётся в подвале и в контактах. */}
            <a
              href={`tel:${LEGAL.phoneRaw}`}
              className="mt-2 flex h-[52px] items-center justify-center gap-2 rounded-[18px] bg-emerald-500 text-[15px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] transition-colors hover:bg-emerald-400 active:scale-[0.99]"
            >
              <Phone className="h-4 w-4" />
              Позвонить
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
