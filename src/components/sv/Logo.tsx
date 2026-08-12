import logoUrl from "@/assets/socialvert-logo.webp";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Socialvert"
      className={`${className} object-contain drop-shadow-[0_0_12px_oklch(0.62_0.22_264_/_0.45)] transition-transform duration-500 hover:scale-110 hover:rotate-[6deg]`}
    />
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const text = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <div className="flex items-center gap-3 text-foreground animate-fade-in">
      <LogoMark className={mark} />
      <span className={`sv-logo-wordmark ${text} sv-gradient-text`}>Socialvert</span>
    </div>
  );
}
