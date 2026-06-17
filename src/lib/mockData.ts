// Stage helpers retained for UI. Data now lives in Supabase — see src/lib/store.ts.
import type { Video, StageStatus } from "./types";

export function deriveStages(v: Video) {
  return {
    idea: v.idea_status,
    script: v.script_status,
    video:
      v.video_status === "ready"
        ? "complete"
        : v.video_status === "in_editing"
          ? "in_progress"
          : v.script_status === "complete"
            ? "in_progress"
            : "not_started",
    caption:
      v.caption_hook && v.caption_body && v.caption_cta
        ? "complete"
        : v.caption_hook || v.caption_body
          ? "in_progress"
          : "not_started",
    schedule:
      v.posting_status === "posted"
        ? "complete"
        : v.posting_status === "scheduled"
          ? "in_progress"
          : "not_started",
  } as Record<"idea" | "script" | "video" | "caption" | "schedule", StageStatus>;
}

export function currentStageLabel(v: Video): string {
  if (v.posting_status === "posted") return "Posted";
  if (v.posting_status === "scheduled") return "Scheduled";
  if (v.video_status === "ready" && v.caption_hook && v.caption_body && v.caption_cta) return "Ready to schedule";
  if (v.video_status === "ready") return "Writing captions";
  if (v.video_status === "in_editing") return "In editing";
  if (v.script_status === "complete") return "Awaiting recording";
  if (v.script_status === "in_progress") return "Writing script";
  if (v.idea_status === "complete") return "Script queued";
  return "Ideation";
}

export type { Client, Video, Platform, StageStatus, VideoProductionStatus, PostingStatus } from "./types";
