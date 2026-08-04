"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Loader2, Route, Search, X } from "lucide-react";
import { formatDuration, saveHomePlace, useHomeRoute, type UserPlace } from "../_lib/route-home";

/**
 * «Дорога к мечте» — тёмный вариант для /v3.
 *
 * Визуал новый, логика та же, что у эталонного HomeDistanceBadge:
 * те же ключи localStorage (адрес дома переносится между версиями
 * сайта) и те же эндпоинты — /api/my-ip-location, /api/dadata-suggest
 * с откатом на /api/geocode, /api/route с haversine-подстраховкой.
 * Само хранилище и расчёт маршрута вынесены в _lib/route-home: их же
 * использует мини-чип карточки каталога.
 *
 * Боевой компонент src/components/HomeDistanceBadge.tsx не тронут.
 *
 * Панель раскрытия подчиняется правилам эталона (CLAUDE.md → «HomeDistanceBadge»):
 * createPortal в body, фиксированные ширины 260/288, позиция считается от
 * кнопки и прижимается к экрану. Абсолютное позиционирование внутри
 * родителя не годится: над картой родитель — карточка с overflow-hidden,
 * панель обрезалась её краем.
 */

interface Suggestion {
  address: string;
  coords: [number, number];
}

/** Панель уходит порталом в body, то есть за пределы .v3-scope, где живут
 *  переменные темы. Собственный непрозрачный фон вместо glassStyle нужен
 *  сразу по двум причинам: подмена --v3-glass светлой темой её больше не
 *  достаёт, а отсутствие backdrop-filter снимает известную беду WebKit —
 *  над кроссдоменным iframe отфильтрованный фон не собирается, и панель
 *  заливало цветом карты. */
const PANEL_STYLE: CSSProperties = {
  backgroundColor: "#0f141b",
  backgroundImage:
    "linear-gradient(160deg, rgba(28,35,45,0.94), rgba(12,16,22,0.98))",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -0.5px 0 rgba(255,255,255,0.05), 0 24px 60px -20px rgba(0,0,0,0.8)",
};

const EDGE = 8; // минимальный зазор до края экрана
const GAP = 8; // зазор между кнопкой и панелью

