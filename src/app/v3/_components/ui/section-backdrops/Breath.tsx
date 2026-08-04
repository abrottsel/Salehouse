"use client";

import { useTier } from "../../../_lib/perf";

/**
 * A · «Дыхание».
 *
 * Два мягких пятна за секцией медленно набирают и отпускают яркость.
 * Ничего не пересекает строки текста: пятна размыты на 70px и стоят по
 * краям, так что под буквами остаётся ровное полотно.
 */
export default function Breath() {
  const lite = useTier() === "lite";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className={`absolute -left-[12%] top-[14%] h-[52vh] w-[52vh] rounded-full ${
          lite ? "" : "v3-sec-breath"
        }`}
        style={{
          background: "radial-gradient(circle, var(--v3-sec-glow-a), transparent 66%)",
          filter: "blur(70px)",
        }}
      />
      <span
        className={`absolute -right-[10%] top-[52%] h-[44vh] w-[44vh] rounded-full ${
          lite ? "" : "v3-sec-breath"
        }`}
        style={{
          background: "radial-gradient(circle, var(--v3-sec-glow-b), transparent 66%)",
          filter: "blur(80px)",
          animationDelay: "-6s",
        }}
      />
    </div>
  );
}
