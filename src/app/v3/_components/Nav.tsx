"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { LEGAL } from "@/lib/legal";
import { glassStyle } from "./ui/primitives";

const LINKS = [
  { href: "/v3/catalog", label: "Посёлки" },
  { href: "/v3/mortgage", label: "Ипотека" },
  { href: "/v3/how-to-buy", label: "Как купить" },
  { href: "/v3/reviews", label: "Отзывы" },
  { href: "/v3/faq", label: "Вопросы" },
  { href: "/v3/contacts", label: "Контакты" },
];

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
        className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 rounded-full px-3 transition-shadow sm:px-5"
        style={solid ? glassStyle : { background: "transparent" }}
      >
        <Link href="/v3" className="flex shrink-0 items-center gap-2 font-extrabold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-[13px] text-white">
            З
          </span>
          <span className="text-[15px]">ЗемПлюс</span>
        </Link>

        <div className="ml-4 hidden items-center gap-1 lg:flex">
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

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`tel:${LEGAL.phoneRaw}`}
            className="hidden h-10 items-center gap-2 rounded-full bg-white/[0.07] px-4 text-[13px] font-bold ring-1 ring-white/12 transition-colors hover:bg-white/[0.13] sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-300" />
            {LEGAL.phone}
          </a>
          <button
            onClick={() => setOpenOn((v) => (v === pathname ? null : pathname))}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] ring-1 ring-white/12 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
            className="mx-auto mt-2 max-w-[1400px] overflow-hidden rounded-[24px] p-2 lg:hidden"
            style={glassStyle}
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-2xl px-4 py-3 text-[15px] font-semibold text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={`tel:${LEGAL.phoneRaw}`}
              className="mt-1 flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-[15px] font-bold"
            >
              <Phone className="h-4 w-4" />
              {LEGAL.phone}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
