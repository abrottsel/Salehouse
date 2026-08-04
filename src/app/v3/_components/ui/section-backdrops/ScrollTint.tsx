"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTier } from "../../../_lib/perf";

/**
 * E · «Скролл».
 *
 * Фон ничего не делает сам — он отвечает на прокрутку. Пока секция едет
 * через экран, световая волна проходит по ней сверху вниз и на выходе
 * гаснет. Движение всегда ровно такое, как ведёт палец: рябь на месте
 * невозможна по устройству.
 */
export default function ScrollTint() {
  const ref = useRef<HTMLDivElement>(null);
  const lite = useTier() === "lite";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "115%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.span
        className="absolute inset-x-[-20%] h-[46%]"
        style={{
          y: lite ? "40%" : y,
          opacity: lite ? 0.6 : opacity,
          background:
            "radial-gradient(60% 100% at 50% 50%, var(--v3-sec-glow-a), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </div>
  );
}
