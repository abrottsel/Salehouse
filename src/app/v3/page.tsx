import Hero from "./sections/Hero";
import TrustStrip from "./sections/TrustStrip";
import VillagesShowcase from "./sections/VillagesShowcase";
import Calculator from "./sections/Calculator";
import HowItWorks from "./sections/HowItWorks";
import FinalCTA from "./sections/FinalCTA";

export default function V3Page() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <section id="villages">
        <VillagesShowcase />
      </section>
      <Calculator />
      <HowItWorks />
      <FinalCTA />
    </main>
  );
}
