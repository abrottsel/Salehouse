"use client";

import { usePathname } from "next/navigation";
import AIChatWidget from "@/components/AIChatWidget";
import ScrollToTop from "@/components/ScrollToTop";
import SocialFloating from "@/components/SocialFloating";

/**
 * Плавающая обвязка старого дизайна: AI-чат, «наверх», соцкнопки.
 *
 * На ветке /v3 не показываем — там своя тёмная эстетика и свои
 * элементы, а AI-чат вдобавок отправляет заявки, чего на витрине
 * быть не должно. На всех остальных страницах поведение прежнее.
 *
 * CookieBanner, ViewingModal и MortgageModal сюда НЕ входят —
 * баннер cookie обязателен везде, модалки открываются по событию.
 */
export default function LegacyChrome() {
  const pathname = usePathname() || "";
  if (pathname === "/v3" || pathname.startsWith("/v3/")) return null;

  return (
    <>
      <AIChatWidget />
      <ScrollToTop />
      <SocialFloating />
    </>
  );
}
