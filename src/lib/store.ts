// Supabase-backed store. Mirrors the previous in-memory hook API so UI components don't change.
import { useSyncExternalStore } from "react";
import { supabase as _supabase } from "@/integrations/supabase/client";
const supabase = _supabase as any;
import type { Client, Video, Platform } from "./types";

// ---- Platform normalization (DB stores proper-case strings) ----
const PLATFORM_TO_DB: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube Shorts",
  google: "Google My Business",
};
const DB_TO_PLATFORM: Record<string, Platform> = {
  Instagram: "instagram",
  TikTok: "tiktok",
  "YouTube Shorts": "youtube",
  YouTube: "youtube",
  "Google My Business": "google",
  "Google Business": "google",
  Google: "google",
};
const normPlatforms = (arr: string[] | null | undefined): Platform[] =>
  (arr ?? []).map((p) => DB_TO_PLATFORM[p]).filter(Boolean) as Platform[];

function normClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    monthly_quota: row.monthly_quota,
    platforms: normPlatforms(row.platforms),
    active: !row.is_demo_only,
    last_activity: null,
  };
}
function normVideo(row: any): Video {
  return {
    id: row.id,
    client_id: row.client_id,
    title: row.title,
    content_angle: row.content_angle ?? "",
    video_type: row.video_type,
    platform: normPlatforms(row.platform),
    idea_status: row.idea_status,
    script_status: row.script_status,
    script_content: row.script_content ?? "",
    script_delivery_date: row.script_delivery_date,
    script_eta: row.script_eta,
    video_status: row.video_status,
    video_link: row.video_link,
    caption_hook: row.caption_hook ?? "",
    caption_body: row.caption_body ?? "",
    caption_cta: row.caption_cta ?? "",
    caption_hashtags: row.caption_hashtags ?? [],
    posting_date: row.posting_date,
    posting_platform: row.posting_platform ? (DB_TO_PLATFORM[row.posting_platform] ?? null) : null,
    posting_status: row.posting_status,
    views: row.views ?? 0,
    engagement: row.engagement ?? 0,
    client_approval_status: row.client_approval_status ?? null,
    client_feedback: row.client_feedback ?? null,
    updated_at: row.updated_at ?? null,
  };
}

let _videos: Video[] = [];
let _clients: Client[] = [];
let _loaded = false;
let _loading: Promise<void> | null = null;
let _realtimeSetup = false;
let _recentlyUpdated = new Set<string>();
const _pulseTimers = new Map<string, ReturnType<typeof setTimeout>>();

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function recomputeClientActivity() {
  const lastByClient = new Map<string, string>();
  for (const v of _videos) {
    if (!v.updated_at) continue;
    const prev = lastByClient.get(v.client_id);
    if (!prev || v.updated_at > prev) lastByClient.set(v.client_id, v.updated_at);
  }
  _clients = _clients.map((c) => ({ ...c, last_activity: lastByClient.get(c.id) ?? null }));
  _clients = [..._clients].sort((a, b) => {
    // active first, then by most recent activity desc
    if (a.active !== b.active) return a.active ? -1 : 1;
    const la = a.last_activity ?? "";
    const lb = b.last_activity ?? "";
    if (la === lb) return a.name.localeCompare(b.name);
    return la < lb ? 1 : -1;
  });
}

function flagPulse(id: string) {
  _recentlyUpdated = new Set(_recentlyUpdated);
  _recentlyUpdated.add(id);
  const prev = _pulseTimers.get(id);
  if (prev) clearTimeout(prev);
  _pulseTimers.set(
    id,
    setTimeout(() => {
      _recentlyUpdated = new Set(_recentlyUpdated);
      _recentlyUpdated.delete(id);
      _pulseTimers.delete(id);
      emit();
    }, 2500),
  );
}

