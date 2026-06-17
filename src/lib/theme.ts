import { useEffect, useState } from "react";

const KEY = "sv-theme";

export function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

export function applyTheme(t: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);
  return { theme, setTheme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
}
