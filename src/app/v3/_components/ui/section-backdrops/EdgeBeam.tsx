"use client";

import { useTier } from "../../../_lib/perf";

/**
 * G · «Кромка».
 *
 * Под текстом вообще ничего не происходит: живут только две волосяные
 * линии по границам секции, по ним изредка пробегает световой блик. Самый
 * тихий вариант — на случай, если фоновое движение под контентом
 * покажется лишним.
 */
export default function EdgeBeam() {
  const lite = useTier() === "lite";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {["top-0", "bottom-0"].map((pos, i) => (
        <span
          key={pos}
          className={`absolute inset-x-0 h-px ${pos}`}
          style={{ background: "var(--v3-sec-line)" }}
        >
          {!lite && (
            <span
              className="v3-sec-beam absolute inset-y-0 w-[26%]"
              style={{ animationDelay: `${i * 4}s` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
