import InfrastructureV1 from "@/components/infrastructure/InfrastructureV1";
import InfrastructureV2 from "@/components/infrastructure/InfrastructureV2";
import InfrastructureV3 from "@/components/infrastructure/InfrastructureV3";

export const metadata = {
  title: "Preview — Infrastructure variants",
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

export default function InfrastructurePreview() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.2em] text-green-400 mb-2">
            Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Варианты блока «Готовая инфраструктура»
          </h1>
          <p className="text-gray-300 max-w-2xl text-sm sm:text-base">
            Три варианта редизайна. Компактные по высоте, в стиле Advantages/FAQ,
            с CTA на заявку и ипотеку прямо внутри блока — короткий путь до
            оформления. Листай вниз, скажи какой оставляем.
          </p>
        </div>
      </div>

      <Divider label="V1 · Pastel bento + stat-banner снизу" />
      <InfrastructureV1 />

      <Divider label="V2 · Dark emerald hero наверху + feature-чипсы снизу" />
      <InfrastructureV2 />

      <Divider label="V3 · Split (stat-карточка слева, feature-list справа)" />
      <InfrastructureV3 />

      <div className="py-20 text-center text-sm text-gray-500">
        Конец превью
      </div>
    </main>
  );
}
