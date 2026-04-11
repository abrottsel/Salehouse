import AdvantagesV1 from "@/components/advantages/AdvantagesV1";
import AdvantagesV2 from "@/components/advantages/AdvantagesV2";
import AdvantagesV2Pro from "@/components/advantages/AdvantagesV2Pro";
import AdvantagesV2Unified from "@/components/advantages/AdvantagesV2Unified";
import AdvantagesV3 from "@/components/advantages/AdvantagesV3";

export const metadata = {
  title: "Preview — Advantages variants",
  robots: { index: false, follow: false },
};

function Divider({ label }: { label: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4">
      <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-bold shadow-lg">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {label}
      </div>
    </div>
  );
}

export default function AdvantagesPreview() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.2em] text-green-400 mb-2">
            Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Варианты блока «Преимущества»
          </h1>
          <p className="text-gray-300 max-w-2xl text-sm sm:text-base">
            Три варианта редизайна. Листай вниз, сравни на десктопе и мобиле,
            скажи какой оставляем. Три верхних блока (Юр.&nbsp;чистота, 31&nbsp;посёлок,
            ИЖС) во всех вариантах некликабельные.
          </p>
        </div>
      </div>

      <Divider label="V2 UNIFIED · Одна сетка из 8 блоков (самый компактный)" />
      <AdvantagesV2Unified />

      <Divider label="V2 PRO · Развитая версия (паттерны + glow + giant stats)" />
      <AdvantagesV2Pro />

      <Divider label="V1 · Премиум доверие (сдержанный)" />
      <AdvantagesV1 />

      <Divider label="V2 · Яркие цветные блоки (bento)" />
      <AdvantagesV2 />

      <Divider label="V3 · Тёмный hero + акцентные карточки" />
      <AdvantagesV3 />

      <div className="py-20 text-center text-sm text-gray-500">
        Конец превью
      </div>
    </main>
  );
}
