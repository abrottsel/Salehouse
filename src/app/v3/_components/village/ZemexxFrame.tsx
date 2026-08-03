"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerClick } from "lucide-react";
import RouteBadgeDark from "../RouteBadgeDark";
import { glassStyle } from "../ui/primitives";

/**
 * Фрейм карты Земекс — один в один как на боевой странице посёлка,
 * плюс решение проблемы со скроллом.
 *
 * Суть проблемы: фрейм чужого домена, залезть внутрь и отключить там
 * зум колесом нельзя — межсайтовые ограничения браузера. Поэтому
 * лечим снаружи: пока карта «спит», поверх неё лежит прозрачный щит.
 * Колесо и палец попадают в щит, а не во фрейм, и страница прокручивается
 * нормально. По клику щит убирается, фрейм оживает и работает как
 * обычно — можно и зумить, и таскать.
 *
 * Обратно карта засыпает, когда курсор ушёл с неё или страницу
 * прокрутили дальше: иначе один раз кликнув, пользователь навсегда
 * теряет возможность пролистать страницу мимо карты.
 */
export default function ZemexxFrame({
  src,
  villageName,
  villageCoords,
}: {
  src: string;
  villageName: string;
  villageCoords: [number, number];
}) {
  const [awake, setAwake] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  const sleep = useCallback(() => setAwake(false), []);

  useEffect(() => {
    if (!awake) return;

    // Ушли курсором с карты — усыпляем.
    const host = hostRef.current;
    host?.addEventListener("mouseleave", sleep);

    // Прокрутили страницу так, что карта почти скрылась — тоже усыпляем.
    // Без этого на телефоне карта остаётся «живой» за пределами экрана
    // и перехватывает жесты при возврате.
    const onScroll = () => {
      const r = host?.getBoundingClientRect();
      if (!r) return;
      const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (visible < r.height * 0.35) sleep();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      host?.removeEventListener("mouseleave", sleep);
      window.removeEventListener("scroll", onScroll);
    };
  }, [awake, sleep]);

  return (
    <div
      ref={hostRef}
      className="relative overflow-hidden rounded-[24px] ring-1 ring-white/10"
    >
      <iframe
        src={src}
        width="100%"
        height="850"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Карта участков — ${villageName}`}
        className={`block w-full border-0 min-h-[560px] sm:min-h-[750px] lg:min-h-[85vh] ${
          awake ? "" : "pointer-events-none"
        }`}
      />

      {/* Щит. Держит скролл страницы, пока карту не разбудили. */}
      {!awake && (
        <button
          type="button"
          onClick={() => setAwake(true)}
          aria-label="Включить карту участков"
          className="group absolute inset-0 flex cursor-pointer items-end justify-center bg-transparent pb-6 sm:items-center sm:pb-0"
        >
          <span
            style={glassStyle}
            className="pointer-events-none flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100"
          >
            <MousePointerClick className="h-4 w-4 text-emerald-300" />
            Нажмите, чтобы работать с картой
          </span>
        </button>
      )}

      {/* «Дорога к мечте» — поверх фрейма, как на боевой странице.
          Слой не ловит клики целиком: их ловит только сама кнопка,
          иначе он перекрыл бы карту. */}
      <div className="pointer-events-none absolute right-3 top-3 z-30 flex justify-end sm:right-5 sm:top-5">
        <div className="pointer-events-auto">
          <RouteBadgeDark
            villageCoords={villageCoords}
            villageName={villageName}
            align="right"
          />
        </div>
      </div>
    </div>
  );
}