export default function RouteBadgeDark({
  villageCoords,
  villageName,
  align = "left",
}: {
  villageCoords: [number, number];
  villageName: string;
  /** С какого края кнопки разворачивается панель. На узком экране панель
   *  шире кнопки, и якорь не с той стороны уводит её за край. */
  align?: "left" | "right";
}) {
  const { home, route } = useHomeRoute(villageCoords);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [mounted, setMounted] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Портал доступен только на клиенте. Флаг ставим таймером: синхронный
  // setState в теле эффекта запрещён правилом react-hooks/set-state-in-effect.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  /** Координаты панели пишем прямо в DOM, а не через setState: положение
   *  обязано быть верным в том же кадре, в котором панель появилась, иначе
   *  она успевает мигнуть в старом месте. */
  const place = useCallback(() => {
    const btn = buttonRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    const r = btn.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;

    // Над картой панель уходит влево от правого края кнопки: слева у Земекса
    // легенда цен, накрывать её нельзя. В hero — наоборот, от левого края.
    const desiredLeft = align === "right" ? r.right - w + GAP : r.left;
    panel.style.left = `${Math.max(EDGE, Math.min(desiredLeft, vw - w - EDGE))}px`;
    panel.style.top = `${Math.max(EDGE, Math.min(r.bottom + GAP, vh - h - EDGE))}px`;
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    // Панель зафиксирована на экране, поэтому пересчёт при любом сдвиге
    // страницы обязателен — capture ловит и прокрутку внутренних блоков.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  // Клик мимо панели и Escape закрывают её. Без этого на телефоне панель
  // висит поверх hero, пока не попадёшь точно в крестик.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      // Панель живёт в портале, внутрь rootRef она не попадает — проверяем оба.
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const savePlace = useCallback((place: UserPlace) => {
    saveHomePlace(place);
    setOpen(false);
    setQuery("");
    setSuggestions([]);
  }, []);

  // Поиск адреса: DaData, при неудаче — Nominatim через наш /api/geocode.
  useEffect(() => {
    const q = query.trim();
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        let res = await fetch(`/api/dadata-suggest?q=${encodeURIComponent(query)}`);
        if (!res.ok) res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const json = await res.json();
        const raw: unknown[] = Array.isArray(json) ? json : (json?.suggestions ?? json?.results ?? []);
        setSuggestions(
          raw
            .map((r) => {
              const o = r as Record<string, unknown>;
              const lat = Number(o.lat ?? o.latitude);
              const lon = Number(o.lon ?? o.lng ?? o.longitude);
              const address = String(o.address ?? o.value ?? o.display_name ?? "");
              return Number.isFinite(lat) && Number.isFinite(lon) && address
                ? { address, coords: [lat, lon] as [number, number] }
                : null;
            })
            .filter((x): x is Suggestion => x !== null)
            .slice(0, 5),
        );
      } catch {
        /* сеть отвалилась — подсказок просто не будет */
      }
    }, 180);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  const useMyLocation = useCallback(async () => {
    setBusy(true);
    const finish = (coords: [number, number], address: string) => {
      savePlace({ id: "home", label: "Дом", address, coords });
      setBusy(false);
    };

    const byIp = async () => {
      try {
        const res = await fetch("/api/my-ip-location");
        const j = await res.json();
        if (typeof j?.lat === "number" && typeof j?.lon === "number") {
          finish([j.lat, j.lon], j.address ?? "Определено по IP");
          return;
        }
      } catch {
        /* ничего не поделать */
      }
      setBusy(false);
    };

    if (!navigator.geolocation) return byIp();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        let address = "Моё местоположение";
        try {
          const res = await fetch(`/api/geocode?lat=${coords[0]}&lon=${coords[1]}`);
          if (res.ok) {
            const j = await res.json();
            address = j?.address ?? j?.display_name ?? address;
          }
        } catch {
          /* оставим подпись по умолчанию */
        }
        finish(coords, address);
      },
      byIp,
      { timeout: 8000, maximumAge: 600000 },
    );
  }, [savePlace]);

  return (
    // v3-on-dark: плашка живёт поверх карты и фото, они тёмные в обеих темах.
    <div className="v3-on-dark relative" ref={rootRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={home ? "Изменить адрес" : "Указать ваш адрес"}
        // Размер и вид один в один с боевым HomeDistanceBadge: та же
        // высота 28px, те же отступы, кегль и заливка. Наш прежний вариант
        // был вдвое выше и тёмный — рядом с зелёной кнопкой «Путь» он
        // выглядел чужеродным блоком, а не парной кнопкой.
        className={`inline-flex h-7 items-center gap-1.5 rounded-full pl-2 pr-2.5 text-[11px] font-bold text-white shadow-lg ring-1 backdrop-blur-md transition ${
          route
            ? "bg-emerald-500/85 ring-emerald-300/50 hover:bg-emerald-500/95"
            : "bg-black/40 ring-white/25 hover:bg-black/55"
        }`}
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
            route ? "bg-white/25" : "bg-emerald-500"
          }`}
        >
          <Route className="h-2.5 w-2.5 text-white" />
        </span>
        {route ? (
          // Без приставки «от дома»: на проде её нет, а рядом с «Путь»
          // она делала кнопку вдвое длиннее.
          <span className="whitespace-nowrap leading-none tabular-nums">
            {formatDuration(route.durationMin)} · {Math.round(route.distanceKm)} км
          </span>
        ) : (
          <span>Дорога к мечте</span>
        )}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                // Ширина строго фиксированная: 260 на телефоне, 288 дальше.
                // Проценты от вьюпорта здесь уже пробовали — панель то распирало,
                // то она не помещалась рядом с кнопкой.
                className="fixed left-0 top-0 z-[95] w-[260px] rounded-[24px] p-4 text-white sm:w-[288px]"
                style={PANEL_STYLE}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="text-[14px] font-extrabold">
                      Дорога к мечте
                    </div>
                    <div className="text-[11px] text-white/55">
                      Сколько ехать до «{villageName}»
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Закрыть"
                    className="-mr-1.5 -mt-1.5 grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={useMyLocation}
                  disabled={busy}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 text-[13px] font-bold transition-colors hover:bg-emerald-400 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crosshair className="h-4 w-4" />
                  )}
                  Моё местоположение
                </button>
                <p className="mt-1.5 text-center text-[11px] text-white/40">
                  Координаты не покидают браузер
                </p>

                <div className="my-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
                  <span className="h-px flex-1 bg-white/12" />
                  или укажите адрес
                  <span className="h-px flex-1 bg-white/12" />
                </div>

                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 ring-1 ring-white/25">
                  <Search className="h-4 w-4 shrink-0 text-white/55" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Москва, Тверская, 1"
                    aria-label="Адрес вашего дома"
                    className="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-white/45"
                  />
                </div>

                {suggestions.length > 0 && (
                  <ul className="v3-scroll mt-2 max-h-[168px] space-y-1 overflow-y-auto">
                    {suggestions.map((s) => (
                      <li key={s.address}>
                        <button
                          onClick={() =>
                            savePlace({
                              id: "home",
                              label: "Дом",
                              address: s.address,
                              coords: s.coords,
                            })
                          }
                          className="w-full rounded-xl px-3 py-2 text-left text-[12px] leading-snug text-white/75 transition-colors hover:bg-white/[0.09] hover:text-white"
                        >
                          {s.address}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {home && (
                  <p className="mt-3 truncate border-t border-white/10 pt-2.5 text-[11px] text-white/40">
                    Сейчас: {home.address}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
