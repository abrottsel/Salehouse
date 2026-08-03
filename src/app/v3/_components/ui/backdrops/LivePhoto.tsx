"use client";

import Image from "next/image";
import { useTier } from "../../../_lib/perf";

/**
 * Вариант D — «Живое фото».
 *
 * Настоящая аэросъёмка посёлка с медленным наездом и цветной вуалью.
 * Самый надёжный вариант из четырёх: виден при любой яркости, ничего
 * не рисуется процедурно, работает даже на старом железе. И показывает
 * товар лицом — это всё-таки продажа земли, а не техно-стартап.
 */
export default function LivePhoto({
  src = "/villages/favorit/01.jpg",
}: {
  src?: string;
}) {
  const tier = useTier();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={tier === "full" ? "v3-kenburns absolute inset-0" : "absolute inset-0"}>
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={80}
        />
      </div>

      {/* Вуаль под текст — слева плотнее, чтобы заголовок читался. Цвет берётся
          из переменных темы: днём она светлая, ночью тёмная, фото одно и то же. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--v3-veil-strong), var(--v3-veil-mid) 55%, var(--v3-veil-soft))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--v3-veil-solid), transparent 50%, var(--v3-veil-top))",
        }}
      />

      {/* Фирменная подсветка поверх фото */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 12% 30%, rgba(16,185,129,0.24) 0%, transparent 62%)",
        }}
      />
    </div>
  );
}
