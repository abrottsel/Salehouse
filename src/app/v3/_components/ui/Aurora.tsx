"use client";

import { useMemo } from "react";
import { useTier } from "../../_lib/perf";

/**
 * Живой фон-аврора: дрейфующие цветные пятна + звёздная пыль.
 * Идея слоёв подсмотрена у AuroraBackground с 21st.dev, переписана
 * под наш зелёный бренд, tier-деградацию и CSS-анимации вместо
 * Framer Motion (дешевле для фона, который крутится всегда).
 *
 * tier "lite" — один статичный градиент, ни blur-слоёв, ни звёзд.
 */
export default function Aurora({
  className = "",
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const tier = useTier();

  // Позиции звёзд детерминированы: Math.random() дал бы расхождение
  // разметки между сервером и клиентом.
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const a = (i * 137.508) % 360; // золотой угол — равномерно без кучкования
        const r = ((i * 61) % 100) / 100;
        return {
          left: `${(Math.cos((a * Math.PI) / 180) * r * 0.5 + 0.5) * 100}%`,
          top: `${(Math.sin((a * Math.PI) / 180) * r * 0.5 + 0.5) * 100}%`,
          size: 1 + ((i * 7) % 3) * 0.5,
          delay: `${((i * 13) % 40) / 10}s`,
          dur: `${3 + ((i * 17) % 30) / 10}s`,
        };
      }),
    [],
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* базовая заливка — есть всегда, в том числе на lite */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(16,185,129,0.16) 0%, transparent 60%)," +
            "radial-gradient(90% 60% at 90% 10%, rgba(163,230,53,0.10) 0%, transparent 55%)," +
            "linear-gradient(180deg, #0b0e13 0%, #0a0d11 100%)",
        }}
      />

      {tier === "full" && (
        <>
          <div
            className="v3-aurora-blob absolute -left-[15%] top-[-20%] h-[70vh] w-[70vh] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.35), transparent 65%)",
              filter: "blur(90px)",
              opacity: 0.7 * intensity,
            }}
          />
          <div
            className="v3-aurora-blob absolute right-[-10%] top-[10%] h-[55vh] w-[55vh] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(132,204,22,0.28), transparent 65%)",
              filter: "blur(100px)",
              opacity: 0.6 * intensity,
              animationDelay: "-7s",
            }}
          />
          <div
            className="v3-aurora-blob absolute bottom-[-25%] left-[30%] h-[60vh] w-[60vh] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(20,184,166,0.25), transparent 65%)",
              filter: "blur(110px)",
              opacity: 0.5 * intensity,
              animationDelay: "-14s",
            }}
          />

          <div className="absolute inset-0">
            {stars.map((s, i) => (
              <span
                key={i}
                className="v3-star absolute rounded-full bg-white"
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
        </>
      )}

      {/* мягкое затемнение к низу, чтобы контент читался */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b0e13] to-transparent" />
    </div>
  );
}
