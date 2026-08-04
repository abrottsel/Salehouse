"use client";

import { useTier } from "../../../_lib/perf";

/**
 * C · «Топография».
 *
 * Изолинии рельефа, как на топосъёмке участка. Два слоя с разными
 * центрами очень медленно расходятся — движение читается боковым
 * зрением, но глаз за ним не бежит и текст не мешает.
 */
export default function Topo() {
  const lite = useTier() === "lite";

  const ring = (x: string, y: string, step: number) =>
    `repeating-radial-gradient(circle at ${x} ${y}, transparent 0 ${step}px, var(--v3-sec-line) ${step}px ${
      step + 1
    }px)`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute inset-[-20%] ${lite ? "" : "v3-sec-topo"}`}
        style={{
          backgroundImage: ring("28%", "34%", 26),
          maskImage: "radial-gradient(100% 80% at 30% 40%, #000 10%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(100% 80% at 30% 40%, #000 10%, transparent 72%)",
        }}
      />
      <div
        className={`absolute inset-[-20%] ${lite ? "" : "v3-sec-topo"}`}
        style={{
          backgroundImage: ring("78%", "72%", 32),
          maskImage: "radial-gradient(100% 80% at 78% 70%, #000 10%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(100% 80% at 78% 70%, #000 10%, transparent 72%)",
          animationDelay: "-14s",
          animationDirection: "reverse",
        }}
      />
    </div>
  );
}
