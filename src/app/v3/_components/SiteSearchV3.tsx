"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ArrowRight,
  Calculator,
  Heart,
  ListChecks,
  MapPin,
  MessageSquare,
  PhoneCall,
  Search,
  TreePine,
  X,
  type LucideIcon,
} from "lucide-react";
import { villages, type Village } from "@/lib/data";
import { glassStyle } from "./ui/primitives";

/**
 * Поиск по сайту для /v3.
 *
 * Логика ранжирования взята у боевого SiteSearch (точное имя → префикс →
 * вхождение → направление → характеристики → описание), оформление своё:
 * тёмное стекло и изумруд вместо белой панели. Боевой компонент не трогаем —
 * он висит на проде.
 *
 * Модалка уходит порталом в body, минуя backdrop-filter шапки: тот создаёт
 * containing block для position:fixed и обрезал бы окно до строки ввода.
 * Классом v3-scope порталу возвращается палитра ветки — снаружи вёрстки
 * /v3 переменные темы не наследуются.
 */

interface Section {
  label: string;
  href: string;
  Icon: LucideIcon;
  hint: string;
  keywords: string;
}

const SECTIONS: Section[] = [
  {
    label: "Каталог посёлков",
    href: "/v3/catalog",
    Icon: TreePine,
    hint: "Все посёлки с фильтрами",
    keywords: "каталог посёлки список все участки",
  },
  {
    label: "Ипотека",
    href: "/v3/mortgage",
    Icon: Calculator,
    hint: "Калькулятор и условия",
    keywords: "ипотека калькулятор кредит платёж рассрочка",
  },
  {
    label: "Как купить",
    href: "/v3/how-to-buy",
    Icon: ListChecks,
    hint: "Пошаговый процесс сделки",
    keywords: "как купить шаги процесс сделка договор",
  },
  {
    label: "Отзывы",
    href: "/v3/reviews",
    Icon: MessageSquare,
    hint: "Что говорят покупатели",
    keywords: "отзывы клиенты мнения рейтинг",
  },
  {
    label: "Контакты",
    href: "/v3/contacts",
    Icon: PhoneCall,
    hint: "Телефон, почта, офис",
    keywords: "контакты телефон офис адрес почта",
  },
  {
    label: "Избранное",
    href: "/v3/favorites",
    Icon: Heart,
    hint: "Сохранённые посёлки и участки",
    keywords: "избранное сохранённое подборка",
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreVillage(v: Village, q: string): number {
  const name = normalize(v.name);
  const slug = normalize(v.slug);
  if (name === q || slug === q) return 1000;
  if (name.startsWith(q)) return 700;
  if (name.includes(q)) return 500;
  if (slug.includes(q)) return 400;
  if (normalize(v.direction).includes(q)) return 120;
  if (normalize((v.features ?? []).join(" ")).includes(q)) return 80;
  if (normalize(v.description ?? "").includes(q)) return 30;
  return 0;
}

export default function SiteSearchV3({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Сброс запроса живёт в закрытии, а не в эффекте на [open]: правило
   *  react-hooks/set-state-in-effect запрещает setState в теле эффекта. */
  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(id);
    };
  }, [open]);

  const q = normalize(query);

  const villageHits = useMemo(() => {
    if (!q) return villages.slice(0, 5);
    return villages
      .map((v) => ({ v, s: scoreVillage(v, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((r) => r.v);
  }, [q]);

  const sectionHits = useMemo(() => {
    if (!q) return SECTIONS.slice(0, 4);
    return SECTIONS.filter(
      (s) => normalize(s.label).includes(q) || normalize(s.keywords).includes(q),
    );
  }, [q]);

  const total = villageHits.length + sectionHits.length;

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const href =
        activeIndex < villageHits.length
          ? `/v3/village/${villageHits[activeIndex]?.slug}`
          : sectionHits[activeIndex - villageHits.length]?.href;
      if (href) window.location.href = href;
    }
  };

  const rowClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 transition-colors sm:px-5 ${
      active ? "bg-emerald-400/12" : "hover:bg-white/[0.06]"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Поиск по сайту"
        title="Поиск по сайту (⌘K)"
        className={`grid shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:text-white ${className}`}
      >
        <Search className="v3-ico v3-ico-search h-[18px] w-[18px]" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="v3-scope fixed inset-0 z-[120] flex items-start justify-center px-3 pt-16 text-white sm:pt-24"
            role="dialog"
            aria-modal="true"
            aria-label="Поиск по сайту"
          >
            <button
              type="button"
              aria-label="Закрыть поиск"
              onClick={close}
              className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
            />

            <div
              className="relative flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px]"
              style={glassStyle}
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
                <Search className="h-5 w-5 shrink-0 text-emerald-300" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="Посёлок, направление или раздел…"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Закрыть"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/[0.09] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="v3-scroll flex-1 overflow-y-auto overscroll-contain">
                {total === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Search className="mx-auto mb-3 h-9 w-9 text-white/15" />
                    <p className="text-[14px] text-white/60">
                      Ничего не нашлось по запросу{" "}
                      <span className="font-bold text-white">«{query}»</span>
                    </p>
                    <p className="mt-1 text-[12px] text-white/40">
                      Попробуйте «Каширское», «Ипотека» или название посёлка
                    </p>
                  </div>
                ) : (
                  <>
                    {villageHits.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 sm:px-5">
                          Посёлки
                        </div>
                        {villageHits.map((v, i) => (
                          <a
                            key={v.slug}
                            href={`/v3/village/${v.slug}`}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={close}
                            className={rowClass(activeIndex === i)}
                          >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                              {v.photos[0] && (
                                <Image
                                  src={v.photos[0]}
                                  alt=""
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[14px] font-bold text-white">
                                {v.name}
                              </div>
                              <div className="flex items-center gap-1 truncate text-[12px] text-white/50">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {v.direction} · {v.distance} км от МКАД
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-[10px] uppercase tracking-wider text-white/35">
                                от
                              </div>
                              <div className="text-[13px] font-bold tabular-nums text-emerald-300">
                                {v.priceFrom.toLocaleString("ru-RU")} ₽
                              </div>
                            </div>
                            <ArrowRight
                              className={`ml-1 h-4 w-4 shrink-0 transition-transform ${
                                activeIndex === i
                                  ? "translate-x-0.5 text-emerald-300"
                                  : "text-white/25"
                              }`}
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {sectionHits.length > 0 && (
                      <div className="border-t border-white/[0.08] py-2">
                        <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 sm:px-5">
                          Разделы сайта
                        </div>
                        {sectionHits.map((s, i) => {
                          const idx = villageHits.length + i;
                          return (
                            <a
                              key={s.href}
                              href={s.href}
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={close}
                              className={rowClass(activeIndex === idx)}
                            >
                              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/25">
                                <s.Icon className="h-4 w-4 text-emerald-300" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[14px] font-semibold text-white">
                                  {s.label}
                                </div>
                                <div className="text-[12px] text-white/50">{s.hint}</div>
                              </div>
                              <ArrowRight
                                className={`h-4 w-4 shrink-0 transition-transform ${
                                  activeIndex === idx
                                    ? "translate-x-0.5 text-emerald-300"
                                    : "text-white/25"
                                }`}
                              />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="hidden items-center gap-4 border-t border-white/[0.08] px-5 py-2.5 text-[11px] text-white/40 sm:flex">
                <span>↑ ↓ — навигация</span>
                <span>↵ — открыть</span>
                <span>esc — закрыть</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
