import type { Client, Video, Platform, StageStatus, VideoProductionStatus, PostingStatus } from "./types";

// 3 functional clients + 17 demo placeholders = 20 total
const functional: Client[] = [
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
const demo: Client[] = demoNames.map((name, i) => ({
  id: `d${i + 1}`,
  name,
  slug: `demo-${i + 1}`,
  monthly_quota: 12 + ((i * 3) % 12),
  platforms: (["instagram", "tiktok", "youtube", "google"] as Platform[]).slice(0, 2 + (i % 3)),
  active: false,
}));

export const clients: Client[] = [...functional, ...demo];

const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);
const daysFromNow = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);

type Seed = Partial<Video> & { title: string };

function buildVideos(clientId: string, seeds: Seed[]): Video[] {
  return seeds.map((s, i) => ({
    id: `${clientId}-v${i + 1}`,
    client_id: clientId,
    title: s.title,
    content_angle: s.content_angle ?? "Authority-building piece for prospective clients.",
    video_type: s.video_type ?? (i % 2 === 0 ? "educational" : "authentic"),
    platform: s.platform ?? ["instagram", "tiktok"],
    idea_status: s.idea_status ?? "complete",
    script_status: s.script_status ?? "not_started",
    script_content: s.script_content ?? "",
    script_delivery_date: s.script_delivery_date ?? null,
    script_eta: s.script_eta ?? null,
    video_status: s.video_status ?? "awaiting_recording",
    video_link: s.video_link ?? null,
    caption_hook: s.caption_hook ?? "",
    caption_body: s.caption_body ?? "",
    caption_cta: s.caption_cta ?? "",
    caption_hashtags: s.caption_hashtags ?? [],
    posting_date: s.posting_date ?? null,
    posting_platform: s.posting_platform ?? null,
    posting_status: s.posting_status ?? "pending",
    views: s.views ?? 0,
    engagement: s.engagement ?? 0,
  }));
}

