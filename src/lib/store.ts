// In-memory mutable store seeded from mockData. Future swap target: Supabase queries.
import { useSyncExternalStore } from "react";
import { videos as seedVideos, clients as seedClients } from "./mockData";
import type { Video, Client } from "./types";

let _videos: Video[] = seedVideos.map((v) => ({ ...v, caption_hashtags: [...v.caption_hashtags], platform: [...v.platform] }));
const _clients: Client[] = seedClients.map((c) => ({ ...c, platforms: [...c.platforms] }));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useVideos(): Video[] {
  return useSyncExternalStore(subscribe, () => _videos, () => _videos);
}
export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, () => _clients, () => _clients);
}

export function updateVideo(id: string, patch: Partial<Video>) {
  _videos = _videos.map((v) => (v.id === id ? { ...v, ...patch } : v));
  emit();
}

export function addVideo(v: Video) {
  _videos = [v, ..._videos];
  emit();
}

export const DEMO_MANAGER_PASSCODE = "socialvert2025";
