import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "./PlatformIcon";
import type { Platform } from "@/lib/types";

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] ?? null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] ?? null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ link, platforms }: { link: string | null; platforms: Platform[] }) {
  if (!link) {
    return (
      <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center text-primary/60">
        <PlatformIcon platform={platforms[0] ?? "instagram"} className="h-10 w-10" />
      </div>
    );
  }
  const yt = youtubeId(link);
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border shadow-sm">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${yt}`}
          title="Video preview"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center">
        <Play className="h-10 w-10 text-primary/70" />
      </div>
      <Button asChild variant="secondary" className="w-full">
        <a href={link} target="_blank" rel="noreferrer"><ExternalLink className="mr-1.5 h-4 w-4" /> Open video</a>
      </Button>
    </div>
  );
}
