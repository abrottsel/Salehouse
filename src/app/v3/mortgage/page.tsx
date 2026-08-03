import type { Metadata } from "next";
import MortgageCalc from "../_components/pages/MortgageCalc";
import PageHero from "../_components/pages/PageHero";

export const metadata: Metadata = {
  title: "Ипотека на участок",
  description:
    "Калькулятор ипотеки на земельный участок: стоимость, первоначальный взнос, срок и ставка — платёж и переплата считаются сразу. Ставки шести банков-партнёров и заявка онлайн.",
};

export default function V3MortgagePage() {
  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-2 sm:px-6 sm:pt-4">
      <PageHero
        eyebrow="Ипотека"
        title="Свой участок"
        accent="дешевле аренды квартиры"
        sub="Шесть банков-партнёров, одобрение за два дня. Подвигайте ползунки — платёж и переплата пересчитаются сразу."
      />

      <div className="mt-9 sm:mt-14">
        <MortgageCalc />
      </div>
    </main>
  );
}
