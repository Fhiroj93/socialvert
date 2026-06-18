export type Platform = "instagram" | "tiktok" | "youtube" | "google";

export type Stage = "idea" | "script" | "video" | "caption" | "schedule";
export type StageStatus = "not_started" | "in_progress" | "complete";

export type VideoType = "educational" | "authentic";
export type VideoProductionStatus = "awaiting_recording" | "in_editing" | "ready";
export type PostingStatus = "pending" | "scheduled" | "posted";

export type ClientApprovalStatus = "approved" | "changes_requested" | null;

export interface Client {
  id: string;
  name: string;
  slug: string;
  monthly_quota: number;
  platforms: Platform[];
  active: boolean; // false = demo placeholder client
  last_activity?: string | null; // most-recent updated_at among this client's videos
}

export interface Video {
  id: string;
  client_id: string;
  title: string;
  content_angle: string;
  video_type: VideoType;
  platform: Platform[];
  idea_status: StageStatus;
  script_status: StageStatus;
  script_content: string;
  script_delivery_date: string | null;
  script_eta: string | null;
  video_status: VideoProductionStatus;
  video_link: string | null;
  caption_hook: string;
  caption_body: string;
  caption_cta: string;
  caption_hashtags: string[];
  posting_date: string | null;
  posting_platform: Platform | null;
  posting_status: PostingStatus;
  views: number;
  engagement: number;
  client_approval_status: ClientApprovalStatus;
  client_feedback: string | null;
  updated_at: string | null;
}
