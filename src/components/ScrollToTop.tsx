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
      className={`fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 h-11 pl-3 pr-4 rounded-full bg-gray-900/90 text-white text-sm font-semibold shadow-xl shadow-black/20 ring-1 ring-white/10 hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm shadow-green-900/40">
        <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
      Наверх
    </button>
  );
}
