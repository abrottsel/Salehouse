"use client";

import { useTier } from "../../../_lib/perf";

/**
 * B · «Кадастр».
 *
 * Сетка участков — тема сайта, а не абстракция. Сама сетка неподвижна:
 * под текстом ползущие линии дают рябь. Живёт только подсветка — раз в
 * несколько секунд загорается одна ячейка, как будто её выбрали на плане.
 */
const CELLS = [
  { left: "6%", top: "16%", delay: "0s" },
  { left: "72%", top: "10%", delay: "3.5s" },
  { left: "38%", top: "62%", delay: "7s" },
  { left: "86%", top: "58%", delay: "10.5s" },
];

export default function Cadastre() {
  const lite = useTier() === "lite";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--v3-sec-line) 1px, transparent 1px)," +
            "linear-gradient(to bottom, var(--v3-sec-line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          // Края растворяем, иначе секция выглядит обрезанным листом бумаги.
          maskImage: "radial-gradient(120% 90% at 50% 40%, #000 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 40%, #000 35%, transparent 78%)",
        }}
      />

      {!lite &&
        CELLS.map((c) => (
          <span
            key={c.left + c.top}
            className="v3-sec-cell absolute h-[72px] w-[72px]"
            style={{ left: c.left, top: c.top, animationDelay: c.delay }}
          />
        ))}
    </div>
  );
}
