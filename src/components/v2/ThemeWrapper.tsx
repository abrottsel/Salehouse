"use client";

import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Источник истины — класс, который уже выставил анти-FOUC скрипт в <head>
    // (ручной выбор v2-theme, иначе авто по времени суток). Просто синхронизируем
    // React-состояние с фактическим классом, не переопределяя решение скрипта.
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("v2-theme", next ? "dark" : "light");
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
