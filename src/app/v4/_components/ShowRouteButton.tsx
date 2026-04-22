"use client";

/**
 * ShowRouteButton (v4) — emerald pill on the iframe map that opens
 * RouteMapOverlay when the user has a saved «Дом». The overlay is
 * rendered inline as a sibling of the iframe (see
 * /v4/village/[slug]/page.tsx); the iframe stays mounted underneath.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Route as RouteIcon } from "lucide-react";
import RouteMapOverlay from "./RouteMapOverlay";

interface UserPlace {
  id: string;
  label: string;
  address: string;
  coords: [number, number];
}

interface Props {
  villageCoords: [number, number];
  villageName: string;
}

const PLACES_STORAGE_KEY = "zemplus_user_places";
const PLACES_CHANGED_EVENT = "zemplus:places-changed";

function readHome(): UserPlace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLACES_STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as UserPlace[]) : [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const homey = arr.find((p) => /дом|home/i.test(p.label));
    return homey ?? arr[0] ?? null;
  } catch {
    return null;
  }
}

const MOBILE_BREAKPOINT = 640;
const PILL_HEIGHT = 28;
const TOP_OFFSET_MOBILE = 12;
const TOP_OFFSET_DESKTOP = 56;
const GAP = 8;

export default function ShowRouteButton({ villageCoords, villageName }: Props) {
  const [home, setHome] = useState<UserPlace | null>(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [rightPxDesktop, setRightPxDesktop] = useState<number>(180);

  const refresh = useCallback(() => setHome(readHome()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(PLACES_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PLACES_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useLayoutEffect(() => {
    if (!home) return;
    if (isMobile) return;
    const parent = buttonRef.current?.offsetParent as HTMLElement | null;
    if (!parent) return;
    const overlay = parent.querySelector(
      "[data-frame-overlay]",
    ) as HTMLElement | null;
    if (!overlay) return;

    const updatePosition = () => {
      const parentRect = parent.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      setRightPxDesktop(parentRect.right - overlayRect.left + GAP);
    };

    updatePosition();
    const ro = new ResizeObserver(updatePosition);
    ro.observe(overlay);
    window.addEventListener("resize", updatePosition);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [home, isMobile]);

  if (!home) return null;

  const style: React.CSSProperties = isMobile
    ? {
        right: 12,
        top: TOP_OFFSET_MOBILE + PILL_HEIGHT + GAP,
      }
    : {
        right: rightPxDesktop,
        top: TOP_OFFSET_DESKTOP,
      };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Показать маршрут от ${home.label} до ${villageName}`}
        style={style}
        className="absolute z-40 inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-full bg-emerald-500 ring-1 ring-emerald-300/50 text-white text-[11px] font-bold hover:bg-emerald-400 transition shadow-lg backdrop-blur-md"
      >
        <RouteIcon className="w-3.5 h-3.5" />
        Путь
      </button>

      <RouteMapOverlay
        open={open}
        onClose={() => setOpen(false)}
        homeCoords={home.coords}
        homeLabel={home.label || "Дом"}
        villageCoords={villageCoords}
        villageName={villageName}
      />
    </>
  );
}
