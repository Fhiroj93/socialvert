import type { PostingStatus, VideoProductionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function PostingBadge({ status }: { status: PostingStatus }) {
  const map = {
    pending:   { label: "Pending",   cls: "bg-muted text-muted-foreground" },
    scheduled: { label: "Scheduled", cls: "bg-primary/15 text-primary border-primary/30" },
    posted:    { label: "Posted",    cls: "bg-success/15 text-success border-success/30" },
  } as const;
  const m = map[status];
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
}

export function VideoProductionBadge({ status }: { status: VideoProductionStatus }) {
  const map = {
    awaiting_recording: { label: "Awaiting recording", cls: "bg-muted text-muted-foreground" },
    in_editing:         { label: "In editing",          cls: "bg-warning/15 text-warning-foreground border-warning/40" },
    ready:              { label: "Ready",               cls: "bg-success/15 text-success border-success/30" },
  } as const;
  const m = map[status];
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
}
