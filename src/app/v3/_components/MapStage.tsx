"use client";

import { useState } from "react";
import MockBackdrop from "./MockBackdrop";
import OverlayGlass from "./OverlayGlass";
import OverlayDock from "./OverlayDock";
import OverlaySidebar from "./OverlaySidebar";
import type { OverlayVillage } from "./shared";

type VariantKey = "glass" | "dock" | "sidebar";

const VARIANTS: { key: VariantKey; title: string; note: string }[] = [
  { key: "glass", title: "A · Стекло", note: "слои по углам, карта открыта" },
  { key: "dock", title: "B · Док", note: "всё в одной панели снизу" },
  { key: "sidebar", title: "C · Сайдбар", note: "список участков справа" },
];

export default function MapStage({
  village,
  iframeUrl,
}: {
  village: OverlayVillage;
  iframeUrl?: string;
}) {
  const [variant, setVariant] = useState<VariantKey>("glass");
  const [live, setLive] = useState(false);

  const Overlay =
    variant === "glass" ? OverlayGlass : variant === "dock" ? OverlayDock : OverlaySidebar;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VARIANTS.map((v) => {
          const active = v.key === variant;
          return (
            <button
              key={v.key}
              onClick={() => setVariant(v.key)}
              className={`rounded-2xl px-4 py-2.5 text-left ring-1 transition-all ${
                active
                  ? "bg-emerald-500 text-white ring-emerald-400"
                  : "bg-white/[0.05] text-white/75 ring-white/12 hover:bg-white/[0.1]"
              }`}
            >
              <div className="text-[13px] font-bold">{v.title}</div>
              <div className={`text-[11px] ${active ? "text-white/80" : "text-white/45"}`}>
                {v.note}
              </div>
            </button>
          );
        })}

        <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-2xl bg-white/[0.05] px-4 py-2.5 text-[12px] font-semibold text-white/70 ring-1 ring-white/12">
          <input
            type="checkbox"
            checked={live}
            onChange={(e) => setLive(e.target.checked)}
            className="accent-emerald-400"
          />
          живой фрейм Земекс
        </label>
      </div>

      <div className="relative overflow-hidden rounded-[28px] ring-1 ring-white/10">
        <div className="relative h-[640px] sm:h-[760px]">
          {live && iframeUrl ? (
            <iframe
              src={iframeUrl}
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              title={`Карта участков — ${village.name}`}
            />
          ) : (
            <MockBackdrop />
          )}

          <Overlay village={village} />
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-white/45">
        Оверлей лежит отдельным слоем с <code className="text-white/65">pointer-events-none</code>;
        клики ловят только сами панели, поэтому карта под ними остаётся кликабельной. Включи
        «живой фрейм», чтобы увидеть слой поверх настоящей карты Земекс — с этой машины хост{" "}
        <code className="text-white/65">map.zemexx.ru</code> сейчас не отвечает, поэтому по
        умолчанию стоит подложка-заглушка.
      </p>
    </>
  );
}
