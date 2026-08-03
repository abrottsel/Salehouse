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

      {/* Затемнение под текст — слева плотнее, чтобы заголовок читался */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e13]/92 via-[#0b0e13]/70 to-[#0b0e13]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e13] via-transparent to-[#0b0e13]/60" />

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
