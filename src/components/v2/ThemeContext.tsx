"use client";

import { createContext, useContext } from "react";

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  return useContext(ThemeContext);
}
