import { ThemeWrapper } from "@/components/v2/ThemeWrapper";

/**
 * /v2 layout — class-based dark variant (globals.css: @custom-variant dark).
 * Тёмная тема по умолчанию. Пользователь переключает через плавающую кнопку.
 * Прод / без класса .dark = всегда светлый.
 */
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <ThemeWrapper>{children}</ThemeWrapper>;
}
