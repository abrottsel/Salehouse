import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "v3 — новый дизайн карты участков (демо)",
  description: "Демо-стенд: новый слой поверх фрейма Земекс.",
  robots: { index: false, follow: false },
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0e13] text-white antialiased">
      {children}
    </div>
  );
}
