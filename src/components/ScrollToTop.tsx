"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname() || "";
  const hidden = pathname.startsWith("/v2");

  useEffect(() => {
    if (hidden) return;
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden]);

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Вернуться наверх"
      className={`fixed bottom-2 left-5 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-xl shadow-emerald-900/30 ring-1 ring-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={3} />
    </button>
  );
}
