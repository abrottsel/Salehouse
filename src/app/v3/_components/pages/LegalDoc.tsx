import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "../ui/primitives";
import { Reveal } from "../ui/motion";

/**
 * Оболочка юридического документа на /v3 (оферта, политика).
 *
 * Тексты документов переносятся из боевых страниц ДОСЛОВНО — здесь только
 * оформление. Вся типографика длинного текста живёт в классе `.v3-legal`
 * (см. v3.css): в разметке документа на сотню абзацев проще держать
 * чистые <p>/<ul>/<h2>, чем таскать одинаковый набор классов по каждому.
 *
 * Колонка ограничена 70 символами (`max-width: 70ch`) — на широком экране
 * строка иначе уезжает за комфортные ~75 знаков и глаз теряет начало.
 */
export function LegalShell({
  eyebrow,
  title,
  revision,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Строка «Редакция от …, версия …» — часть документа, не украшение. */
  revision: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-2 sm:px-6 sm:pt-4">
      <header className="relative isolate pt-10 sm:pt-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[420px]"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 0%, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 70%)",
          }}
        />
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-[20ch] text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-[46px] sm:leading-[1.06]">
            {title}
          </h1>
          <p className="mt-4 inline-flex rounded-full bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold text-white/45 ring-1 ring-white/[0.08]">
            {revision}
          </p>
        </Reveal>
      </header>

      <article className="v3-legal mt-9 sm:mt-12">{children}</article>

      <p className="mt-10">
        <Link
          href="/v3"
          className="inline-flex min-h-[44px] items-center gap-2 text-[14px] font-bold text-emerald-300 transition-colors hover:text-emerald-200"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>
      </p>
    </main>
  );
}

/** Раздел документа: номер вынесен в отдельную колонку, текст остаётся дословным. */
export function LegalSection({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0 sm:mt-12">
      <h2 className="flex items-baseline gap-3 text-[19px] font-extrabold leading-snug text-white sm:text-[23px]">
        <span className="shrink-0 text-[14px] font-extrabold tabular-nums text-emerald-300/90 sm:text-[16px]">
          {n}
        </span>
        <span>{title}</span>
      </h2>
      <div className="mt-3.5 border-l border-white/[0.08] pl-4 sm:pl-5">{children}</div>
    </section>
  );
}

/** Врезка «Важно» — выделяет предупреждение, которое нельзя пролистать. */
export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <aside className="mt-8 rounded-[22px] bg-amber-400/[0.07] p-4 ring-1 ring-amber-300/25 sm:p-5">
      {children}
    </aside>
  );
}

/** Мелкая сноска в конце документа. */
export function LegalFootnote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 border-t border-white/[0.08] pt-5 text-[12.5px] leading-relaxed text-white/35">
      {children}
    </p>
  );
}
