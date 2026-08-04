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
    // Своего верхнего отступа у шапки нет: его задаёт страница одним
    // общим значением pt-6 sm:pt-10, одинаковым и на главной, — иначе
    // при переходе между страницами контент прыгает по вертикали.
    <header className="relative isolate">
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
