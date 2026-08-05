// Stage helpers retained for UI. Data now lives in Supabase — see src/lib/store.ts.
import type { Client, Video, Platform, StageStatus } from "./types";

// Last known dashboard snapshot. This is used only when the configured backend
// cannot be reached, so a connection outage does not blank every dashboard.
const activeClients: Client[] = [
  { id: "c1", name: "Smith & Associates Law", slug: "smith-law", monthly_quota: 20, platforms: ["instagram", "tiktok", "youtube", "google"], active: true },
  { id: "c2", name: "Johnson Legal Group", slug: "johnson-legal", monthly_quota: 16, platforms: ["instagram", "tiktok", "youtube"], active: true },
  { id: "c3", name: "Demo Client Co.", slug: "demo-client", monthly_quota: 12, platforms: ["instagram", "youtube", "google"], active: true },
];

const demoNames = [
  "Harper Tax Advisors", "Bluepeak Realty", "Northstar Dental", "Vance & Co.",
  "Riverbend Wellness", "Anchor Financial", "Cedar Family Law", "Pine Ridge Clinic",
  "Lumen Marketing", "Westgate Mortgage", "Summit Counseling", "Atlas Auto Group",
  "Beacon Insurance", "Halcyon Studios", "Vector Construction", "Meridian CPA",
  "Crestline Properties",
];

export const fallbackClients: Client[] = [
  ...activeClients,
  ...demoNames.map((name, index) => ({
    id: `d${index + 1}`,
    name,
    slug: `demo-${index + 1}`,
    monthly_quota: 12 + ((index * 3) % 12),
    platforms: (["instagram", "tiktok", "youtube", "google"] as Platform[]).slice(0, 2 + (index % 3)),
    active: false,
    last_activity: null,
  })),
];

const videoTitles: Record<string, string[]> = {
  c1: [
    "3 Mistakes People Make After a Car Accident", "What Insurance Adjusters Don't Want You to Know",
    "Client Win: $1.2M Settlement Story", "Slip and Fall: Is Your Case Worth Pursuing?",
    "Why You Shouldn't Sign That Release Form", "Statute of Limitations Explained in 60 Seconds",
    "Hiring a Lawyer vs Going Solo", "A Day in the Life of a Personal Injury Attorney",
    "Top 5 Questions Clients Ask in the First Meeting", "How Long Will My Case Take?",
    "Free Consultation: What Actually Happens", "When NOT to Hire a Personal Injury Lawyer",
  ],
  c2: [
    "Divorce 101: The First Step", "Custody Myths Debunked", "Prenup Questions Couples Forget to Ask",
    "What Happens to the House in a Divorce", "Modifying Child Support: When and How",
    "Domestic Violence Resources Every Client Should Know", "Mediation vs Litigation: Which Saves More?",
    "Grandparent Visitation Rights Explained", "Adoption: Domestic vs International Process",
    "How to Choose a Family Law Attorney", "Red Flags in a Custody Agreement",
  ],
  c3: [
    "Our Founder's Story", "Product Walkthrough: Feature X", "Customer Spotlight: Beacon Co.",
    "Behind the Scenes: Our Team Offsite", "5 Tools Every Small Business Needs",
    "How We Hire: Our 3-Step Process", "Why We Said No to Our Biggest Client", "Q4 Roadmap Preview",
    "Customer Q&A Live Recap", "Year in Review: 2025",
  ],
};

const postedViews = [12450, 28900, 9800, 18200, 6400, 14100];
let postedIndex = 0;
export const fallbackVideos: Video[] = Object.entries(videoTitles).flatMap(([clientId, titles]) =>
  titles.map((title, index) => {
    const posted = index < 2;
    const scheduled = index === 2;
    const completeScript = index < 5;
    const inProgressScript = index >= 5 && index < 7;
    const views = posted ? postedViews[postedIndex++] ?? 0 : 0;
    return {
      id: `${clientId}-v${index + 1}`,
      client_id: clientId,
      title,
      content_angle: "Authority-building piece for prospective clients.",
      video_type: index % 2 === 0 ? "educational" : "authentic",
      platform: ["instagram", "tiktok"],
      idea_status: index < titles.length - 2 ? "complete" : "in_progress",
      script_status: completeScript ? "complete" : inProgressScript ? "in_progress" : "not_started",
      script_content: completeScript ? `HOOK: ${title}\n\nBODY: Key points and supporting detail.\n\nCTA: Learn more.` : "",
      script_delivery_date: completeScript ? new Date(Date.now() - (index + 2) * 86400000).toISOString().slice(0, 10) : null,
      script_eta: inProgressScript ? new Date(Date.now() + (index - 3) * 86400000).toISOString().slice(0, 10) : null,
      video_status: index < 3 ? "ready" : index === 3 ? "in_editing" : "awaiting_recording",
      video_link: index < 3 ? `https://drive.google.com/file/d/${clientId}-${index + 1}` : null,
      caption_hook: index < 4 ? title : "",
      caption_body: index < 4 ? "Helpful context and practical guidance for our audience." : "",
      caption_cta: index < 4 ? "Contact us to learn more." : "",
      caption_hashtags: index < 4 ? ["#socialmedia", "#helpfultips"] : [],
      posting_date: posted || scheduled ? new Date(Date.now() + (scheduled ? 2 : -(index + 3)) * 86400000).toISOString().slice(0, 10) : null,
      posting_platform: posted || scheduled ? (index % 2 === 0 ? "instagram" : "tiktok") : null,
      posting_status: posted ? "posted" : scheduled ? "scheduled" : "pending",
      views,
      engagement: posted ? Math.round(views * 0.07) : 0,
      client_approval_status: null,
      client_feedback: null,
      updated_at: new Date(Date.now() - index * 3600000).toISOString(),
    } satisfies Video;
  }),
);

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
