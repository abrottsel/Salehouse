import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ЗемЭкс — Земельные участки в Подмосковье от 180 000 руб./сот.",
  description:
    "Продажа земельных участков в Подмосковье. Готовые посёлки с газом, электричеством, асфальтом и охраной. Рассрочка без переплат. Юридическая чистота гарантирована. Более 9 лет на рынке, 15 000+ проданных участков.",
  keywords:
    "земельные участки, подмосковье, купить участок, ИЖС, коттеджный посёлок, участок для строительства дома",
  openGraph: {
    title: "ЗемЭкс — Земельные участки в Подмосковье",
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
        {children}
      </body>
    </html>
  );
}
