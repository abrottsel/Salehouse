"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LEGAL } from "@/lib/legal";
import AssistantChat from "./AssistantChat";

/**
 * Плавающие мессенджеры /v3 — Telegram, MAX и чат-ассистент.
 *
 * Боевой SocialFloating на /v3 погашен (LegacyChrome), потому что вместе с
 * ним приезжал AI-чат, отправляющий заявки на /api/leads. Ассистент здесь
 * свой (AssistantChat): сценарий боевого, но ни одного запроса наружу.
 *
 * Размер — половина боевого: логотип 22px против 44px. Кликабельная
 * зона 36×44: по высоте держим полные 44px, по ширине ужали до 36 —
 * при 44 между иконками зияло 22px пустоты и ряд читался разрозненно.
 * Палец по-прежнему попадает: в ряду соседних кнопок критична высота.
 *
 * z-40: ниже шапки (z-50), ниже полноэкранной карты (z-90) и модалок
 * (z-100) — всплывать поверх них кнопки не должны.
 */

const CHANNELS = [
  {
    href: LEGAL.telegram,
    label: "Telegram",
    src: "/telegram-logo.png",
    /** Логотип — белый глиф на прозрачном, фирменный синий даём подложкой. */
    tile: "bg-gradient-to-br from-[#2AABEE] to-[#229ED9]",
  },
  { href: LEGAL.max, label: "MAX Messenger", src: "/max-logo.png", tile: "" },
];

/** Зазор до защищаемого элемента, px. */
const GAP = 10;

export default function FloatingMessengers() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [clear, setClear] = useState(true);
  const [lift, setLift] = useState(0);
  const pathname = usePathname();

  // Кнопки прячутся, когда наезжают на что-то важное — на подвал, на
  // карточку участка с «Забронировать», на кнопку отправки формы. Такие
  // элементы помечены data-float-guard; пересечение считаем по факту,
  // а не по списку страниц: полоса подвала и карта живут в разных местах
  // и на разной высоте.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const box = boxRef.current;
      if (!box) return;

      const r = box.getBoundingClientRect();
      let blocked = false;
      document.querySelectorAll("[data-float-guard]").forEach((el) => {
        if (blocked) return;
        const g = el.getBoundingClientRect();
        if (g.width === 0 || g.height === 0) return;
        blocked =
          g.left < r.right + GAP &&
          g.right > r.left - GAP &&
          g.top < r.bottom + GAP &&
          g.bottom > r.top - GAP;
      });
      setClear(!blocked);

      // Боевой cookie-баннер висит на z-[100] и до принятия согласия
      // полностью накрывает кнопки. Он вне нашей ветки, поэтому не
      // переставляем его, а поднимаемся над ним на его же высоту.
      const banner = document.querySelector("[data-cookie-banner]");
      const bh = banner ? Math.round(banner.getBoundingClientRect().height) : 0;
      setLift(bh > 0 && bh < window.innerHeight * 0.6 ? bh : 0);
    };

    // Только через rAF: измерять и звать setState прямо в теле эффекта
    // нельзя (react-hooks/set-state-in-effect), да и лишний layout при
    // каждом событии скролла ни к чему.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Cookie-баннер монтируется позже нас — на первом замере его ещё нет,
    // и без наблюдателя пилюля оставалась под ним до первого скролла.
    // Тот же наблюдатель ловит и его исчезновение после согласия.
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
    // pathname в зависимостях: после перехода набор защищённых элементов
    // другой, а скролла может не случиться вовсе.
  }, [pathname]);

  return (
    <div
      ref={boxRef}
      style={lift ? { transform: `translateY(-${lift}px)` } : undefined}
      className={`fixed bottom-3 right-3 z-40 transition-[opacity,transform] duration-200 sm:bottom-4 sm:right-4 ${
        clear ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!clear}
    >
      <div
        className="flex items-center rounded-full ring-1 ring-white/12 backdrop-blur-md"
        style={{
          background: "var(--v3-glass, linear-gradient(160deg, rgba(18,23,30,0.8), rgba(10,13,18,0.88)))",
          boxShadow: "0 10px 30px -12px rgba(0,0,0,0.7)",
        }}
      >
        {CHANNELS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={c.label}
            title={c.label}
            tabIndex={clear ? 0 : -1}
            className="grid h-11 w-9 place-items-center rounded-full transition-transform hover:scale-110 active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.src}
              alt={c.label}
              width={22}
              height={22}
              className={`h-[22px] w-[22px] rounded-[7px] object-contain ${c.tile}`}
            />
          </a>
        ))}

        <AssistantChat enabled={clear} />
      </div>
    </div>
  );
}