// Smith & Associates - 12 videos, varied pipeline stages
const smithSeeds: Seed[] = [
  { title: "3 Mistakes People Make After a Car Accident", content_angle: "Educational PSA with bold on-screen captions.",
    video_type: "educational", platform: ["instagram","tiktok","youtube"],
    idea_status: "complete", script_status: "complete", script_content: "HOOK: Most people lose their case in the first 24 hours.\n\nBODY: Three mistakes...\n1. Talking to insurance before a lawyer\n2. Posting on social media\n3. Skipping medical care.\n\nCTA: Free consult link in bio.",
    script_delivery_date: daysAgo(18), video_status: "ready",
    video_link: "https://drive.google.com/file/d/demo1", caption_hook: "Most people lose their case in the first 24 hours.",
    caption_body: "Three mistakes attorneys see every week — and how to avoid them.",
    caption_cta: "DM us 'CASE' for a free consult.", caption_hashtags: ["#caraccident","#injurylaw","#legaltips","#attorney"],
    posting_date: daysAgo(10), posting_platform: "instagram", posting_status: "posted", views: 12450, engagement: 842 },
  { title: "What Insurance Adjusters Don't Want You to Know", content_angle: "Behind-the-curtain reveal.",
    video_type: "educational", idea_status: "complete", script_status: "complete",
    script_content: "Adjusters are trained to minimize your payout. Here's how...",
    script_delivery_date: daysAgo(12), video_status: "ready", video_link: "https://drive.google.com/file/d/demo2",
    caption_hook: "Adjusters are trained to pay you less.", caption_body: "Here's the script they use — and how to counter it.",
    caption_cta: "Save this before your next call.", caption_hashtags: ["#insurance","#injurylaw","#knowyourrights"],
    posting_date: daysAgo(5), posting_platform: "tiktok", posting_status: "posted", views: 28900, engagement: 2104 },
  { title: "Client Win: $1.2M Settlement Story", content_angle: "Anonymous case study — testimonial-style.",
    video_type: "authentic", idea_status: "complete", script_status: "complete",
    script_content: "We can't share names but we can share results...",
    script_delivery_date: daysAgo(8), video_status: "ready", video_link: "https://drive.google.com/file/d/demo3",
    caption_hook: "$1.2M. Here's how we got there.", caption_body: "Real case, real result. Names changed — outcome is not.",
    caption_cta: "Free consult — link in bio.", caption_hashtags: ["#clientwin","#caseresult","#injurylaw"],
    posting_date: daysFromNow(2), posting_platform: "instagram", posting_status: "scheduled", views: 0, engagement: 0 },
  { title: "Slip and Fall: Is Your Case Worth Pursuing?", content_angle: "Self-assessment quiz format.",
    idea_status: "complete", script_status: "complete",
    script_content: "Ask yourself these 4 questions...",
    script_delivery_date: daysAgo(4), video_status: "in_editing",
    caption_hook: "Not every slip is a lawsuit. Here's how to tell.", caption_body: "Four questions every attorney asks first.",
    caption_cta: "DM 'SLIP' for our free checklist.", caption_hashtags: ["#slipandfall","#premisesliability","#injurylaw"],
    posting_status: "pending" },
  { title: "Why You Shouldn't Sign That Release Form", content_angle: "Warning-style explainer.",
    idea_status: "complete", script_status: "complete",
    script_content: "Insurance companies send these on day 3...",
    script_delivery_date: daysAgo(2), video_status: "awaiting_recording",
    caption_hook: "Don't sign anything for 30 days.", caption_body: "That release form? It ends your claim. Read this first.",
    caption_cta: "Free review — comment 'FORM'.", caption_hashtags: ["#injurylaw","#legaltips","#insurance"],
    posting_status: "pending" },
  { title: "Statute of Limitations Explained in 60 Seconds", content_angle: "Quick urgent explainer.",
    idea_status: "complete", script_status: "in_progress", script_eta: daysFromNow(2),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Hiring a Lawyer vs Going Solo", content_angle: "Comparison format with stats.",
    video_type: "educational", idea_status: "complete", script_status: "in_progress", script_eta: daysFromNow(3),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "A Day in the Life of a Personal Injury Attorney", content_angle: "Behind-the-scenes vlog cut.",
    video_type: "authentic", idea_status: "complete", script_status: "not_started", script_eta: daysFromNow(5),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Top 5 Questions Clients Ask in the First Meeting", content_angle: "FAQ rapid-fire.",
    idea_status: "complete", script_status: "not_started", script_eta: daysFromNow(6),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "How Long Will My Case Take?", content_angle: "Honest timeline breakdown.",
    idea_status: "complete", script_status: "not_started", script_eta: daysFromNow(7),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Free Consultation: What Actually Happens", content_angle: "Demystify the intake call.",
    idea_status: "in_progress", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "When NOT to Hire a Personal Injury Lawyer", content_angle: "Counter-intuitive trust builder.",
    idea_status: "in_progress", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
];

// Johnson Legal - 11 videos
const johnsonSeeds: Seed[] = [
  { title: "Divorce 101: The First Step", idea_status: "complete", script_status: "complete",
    script_content: "Before you call a lawyer, gather these documents...", script_delivery_date: daysAgo(20),
    video_status: "ready", video_link: "https://drive.google.com/file/d/demo-j1",
    caption_hook: "Before you call a divorce lawyer — do this.", caption_body: "5 documents to gather first.",
    caption_cta: "Comment 'LIST' for our free checklist.", caption_hashtags: ["#divorce","#familylaw","#legaltips"],
    posting_date: daysAgo(14), posting_platform: "instagram", posting_status: "posted", views: 9800, engagement: 612 },
  { title: "Custody Myths Debunked", idea_status: "complete", script_status: "complete",
    script_content: "Myth 1: Moms always win. Reality...", script_delivery_date: daysAgo(15),
    video_status: "ready", video_link: "https://drive.google.com/file/d/demo-j2",
    caption_hook: "Custody myth #1: Mom always wins.", caption_body: "The truth is more nuanced. Here's what judges actually weigh.",
    caption_cta: "Free consult — DM 'CUSTODY'.", caption_hashtags: ["#custody","#familylaw","#parenting"],
    posting_date: daysAgo(7), posting_platform: "tiktok", posting_status: "posted", views: 18200, engagement: 1340 },
  { title: "Prenup Questions Couples Forget to Ask", idea_status: "complete", script_status: "complete",
    script_content: "Prenups aren't just for the wealthy...", script_delivery_date: daysAgo(6),
    video_status: "in_editing", caption_hook: "Your prenup is missing this clause.",
    caption_body: "Three questions every couple should ask before signing.",
    caption_cta: "Schedule a prenup review — link in bio.", caption_hashtags: ["#prenup","#familylaw","#marriage"],
    posting_status: "pending" },
  { title: "What Happens to the House in a Divorce", idea_status: "complete", script_status: "complete",
    script_content: "Equitable distribution vs community property...", script_delivery_date: daysAgo(3),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Modifying Child Support: When and How", idea_status: "complete", script_status: "in_progress",
    script_eta: daysFromNow(2), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Domestic Violence Resources Every Client Should Know", idea_status: "complete", script_status: "in_progress",
    script_eta: daysFromNow(4), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Mediation vs Litigation: Which Saves More?", idea_status: "complete", script_status: "not_started",
    script_eta: daysFromNow(5), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Grandparent Visitation Rights Explained", idea_status: "complete", script_status: "not_started",
    script_eta: daysFromNow(7), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Adoption: Domestic vs International Process", idea_status: "complete", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "How to Choose a Family Law Attorney", idea_status: "in_progress", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Red Flags in a Custody Agreement", idea_status: "in_progress", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
];

// Demo Client Co - 10 videos
const demoCoSeeds: Seed[] = [
  { title: "Our Founder's Story", video_type: "authentic", idea_status: "complete", script_status: "complete",
    script_content: "It started in a garage in 2014...", script_delivery_date: daysAgo(22),
    video_status: "ready", video_link: "https://drive.google.com/file/d/demo-dc1",
    caption_hook: "We started with $400 and a bad idea.", caption_body: "Here's how it became a real business.",
    caption_cta: "Read the full story — link in bio.", caption_hashtags: ["#founderstory","#smallbusiness","#entrepreneur"],
    posting_date: daysAgo(15), posting_platform: "instagram", posting_status: "posted", views: 6400, engagement: 410 },
  { title: "Product Walkthrough: Feature X", idea_status: "complete", script_status: "complete",
    script_content: "Most people use this feature wrong...", script_delivery_date: daysAgo(10),
    video_status: "ready", video_link: "https://drive.google.com/file/d/demo-dc2",
    caption_hook: "You're using Feature X wrong.", caption_body: "Here's the workflow that saves customers 4 hours a week.",
    caption_cta: "Try it free — link in bio.", caption_hashtags: ["#productivity","#saas","#tutorial"],
    posting_date: daysAgo(3), posting_platform: "youtube", posting_status: "posted", views: 14100, engagement: 980 },
  { title: "Customer Spotlight: Beacon Co.", video_type: "authentic", idea_status: "complete", script_status: "complete",
    script_content: "How Beacon scaled from 10 to 200 employees...", script_delivery_date: daysAgo(4),
    video_status: "in_editing", caption_hook: "From 10 employees to 200.",
    caption_body: "How Beacon Co. used our platform to scale operations.",
    caption_cta: "Book a demo — link in bio.", caption_hashtags: ["#casestudy","#growth","#saas"],
    posting_date: daysFromNow(4), posting_platform: "instagram", posting_status: "scheduled", views: 0, engagement: 0 },
  { title: "Behind the Scenes: Our Team Offsite", video_type: "authentic", idea_status: "complete", script_status: "complete",
    script_content: "We took the whole team to Colorado...", script_delivery_date: daysAgo(1),
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "5 Tools Every Small Business Needs", idea_status: "complete", script_status: "in_progress",
    script_eta: daysFromNow(2), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "How We Hire: Our 3-Step Process", idea_status: "complete", script_status: "in_progress",
    script_eta: daysFromNow(3), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Why We Said No to Our Biggest Client", idea_status: "complete", script_status: "not_started",
    script_eta: daysFromNow(5), video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Q4 Roadmap Preview", idea_status: "complete", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Customer Q&A Live Recap", idea_status: "in_progress", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
  { title: "Year in Review: 2025", idea_status: "in_progress", script_status: "not_started",
    video_status: "awaiting_recording", posting_status: "pending" },
];

export const videos: Video[] = [
  ...buildVideos("c1", smithSeeds),
  ...buildVideos("c2", johnsonSeeds),
  ...buildVideos("c3", demoCoSeeds),
];

// ---------- Query helpers (mirror future Supabase shape) ----------
export const getClients = () => clients;
export const getActiveClients = () => clients.filter((c) => c.active);
export const getClientBySlug = (slug: string) => clients.find((c) => c.slug === slug);
export const getClientById = (id: string) => clients.find((c) => c.id === id);
export const getVideosForClient = (clientId: string) => videos.filter((v) => v.client_id === clientId);

export function deriveStages(v: Video) {
  return {
    idea: v.idea_status,
    script: v.script_status,
    video: v.video_status === "ready" ? "complete" : v.video_status === "in_editing" ? "in_progress" : (v.script_status === "complete" ? "in_progress" : "not_started"),
    caption: (v.caption_hook && v.caption_body && v.caption_cta) ? "complete" : (v.caption_hook || v.caption_body) ? "in_progress" : "not_started",
    schedule: v.posting_status === "posted" ? "complete" : v.posting_status === "scheduled" ? "in_progress" : "not_started",
  } as Record<"idea"|"script"|"video"|"caption"|"schedule", StageStatus>;
}

export function currentStageLabel(v: Video): string {
  if (v.posting_status === "posted") return "Posted";
  if (v.posting_status === "scheduled") return "Scheduled";
  if (v.video_status === "ready" && (v.caption_hook && v.caption_body && v.caption_cta)) return "Ready to schedule";
  if (v.video_status === "ready") return "Writing captions";
  if (v.video_status === "in_editing") return "In editing";
  if (v.script_status === "complete") return "Awaiting recording";
  if (v.script_status === "in_progress") return "Writing script";
  if (v.idea_status === "complete") return "Script queued";
  return "Ideation";
}

export type { Client, Video, Platform, StageStatus, VideoProductionStatus, PostingStatus };
