import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatWidget from "@/components/AIChatWidget";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import ScrollToTop from "@/components/ScrollToTop";
import SocialFloating from "@/components/SocialFloating";
import CookieBanner from "@/components/CookieBanner";

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
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
  // schema.org Organization — явный сигнал для Apple/Google что это
  // легитимный оператор ПД, а не фишинг. Включает ОГРНИП/ИНН (identifier
  // для РФ-резидентов), контакты, права и privacy policy.
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ЗемПлюс",
    legalName: "ИП Бротцель Антон Валерьевич",
    url: "https://zem-plus.ru",
    logo: "https://zem-plus.ru/favicon.svg",
    description:
      "Продажа земельных участков в Подмосковье в готовых коттеджных посёлках. Оператор персональных данных по 152-ФЗ.",
    identifier: [
      { "@type": "PropertyValue", propertyID: "ОГРНИП", value: "324508100684518" },
      { "@type": "PropertyValue", propertyID: "ИНН", value: "503440358928" },
    ],
    taxID: "503440358928",
    address: { "@type": "PostalAddress", addressCountry: "RU", addressRegion: "Московская область" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+7-985-905-25-55",
      email: "info@zem-plus.ru",
      contactType: "sales",
      availableLanguage: "ru",
      areaServed: "RU",
    },
    sameAs: ["https://t.me/zemplus_bot", "https://max.ru/id503440358928_bot"],
    privacyPolicy: "https://zem-plus.ru/privacy",
  };

  return (
    <html lang="ru" className={`${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <FavoritesProvider>
          {children}
          <AIChatWidget />
          <ScrollToTop />
          <SocialFloating />
          <CookieBanner />
        </FavoritesProvider>
      </body>
    </html>
  );
}
