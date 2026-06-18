import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { PlatformIcon, PlatformList } from "./PlatformIcon";
import { PostingBadge } from "./StatusBadge";
import type { Video } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarBoard({ videos }: { videos: Video[] }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [openVideo, setOpenVideo] = useState<Video | null>(null);

  const scheduled = useMemo(() => videos.filter((v) => v.posting_date), [videos]);

  const first = new Date(cursor.y, cursor.m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = new Map<string, Video[]>();
  scheduled.forEach((v) => {
    if (!v.posting_date) return;
    const arr = byDay.get(v.posting_date) ?? [];
    arr.push(v);
    byDay.set(v.posting_date, arr);
  });

  const monthName = first.toLocaleString("default", { month: "long", year: "numeric" });
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === cursor.y && today.getMonth() === cursor.m;

  function shift(delta: number) {
    setCursor(({ y, m }) => {
      const next = new Date(y, m + delta, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
  }

  return (
    <>
      <Card className="sv-card-holo">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="font-display text-xl">{monthName}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => shift(-1)} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}>Today</Button>
            <Button variant="ghost" size="icon" onClick={() => shift(1)} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {DAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="min-h-24 rounded-md bg-muted/20" />;
              const dateStr = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const items = byDay.get(dateStr) ?? [];
              const isToday = isCurrentMonth && d === today.getDate();
              return (
                <div
                  key={i}
                  className={`group relative min-h-24 rounded-md border p-1.5 text-left transition-colors ${
                    isToday ? "border-primary/60 bg-primary/5" : "border-border bg-card/50 hover:bg-accent/30"
                  }`}
                >
                  <div className={`text-[11px] font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{d}</div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((v) => {
                      const posted = v.posting_status === "posted";
                      return (
                        <button
                          key={v.id}
                          onClick={() => setOpenVideo(v)}
                          className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-1 text-left text-[10.5px] font-medium transition-all hover:scale-[1.02] ${
                            posted
                              ? "bg-success/15 text-success hover:bg-success/25"
                              : "bg-primary/15 text-primary hover:bg-primary/25"
                          }`}
                          title={v.title}
                        >
                          {v.posting_platform && <PlatformIcon platform={v.posting_platform} className="h-2.5 w-2.5 shrink-0" />}
                          <span className="truncate">{v.title}</span>
                        </button>
                      );
                    })}
                    {items.length > 3 && (
                      <button
                        onClick={() => setOpenVideo(items[3])}
                        className="text-[10px] font-medium text-muted-foreground hover:text-primary"
                      >
                        +{items.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!openVideo} onOpenChange={(o) => !o && setOpenVideo(null)}>
        <DialogContent className="max-w-lg">
          {openVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl leading-tight">{openVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <PlatformList platforms={openVideo.platform} />
                  <PostingBadge status={openVideo.posting_status} />
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Scheduled for</div>
                <div className="text-base font-medium tabular-nums">{openVideo.posting_date}</div>
                {openVideo.caption_hook && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Hook</div>
                    <div className="mt-1 text-sm">{openVideo.caption_hook}</div>
                  </div>
                )}
                {openVideo.caption_body && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Body</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm">{openVideo.caption_body}</div>
                  </div>
                )}
                {openVideo.video_link && (
                  <Button asChild variant="secondary" className="w-full">
                    <a href={openVideo.video_link} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" /> Open video
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
