import { Instagram, Youtube, MapPin, Music2 } from "lucide-react";
import type { Platform } from "@/lib/types";

const map: Record<Platform, { label: string; Icon: typeof Instagram; color: string }> = {
  instagram: { label: "Instagram", Icon: Instagram, color: "text-pink-500" },
  tiktok:    { label: "TikTok",    Icon: Music2,    color: "text-foreground" },
  youtube:   { label: "YouTube",   Icon: Youtube,   color: "text-red-500" },
  google:    { label: "Google Business", Icon: MapPin, color: "text-blue-500" },
};

export function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: Platform; className?: string }) {
  const { Icon, color, label } = map[platform];
  return <Icon className={`${className} ${color}`} aria-label={label} />;
}

export function PlatformList({ platforms, className = "h-4 w-4" }: { platforms: Platform[]; className?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {platforms.map((p) => <PlatformIcon key={p} platform={p} className={className} />)}
    </div>
  );
}
