import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, LogOut, type LucideIcon } from "lucide-react";
import { Logo, LogoMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ShellSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

const KEY = "sv-sidebar-collapsed";

export function DashboardShell({
  label,
  sections,
  current,
  onSelect,
  children,
}: {
  label: string;
  sections: ShellSection[];
  current: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "1") setCollapsed(true);
      // Auto-collapse on narrow screens
      if (window.matchMedia("(max-width: 768px)").matches) setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(KEY, next ? "1" : "0"); } catch { /* noop */ }
      return next;
    });
  }

  // Avoid SSR/CSR mismatch on the toggle button text/icon side
  const widthClass = collapsed ? "w-[68px]" : "w-[244px]";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" aria-label="Home"><Logo size="md" /></Link>
            {label && (
              <>
                <span className="hidden h-5 w-px bg-border sm:block" />
                <span className="hidden truncate font-display text-base text-muted-foreground sm:block">{label}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="transition-all hover:-translate-y-0.5">
              <Link to="/"><LogOut className="mr-1.5 h-4 w-4" /> Log out</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-border bg-sidebar/60 backdrop-blur-sm transition-[width] duration-300 ease-out md:block",
            widthClass,
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 pt-3">
              {!collapsed && (
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <LogoMark className="h-4 w-4" />
                  Sections
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="h-7 w-7 transition-transform hover:scale-110 active:scale-95"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {mounted && collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            <nav className="mt-3 flex-1 space-y-1 px-2">
              {sections.map((s) => {
                const Icon = s.icon;
                const active = current === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    title={collapsed ? s.label : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                      "hover:translate-x-0.5",
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-6px_oklch(0.62_0.22_285/0.55)]"
                        : "text-foreground/75 hover:bg-sidebar-accent hover:text-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform", active && "scale-110")} />
                    {!collapsed && <span className="truncate">{s.label}</span>}
                    {active && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/80" />
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="px-3 pb-4 pt-2 text-[10px] text-muted-foreground">
              {!collapsed && <span>v1.0 · Socialvert</span>}
            </div>
          </div>
        </aside>

        {/* Mobile section chips */}
        <div className="md:hidden">{/* nav rendered in main area */}</div>

        <main className="flex-1 min-w-0">
          <div className="md:hidden border-b border-border bg-background/70 backdrop-blur">
            <div className="flex gap-1 overflow-x-auto px-3 py-2">
              {sections.map((s) => {
                const Icon = s.icon;
                const active = current === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function SectionView({ id, current, children }: { id: string; current: string; children: ReactNode }) {
  if (id !== current) return null;
  return <div key={id} className="sv-section-enter">{children}</div>;
}
