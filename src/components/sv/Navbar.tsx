import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar({ label }: { label?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/"><Logo size="md" /></Link>
          {label && (
            <>
              <span className="hidden h-5 w-px bg-border sm:block" />
              <span className="hidden truncate text-sm font-medium text-muted-foreground sm:block">{label}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><LogOut className="mr-1.5 h-4 w-4" /> Log out</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
