"use client";

import { useMemo } from "react";
import { useTier } from "../../../_lib/perf";

/**
 * Вариант A — «Аврора+».
 *
 * Развитие текущего фона. Претензия заказчика была в том, что звёзды
 * не видно без максимальной яркости экрана: базовая непрозрачность была
 * 8%, размер 1–2px. Здесь звёзды крупнее и ярче, добавлены редкие
 * метеоры, а сами световые волны насыщеннее и с чёткой формой —
 * читаются даже на тусклом телефоне под солнцем.
 */
export default function AuroraPlus() {
  const tier = useTier();

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const a = (i * 137.508) % 360;
        const r = ((i * 61) % 100) / 100;
        return {
          left: `${(Math.cos((a * Math.PI) / 180) * r * 0.52 + 0.5) * 100}%`,
          top: `${(Math.sin((a * Math.PI) / 180) * r * 0.52 + 0.5) * 100}%`,
          size: 1.6 + ((i * 7) % 4) * 0.7,
          delay: `${((i * 13) % 40) / 10}s`,
          dur: `${2.6 + ((i * 17) % 26) / 10}s`,
        };
      }),
    [],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 90% at 50% -15%, rgba(16,185,129,0.30) 0%, transparent 58%)," +
            "radial-gradient(90% 65% at 88% 8%, rgba(163,230,53,0.20) 0%, transparent 55%)," +
            "linear-gradient(180deg, #0b0e13 0%, #090c10 100%)",
        }}
      />

      {tier === "full" && (
        <>
          <div
            className="v3-aurora-blob absolute -left-[12%] top-[-18%] h-[72vh] w-[72vh] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.55), transparent 62%)",
              filter: "blur(70px)",
            }}
          />
          <div
            className="v3-aurora-blob absolute right-[-8%] top-[6%] h-[58vh] w-[58vh] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(132,204,22,0.42), transparent 62%)",
              filter: "blur(80px)",
              animationDelay: "-7s",
            }}
          />
          <div
            className="v3-aurora-blob absolute bottom-[-22%] left-[26%] h-[62vh] w-[62vh] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(20,184,166,0.38), transparent 62%)",
              filter: "blur(90px)",
              animationDelay: "-14s",
            }}
          />

          <div className="absolute inset-0">
            {stars.map((s, i) => (
              <span
                key={i}
                className="v3-star-bright absolute rounded-full bg-white"
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  animationDelay: s.delay,
                  animationDuration: s.dur,
                }}
              />
            ))}
          </div>

          {/* Метеоры — редкие, но именно они дают «ах» */}
          {[0, 1, 2].map((i) => (
            <span
              key={`m${i}`}
              className="v3-meteor absolute"
              style={{
                left: `${18 + i * 30}%`,
                top: `${-6 + i * 5}%`,
                animationDelay: `${i * 5.5}s`,
              }}
            />
          ))}
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b0e13] to-transparent" />
    </div>
  );
}
