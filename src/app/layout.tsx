import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatWidget from "@/components/AIChatWidget";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import ScrollToTop from "@/components/ScrollToTop";
import SocialFloating from "@/components/SocialFloating";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ЗемПлюс — Земельные участки в Подмосковье от 180 000 руб./сот.",
  description:
    "Продажа земельных участков в Подмосковье. Готовые посёлки с газом, электричеством, асфальтом и охраной. Рассрочка без переплат. Юридическая чистота гарантирована.",
  keywords:
    "земельные участки, подмосковье, купить участок, ИЖС, коттеджный посёлок, участок для строительства дома, ЗемПлюс",
  metadataBase: new URL("https://zem-plus.ru"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "ЗемПлюс — Земельные участки в Подмосковье",
    description:
      "Готовые посёлки с коммуникациями. От 180 000 руб./сот. Рассрочка. Юридическая чистота.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <FavoritesProvider>
          {children}
          <AIChatWidget />
          <ScrollToTop />
          <SocialFloating />
        </FavoritesProvider>
      </body>
    </html>
  );
}
