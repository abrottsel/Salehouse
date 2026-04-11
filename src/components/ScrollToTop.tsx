"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button.
 * Appears when user has scrolled past the hero.
 * Positioned bottom-left so it doesn't collide with the chat widget (bottom-right).
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after ~600px (past hero area)
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Вернуться наверх"
      className={`fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 h-11 pl-3 pr-4 rounded-full bg-gray-900/90 backdrop-blur-md text-white text-sm font-semibold shadow-xl shadow-black/20 ring-1 ring-white/10 hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300 ${
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
