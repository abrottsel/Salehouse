"use client";

import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("v2-theme");
    if (saved === "light") setDark(false);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("v2-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? "dark bg-[#0b0f14] text-gray-100 min-h-screen" : "bg-white text-gray-900 min-h-screen"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
