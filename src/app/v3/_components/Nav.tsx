"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  HelpCircle,
  ListChecks,
  Menu,
  MessageSquare,
  Phone,
  PhoneCall,
  TreePine,
  X,
  type LucideIcon,
} from "lucide-react";
import { LEGAL } from "@/lib/legal";
import { glassStyle } from "./ui/primitives";
import FavoritesButton from "./FavoritesButton";
import SiteSearchV3 from "./SiteSearchV3";
import ThemeToggle from "./ThemeToggle";

const LINKS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/v3/catalog", label: "Посёлки", Icon: TreePine },
  { href: "/v3/mortgage", label: "Ипотека", Icon: Calculator },
  { href: "/v3/how-to-buy", label: "Как купить", Icon: ListChecks },
  { href: "/v3/reviews", label: "Отзывы", Icon: MessageSquare },
  { href: "/v3/faq", label: "Вопросы", Icon: HelpCircle },
  { href: "/v3/contacts", label: "Контакты", Icon: PhoneCall },
];

/** Цель тапа 44px остаётся, но подложки у иконок нет: визуально они
 *  размером со знак логотипа, как в боевой шапке. */
const ICON_BTN = "h-11 w-11";

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

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
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
            className={`grid ${ICON_BTN} place-items-center rounded-full text-emerald-500 transition-colors hover:text-emerald-400 dark:text-emerald-300`}
          >
            <Phone className="h-[22px] w-[22px]" />
          </a>

          <button
            onClick={() => setOpenOn((v) => (v === pathname ? null : pathname))}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            className={`grid ${ICON_BTN} place-items-center rounded-full text-white/70 transition-colors hover:text-white lg:hidden`}
          >
            {open ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
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
                взгляда, а список из шести строк — нет. Высота плитки 92px,
                это с запасом больше минимальной цели тапа в 44px. */}
            <div className="grid grid-cols-3 gap-2">
              {LINKS.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpenOn(null)}
                    className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[18px] px-1.5 py-3 text-center ring-1 transition-colors ${
                      active
                        ? "bg-emerald-400/12 ring-emerald-400/35"
                        : "bg-white/[0.05] ring-white/10 active:bg-white/[0.10]"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-[14px] ${
                        active ? "bg-emerald-400/20" : "bg-white/[0.07]"
                      }`}
                    >
                      <l.Icon
                        className={`h-[18px] w-[18px] ${
                          active ? "text-emerald-300" : "text-white/70"
                        }`}
                      />
                    </span>
                    <span
                      className={`text-[12px] font-semibold leading-tight ${
                        active ? "text-emerald-300" : "text-white/80"
                      }`}
                    >
                      {l.label}
                    </span>
                  </Link>
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
