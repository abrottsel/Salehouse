"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Expand, MousePointerClick, X } from "lucide-react";
import RouteBadgeDark from "../RouteBadgeDark";
import ShowRouteButton from "@/components/ShowRouteButton";
import { glassStyle } from "../ui/primitives";

/**
 * Фрейм карты Земекс — как на боевой странице, плюс решение проблемы
 * со скроллом. Поведение РАЗНОЕ на мышке и на пальце, и это намеренно.
 *
 * Фрейм на чужом домене: отключить в нём зум колесом мы не можем,
 * межсайтовые ограничения. Лечим снаружи.
 *
 * Десктоп. Поверх спящей карты лежит прозрачный щит, колесо попадает
 * в него и страница прокручивается. Клик будит карту, уход курсора
 * усыпляет обратно. С мышкой это работает: увести курсор можно всегда.
 *
 * Телефон. Здесь такой приём даёт тупик, и первая версия в него попала:
 * разбудил карту тапом — фрейм забирает все касания, страницу не
 * пролистать, а «усыпить при прокрутке» не срабатывает, потому что
 * прокрутки и нет. Выйти можно было только перезагрузкой страницы.
 * Поэтому на телефоне карта внутри страницы не оживает вовсе: тап
 * открывает её на весь экран с явной кнопкой закрытия. Скролл страницы
 * не отнимается ни на секунду.
 */

const MOBILE_QUERY = "(max-width: 639px)";

export default function ZemexxFrame({
  src,
  villageName,
  villageCoords,
}: {
  src: string;
  villageName: string;
  villageCoords: [number, number];
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [awake, setAwake] = useState(false); // только десктоп
  const [fullscreen, setFullscreen] = useState(false); // только телефон
  const [mounted, setMounted] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setIsMobile(mq.matches);
    // Первое чтение — таймером, а не прямо в теле эффекта: синхронный
    // setState там даёт каскадный рендер, react-hooks на это ругается.
    const t = setTimeout(() => {
      setMounted(true);
      apply();
    }, 0);
    mq.addEventListener("change", apply);
    return () => {
      clearTimeout(t);
      mq.removeEventListener("change", apply);
    };
  }, []);

  const sleep = useCallback(() => setAwake(false), []);

  // Десктоп: увели курсор — карта засыпает.
  useEffect(() => {
    if (!awake || isMobile) return;
    const host = hostRef.current;
    host?.addEventListener("mouseleave", sleep);
    return () => host?.removeEventListener("mouseleave", sleep);
  }, [awake, isMobile, sleep]);

  // Полный экран: гасим прокрутку страницы под ним и закрываем по Escape.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const frame = (extraClass: string) => (
    <iframe
      src={src}
      allow="fullscreen"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Карта участков — ${villageName}`}
      className={`block w-full border-0 ${extraClass}`}
    />
  );

  // Карта интерактивна только когда её явно включили: на десктопе —
  // разбудили кликом, на телефоне — открыли на весь экран.
  const inlineInteractive = awake && !isMobile;

  return (
    <>
      <div
        ref={hostRef}
        // data-float-guard: плавающие мессенджеры уходят с кадра карты.
        // Кнопка «Забронировать» живёт внутри фрейма Земекс, снаружи её
        // не измерить — уступаем всей карте целиком.
        data-float-guard
        // На телефоне карта идёт от края до края: -mx-4 гасит px-4 колонки
        // страницы. Скругления и кольцо там же убираются — на полную ширину
        // они смотрятся обрезком карточки. С sm карта снова живёт в колонке.
        className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-[24px] sm:ring-1 sm:ring-white/10"
      >
        <div className={inlineInteractive ? "" : "pointer-events-none"}>
          {frame("h-[560px] sm:h-[750px] lg:h-[85vh]")}
        </div>

        {!inlineInteractive && (
          <button
            type="button"
            onClick={() => (isMobile ? setFullscreen(true) : setAwake(true))}
            aria-label={
              isMobile ? "Открыть карту участков на весь экран" : "Включить карту участков"
            }
            // pb-16, а не pb-6: у Земекса вдоль нижней кромки свои контролы —
            // слева копирайт Яндекса (32px), справа переключатель «Спутник»
            // (31px, 16px от низа). Плашка на 24px от низа их накрывала.
            // На десктопе она по центру кадра и появляется только по наведению.
            className="group absolute inset-0 flex cursor-pointer items-end justify-center bg-transparent pb-16 sm:items-center sm:pb-0"
          >
            <span
              style={glassStyle}
              className="pointer-events-none flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white/90 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
            >
              {isMobile ? (
                <>
                  <Expand className="h-4 w-4 text-emerald-300" />
                  Открыть карту на весь экран
                </>
              ) : (
                <>
                  <MousePointerClick className="h-4 w-4 text-emerald-300" />
                  Нажмите, чтобы работать с картой
                </>
              )}
            </span>
          </button>
        )}

        {/* «Дорога к мечте» поверх фрейма. Слева у Земекса легенда цен,
            поэтому бейдж справа. Отступ сверху не случайный: на широком
            экране Земекс ставит «Спутник» в правый верхний угол (12px от
            края, высота 34) — прижатый к верху бейдж его накрывал; на
            телефоне «Спутник» уезжает вниз, но отступ оставляем общим.
            Панель раскрытия уходит порталом в body, краем карточки её
            больше не режет. data-frame-overlay нужен кнопке «Путь» —
            она ищет его, чтобы встать слева. */}
        <div
          data-frame-overlay
          className="pointer-events-none absolute right-3 top-[104px] z-30 flex justify-end sm:right-5 sm:top-20"
        >
          <div className="pointer-events-auto">
            <RouteBadgeDark
              villageCoords={villageCoords}
              villageName={villageName}
              align="right"
            />
          </div>
        </div>

        <ShowRouteButton villageCoords={villageCoords} villageName={villageName} />
      </div>

      {mounted &&
        fullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-[#0b0e13]">
            {frame("h-[100dvh]")}
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Закрыть карту"
              style={glassStyle}
              className="absolute right-3 top-3 z-10 flex h-12 items-center gap-2 rounded-full px-4 text-[14px] font-bold text-white"
            >
              <X className="h-4 w-4" />
              Закрыть
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
