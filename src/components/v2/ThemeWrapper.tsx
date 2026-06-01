"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("v2-theme");
    if (saved === "light") setDark(false);
    setMounted(true);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("v2-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div
      className={[
        "min-h-screen",
        dark ? "dark bg-[#0b0f14] text-gray-100" : "bg-white text-gray-900",
      ].join(" ")}
    >
      {children}

      {/* Переключатель тёмной/светлой темы — появляется после hydration */}
      {mounted && (
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? "Светлая тема" : "Тёмная тема"}
          className={[
            "fixed z-[60]",
            "bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] right-3",
            "sm:bottom-4 sm:right-4",
            "flex items-center gap-2 px-3.5 py-2.5 rounded-full",
            "text-[13px] font-semibold shadow-xl ring-1 transition-all duration-200",
            "active:scale-95 hover:scale-105",
            dark
              ? "bg-white/10 text-white ring-white/20 hover:bg-white/15 backdrop-blur-sm"
              : "bg-gray-900/90 text-white ring-gray-700 hover:bg-gray-800",
          ].join(" ")}
        >
          {dark ? (
            <>
              <Sun className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>Светлая</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
              <span>Тёмная</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
