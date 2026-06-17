import type { StageStatus } from "@/lib/types";
import { Check } from "lucide-react";

const STAGES: { key: "idea"|"script"|"video"|"caption"|"schedule"; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "script", label: "Script" },
  { key: "video", label: "Video" },
  { key: "caption", label: "Caption" },
  { key: "schedule", label: "Schedule" },
];

function dotClass(s: StageStatus) {
  if (s === "complete") return "bg-success text-success-foreground border-success";
  if (s === "in_progress") return "bg-primary text-primary-foreground border-primary animate-pulse";
  return "bg-muted text-muted-foreground border-border";
}

export function StageTracker({
  stages,
  showLabels = true,
}: {
  stages: Record<"idea"|"script"|"video"|"caption"|"schedule", StageStatus>;
  showLabels?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {STAGES.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className={`h-6 w-6 shrink-0 rounded-full border-2 grid place-items-center text-[10px] font-bold ${dotClass(stages[s.key])}`}>
              {stages[s.key] === "complete" ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            {showLabels && <span className="text-[10px] leading-none text-muted-foreground truncate">{s.label}</span>}
          </div>
          {i < STAGES.length - 1 && (
            <div className={`h-px flex-1 ${stages[s.key] === "complete" ? "bg-success" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
