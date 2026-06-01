/**
 * /v2 layout — оборачивает всю ревью-версию в .dark (class-based dark variant
 * объявлен в globals.css: `@custom-variant dark (&:is(.dark *), &.dark)`).
 * Тёмная тема активна ТОЛЬКО на /v2. Прод / без класса .dark = остаётся светлым.
 */
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark bg-[#0b0f14] text-gray-100 min-h-screen">
      {children}
    </div>
  );
}
