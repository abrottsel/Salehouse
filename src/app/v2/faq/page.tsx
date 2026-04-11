import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "FAQ — ЗемПлюс (v2)",
  robots: { index: false, follow: false },
};

export default function FaqV2() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/v2"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к /v2
          </a>
        </div>
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
