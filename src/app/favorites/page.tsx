import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesContent from "@/components/FavoritesContent";

export const metadata: Metadata = {
  title: "Избранное — ЗемПлюс",
  description:
    "Сохранённые посёлки и участки. Управляйте подборкой и записывайтесь на просмотр.",
};

export default function FavoritesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20 pb-20">
        <FavoritesContent />
      </main>
      <Footer />
    </>
  );
}
