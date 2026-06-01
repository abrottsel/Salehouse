"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const update = () => {
      const show = window.scrollY > 600;
      btn.style.opacity = show ? "1" : "0";
      btn.style.transform = show ? "translateY(0)" : "translateY(1rem)";
      btn.style.pointerEvents = show ? "auto" : "none";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
      aria-label="Вернуться наверх"
      style={{ opacity: 0, transform: "translateY(1rem)", pointerEvents: "none" }}
      className="fixed bottom-2 left-5 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-xl shadow-emerald-900/30 ring-1 ring-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
    >
      <ArrowUp className="w-5 h-5" strokeWidth={3} />
    </button>
  );
}
