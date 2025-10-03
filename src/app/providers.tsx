"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  // On mount: read from localStorage or default to light
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("theme");
      const initial: ThemeMode = stored === "dark" ? "dark" : "light"; // ✅ use const
      setThemeState(initial);
      applyThemeToDocument(initial);

      if (stored === "system") {
        // migrate legacy value
        window.localStorage.setItem("theme", initial);
      }
    } catch {
      applyThemeToDocument("light");
    }
  }, []);

  // Re-apply when theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try {
      window.localStorage.setItem("theme", t);
    } catch {}
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export default function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
