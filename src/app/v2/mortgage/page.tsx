import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BanksRow from "@/components/BanksRow";
import MortgageCalculator from "@/components/MortgageCalculator";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Ипотека — ЗемПлюс (v2)",
  robots: { index: false, follow: false },
};

export default function MortgageV2() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
          <a
            href="/v2"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к /v2
          </a>
        </div>
        <BanksRow />
        <MortgageCalculator />
      </main>
      <Footer />
    </>
  );
}
