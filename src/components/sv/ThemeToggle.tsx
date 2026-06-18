import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  // Avoid SSR/CSR hydration mismatch: render a stable placeholder until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="transition-transform hover:scale-110 active:scale-95">
      {mounted ? (
        theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4 opacity-0" />
      )}
    </Button>
  );
}
