export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  // Stylized infinity mark formed by two arrows (up + down)
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sv-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#sv-mark)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* left loop: arrow pointing up */}
        <path d="M16 22 C 6 22, 6 10, 16 10 C 26 10, 30 22, 38 22" />
        <path d="M14 14 L 16 10 L 19 13" />
        {/* right loop: arrow pointing down */}
        <path d="M48 10 C 58 10, 58 22, 48 22 C 38 22, 34 10, 26 10" />
        <path d="M50 18 L 48 22 L 45 19" />
      </g>
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <div className="flex items-center gap-2 text-foreground">
      <LogoMark className={mark} />
      <span className={`sv-logo-wordmark ${text}`}>Socialvert</span>
    </div>
  );
}
