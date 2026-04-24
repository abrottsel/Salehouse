"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Search,
  X,
  MapPin,
  Heart,
  Star,
  TreePine,
  Building2,
  Calculator,
  MessageSquare,
  ListChecks,
  PhoneCall,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { villages, type Village } from "@/lib/data";

/* ─────────────────────── helpers ─────────────────────── */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface SectionHit {
  kind: "section";
  label: string;
  href: string;
  Icon: LucideIcon;
  hint: string;
}

const SECTIONS: (Omit<SectionHit, "kind"> & { keywords: string })[] = [
  {
    label: "Преимущества",
    href: "/#advantages",
    Icon: Star,
    hint: "Почему ЗемПлюс",
    keywords: "преимущества почему выбрать",
  },
  {
    label: "Каталог посёлков",
    href: "/#catalog",
    Icon: TreePine,
    hint: "Все 31 посёлок",
    keywords: "каталог посёлки список все",
  },
  {
    label: "Инфраструктура",
    href: "/#infrastructure",
    Icon: Building2,
    hint: "Газ, дороги, охрана",
    keywords: "инфраструктура коммуникации газ электричество",
  },
  {
    label: "Ипотека",
    href: "/#calculator",
    Icon: Calculator,
    hint: "Калькулятор и условия",
    keywords: "ипотека калькулятор кредит платёж",
  },
  {
    label: "Отзывы",
    href: "/#reviews",
    Icon: MessageSquare,
    hint: "Что говорят клиенты",
    keywords: "отзывы клиенты мнения",
  },
  {
    label: "Как купить",
    href: "/#steps",
    Icon: ListChecks,
    hint: "Пошаговый процесс",
    keywords: "как купить шаги процесс инструкция",
  },
  {
    label: "Контакты",
    href: "/#contacts",
    Icon: PhoneCall,
    hint: "Телефон и адрес",
    keywords: "контакты телефон офис",
  },
  {
    label: "Избранное",
    href: "/favorites",
    Icon: Heart,
    hint: "Сохранённые посёлки",
    keywords: "избранное сохранённое подборка",
  },
];

function scoreVillage(v: Village, q: string): number {
  const name = normalize(v.name);
  const slug = normalize(v.slug);
  const dir = normalize(v.direction);
  const feats = normalize((v.features ?? []).join(" "));
  const desc = normalize(v.description ?? "");

  if (name === q || slug === q) return 1000;
  if (name.startsWith(q)) return 700;
  if (name.includes(q)) return 500;
  if (slug.includes(q)) return 400;
  if (dir.includes(q)) return 120;
  if (feats.includes(q)) return 80;
  if (desc.includes(q)) return 30;
  return 0;
}

/* ─────────────────────── component ─────────────────────── */

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open / close shortcuts
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

  // Lock body scroll & autofocus
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const q = normalize(query);

  const villageHits = useMemo(() => {
    if (!q) return villages.slice(0, 6);
    return villages
      .map((v) => ({ v, s: scoreVillage(v, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((r) => r.v);
  }, [q]);

  const sectionHits = useMemo<SectionHit[]>(() => {
    if (!q) {
      return SECTIONS.slice(0, 4).map((s) => ({ ...s, kind: "section" }));
    }
    return SECTIONS.filter((s) => {
      const label = normalize(s.label);
      const kw = normalize(s.keywords);
      return label.includes(q) || kw.includes(q);
    }).map((s) => ({ ...s, kind: "section" }));
  }, [q]);

  // Flatten for keyboard navigation: villages first, then sections
  const flat = useMemo(
    () => [
      ...villageHits.map((v) => ({ kind: "village" as const, v })),
      ...sectionHits.map((s) => ({ kind: "section" as const, s })),
    ],
    [villageHits, sectionHits]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = flat[activeIndex];
      if (!item) return;
      const href =
        item.kind === "village" ? `/village/${item.v.slug}` : item.s.href;
      window.location.href = href;
    }
  };

  return (
    <>
      {/* Trigger button — compact round icon */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Поиск по сайту"
        title="Поиск (⌘K)"
        className="w-11 h-11 md:w-9 md:h-9 rounded-full bg-gray-100 hover:bg-green-50 border border-gray-200/80 hover:border-green-200 flex items-center justify-center transition-all group"
      >
        <Search className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[80vh]">
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Найти посёлок, направление или раздел…"
                className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {flat.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Ничего не нашлось по запросу{" "}
                    <span className="font-semibold text-gray-700">
                      «{query}»
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Попробуйте «Каширское», «Ипотека» или название посёлка
                  </p>
                </div>
              ) : (
                <>
                  {villageHits.length > 0 && (
                    <div className="py-2">
                      <div className="px-5 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Посёлки
                      </div>
                      {villageHits.map((v, i) => (
                        <VillageRow
                          key={v.slug}
                          village={v}
                          active={activeIndex === i}
                          onHover={() => setActiveIndex(i)}
                          onClick={() => setOpen(false)}
                        />
                      ))}
                    </div>
                  )}

                  {sectionHits.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-5 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Разделы сайта
                      </div>
                      {sectionHits.map((s, i) => {
                        const idx = villageHits.length + i;
                        return (
                          <SectionRow
                            key={s.href}
                            section={s}
                            active={activeIndex === idx}
                            onHover={() => setActiveIndex(idx)}
                            onClick={() => setOpen(false)}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="hidden sm:flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 text-[11px] text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  навигация
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd>
                  открыть
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>esc</Kbd>
                  закрыть
                </span>
              </div>
              <div className="text-gray-400">ЗемПлюс</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────── rows ─────────────────────── */

function VillageRow({
  village,
  active,
  onHover,
  onClick,
}: {
  village: Village;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const photo = village.photos[0];
  return (
    <a
      href={`/village/${village.slug}`}
      onMouseEnter={onHover}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${
        active ? "bg-green-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-emerald-200 shrink-0 ring-1 ring-black/5">
        {photo ? (
          <Image
            src={photo}
            alt={village.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900 truncate">
          {village.name}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {village.direction} · {village.distance} км от МКАД
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-gray-400">
          от
        </div>
        <div className="text-sm font-bold text-green-600">
          {village.priceFrom.toLocaleString("ru-RU")} ₽
        </div>
      </div>
      <ArrowRight
        className={`w-4 h-4 ml-1 shrink-0 transition-all ${
          active ? "text-green-600 translate-x-0.5" : "text-gray-300"
        }`}
      />
    </a>
  );
}

function SectionRow({
  section,
  active,
  onHover,
  onClick,
}: {
  section: SectionHit;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const Icon = section.Icon;
  return (
    <a
      href={section.href}
      onMouseEnter={onHover}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-2.5 transition-colors ${
        active ? "bg-green-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">
          {section.label}
        </div>
        <div className="text-xs text-gray-500">{section.hint}</div>
      </div>
      <ArrowRight
        className={`w-4 h-4 shrink-0 transition-all ${
          active ? "text-green-600 translate-x-0.5" : "text-gray-300"
        }`}
      />
    </a>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-white border border-gray-200 text-[10px] font-mono text-gray-500">
      {children}
    </kbd>
  );
}