async function loadOnce() {
  if (_loaded) return;
  if (_loading) return _loading;
  _loading = (async () => {
    const [{ data: c, error: cErr }, { data: v, error: vErr }] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("videos").select("*"),
    ]);
    if (cErr) console.error("[store] clients load", cErr);
    if (vErr) console.error("[store] videos load", vErr);
    _clients = (c ?? []).map(normClient);
    _videos = (v ?? []).map(normVideo);
    recomputeClientActivity();
    _loaded = true;
    emit();

    if (!_realtimeSetup && typeof window !== "undefined") {
      _realtimeSetup = true;
      supabase
        .channel("videos-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "videos" },
          (payload: any) => {
            if (payload.eventType === "INSERT") {
              const nv = normVideo(payload.new);
              if (!_videos.some((x) => x.id === nv.id)) _videos = [nv, ..._videos];
              flagPulse(nv.id);
            } else if (payload.eventType === "UPDATE") {
              const nv = normVideo(payload.new);
              _videos = _videos.map((x) => (x.id === nv.id ? nv : x));
              flagPulse(nv.id);
            } else if (payload.eventType === "DELETE") {
              _videos = _videos.filter((x) => x.id !== payload.old?.id);
            }
            recomputeClientActivity();
            emit();
          },
        )
        .subscribe();
    }
  })();
  await _loading;
  _loading = null;
}

function subscribe(l: () => void) {
  listeners.add(l);
  void loadOnce();
  return () => {
    listeners.delete(l);
  };
}

export function useVideos(): Video[] {
  return useSyncExternalStore(subscribe, () => _videos, () => _videos);
}
export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, () => _clients, () => _clients);
}
export function useRecentlyUpdated(): Set<string> {
  return useSyncExternalStore(subscribe, () => _recentlyUpdated, () => _recentlyUpdated);
}

export async function fetchClientBySlug(slug: string): Promise<Client | null> {
  const cached = _clients.find((c) => c.slug === slug);
  if (cached) return cached;
  const { data, error } = await supabase.from("clients").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return normClient(data);
}

export async function updateVideo(id: string, patch: Partial<Video>) {
  const nowIso = new Date().toISOString();
  _videos = _videos.map((v) => (v.id === id ? { ...v, ...patch, updated_at: nowIso } : v));
  flagPulse(id);
  recomputeClientActivity();
  emit();

  const dbPatch: Record<string, any> = { ...patch };
  if (patch.platform) dbPatch.platform = patch.platform.map((p) => PLATFORM_TO_DB[p]);
  if ("posting_platform" in patch) {
    dbPatch.posting_platform = patch.posting_platform ? PLATFORM_TO_DB[patch.posting_platform] : null;
  }
  // updated_at handled by DB trigger if present; don't send.
  delete dbPatch.updated_at;

  const { error } = await supabase.from("videos").update(dbPatch).eq("id", id);
  if (error) console.error("[store] updateVideo", error);
}

export async function addVideo(v: Video) {
  const dbRow = {
    client_id: v.client_id,
    title: v.title,
    content_angle: v.content_angle,
    video_type: v.video_type,
    platform: v.platform.map((p) => PLATFORM_TO_DB[p]),
    idea_status: v.idea_status,
    script_status: v.script_status,
    script_content: v.script_content,
    script_delivery_date: v.script_delivery_date,
    script_eta: v.script_eta,
    video_status: v.video_status,
    video_link: v.video_link,
    caption_hook: v.caption_hook,
    caption_body: v.caption_body,
    caption_cta: v.caption_cta,
    caption_hashtags: v.caption_hashtags,
    posting_date: v.posting_date,
    posting_platform: v.posting_platform ? PLATFORM_TO_DB[v.posting_platform] : null,
    posting_status: v.posting_status,
    views: v.views,
    engagement: v.engagement,
  };
  const { data, error } = await supabase.from("videos").insert(dbRow).select().single();
  if (error) {
    console.error("[store] addVideo", error);
    return;
  }
  if (data) {
    const nv = normVideo(data);
    if (!_videos.some((x) => x.id === nv.id)) {
      _videos = [nv, ..._videos];
      recomputeClientActivity();
      emit();
    }
  }
}

export const DEMO_MANAGER_PASSCODE = "socialvert2025";
