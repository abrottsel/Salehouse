"use client";

import type { CSSProperties, ReactNode } from "react";

/** Стекло тёмного премиума. Тёмная база обязательна — под панелью
 *  бывает светлая карта или фото, на прозрачном белый текст пропадает. */
export const glassStyle: CSSProperties = {
  backdropFilter: "blur(18px) saturate(1.5)",
  background: "linear-gradient(160deg, rgba(18,23,30,0.80), rgba(10,13,18,0.88))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -0.5px 0 rgba(255,255,255,0.05), 0 24px 60px -20px rgba(0,0,0,0.8)",
};

export function Glass({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`rounded-[24px] ${className}`} style={{ ...glassStyle, ...style }}>
      {children}
    </div>
  );
}

/** Заголовочный акцент бренда. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-lime-300 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-400/25">
      {children}
    </span>
  );
}

/** Основная кнопка. */
export function CTA({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-bold transition-all active:scale-[0.98]";
  const look =
    variant === "primary"
      ? "bg-emerald-500 text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 hover:bg-emerald-400"
      : "bg-white/[0.07] text-white ring-1 ring-white/15 hover:bg-white/[0.13]";
  const cls = `${base} ${look} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  accent,
  sub,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <header className={`mb-8 sm:mb-12 ${className}`}>
      {eyebrow && <div className="mb-3">{<Eyebrow>{eyebrow}</Eyebrow>}</div>}
      <h2 className="text-3xl font-extrabold leading-[1.08] sm:text-5xl">
        {title}
        {accent && (
          <>
            {" "}
            <Accent>{accent}</Accent>
          </>
        )}
      </h2>
      {sub && (
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/55 sm:text-[17px]">
          {sub}
        </p>
      )}
    </header>
  );
}
