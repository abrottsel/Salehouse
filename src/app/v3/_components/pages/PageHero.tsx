import type { ReactNode } from "react";
import { Accent, Eyebrow } from "../ui/primitives";
import { Reveal } from "../ui/motion";

/**
 * Шапка внутренней страницы /v3: eyebrow + крупный H1 + подзаголовок.
 * Один компонент на четыре страницы — чтобы отступы и кегль не разъезжались.
 *
 * Свечение сделано радиальным градиентом, а не blur-слоем: градиент не
 * стоит ничего на слабых телефонах, где blur съедает кадры.
 */
export default function PageHero({
  eyebrow,
  title,
  accent,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    // Шапка плотная: на ноутбуке прежние отступы и кегль съедали весь
    // первый экран, и содержимое страницы (карточки, вопросы, отзывы,
    // форма) начиналось уже за нижней кромкой.
    <header className="relative isolate pt-4 sm:pt-6">
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
        <h1 className="mt-3 text-[30px] font-extrabold leading-[1.06] tracking-tight sm:text-[44px] sm:leading-[1.04]">
          {title}
          {accent && (
            <>
              {" "}
              <Accent>{accent}</Accent>
            </>
          )}
        </h1>
        {sub && (
          <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-white/55 sm:text-[16px]">
            {sub}
          </p>
        )}
        {children}
      </Reveal>
    </header>
  );
}
