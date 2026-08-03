import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MortgageCalc from "../pages/MortgageCalc";
import { Reveal } from "../ui/motion";
import { SectionTitle } from "../ui/primitives";

/**
 * Ипотека на главной, сразу после каталога.
 *
 * Калькулятор тот же самый, что на /v3/mortgage — компонент общий, чтобы
 * ставки банков и формула не разъехались между двумя местами.
 */
export default function MortgageSection() {
  return (
    <section id="mortgage" className="mx-auto mt-20 max-w-[1400px] px-4 sm:mt-28 sm:px-6">
      <Reveal>
        <SectionTitle
          eyebrow="Ипотека и рассрочка"
          title="Свой участок дешевле"
          accent="аренды квартиры"
          sub="Посчитайте платёж по своим параметрам. Подадим заявку в партнёрские банки и получим ставку со скидкой."
        />
      </Reveal>

      <Reveal delay={0.08}>
        <MortgageCalc />
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-6 flex justify-center">
          <Link
            href="/v3/mortgage"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white/[0.07] px-6 text-[14px] font-bold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/[0.13] hover:text-white"
          >
            Все программы и банки
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
