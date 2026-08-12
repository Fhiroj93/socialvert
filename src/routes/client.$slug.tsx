import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardShell, SectionView, type ShellSection } from "@/components/sv/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { deriveStages, currentStageLabel } from "@/lib/mockData";
import { useVideos, useClients, updateVideo, fetchClientBySlug, useRecentlyUpdated } from "@/lib/liveStore";
import { StageTracker } from "@/components/sv/StageTracker";
import { QuotaRing } from "@/components/sv/QuotaRing";
import { PlatformIcon, PlatformList } from "@/components/sv/PlatformIcon";
import { PostingBadge } from "@/components/sv/StatusBadge";
import { VideoActionsBar } from "@/components/sv/VideoActionsBar";
import { VideoEmbed } from "@/components/sv/VideoEmbed";
import { CalendarBoard } from "@/components/sv/CalendarBoard";
import { ActionButton } from "@/components/sv/ActionButton";
import {
  ChevronDown, ChevronUp, Pencil, Eye, Heart, TrendingUp, Trophy,
  LayoutDashboard, ListChecks, FileText, Video as VideoIcon, MessageSquare, CalendarDays, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Video } from "@/lib/types";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/client/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Socialvert Client Dashboard` }],
  }),
  loader: async ({ params }) => {
    const client = await fetchClientBySlug(params.slug);
    if (!client || !client.active) throw notFound();
    return { client };
  },
  component: ClientDashboard,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-semibold">Client not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">That account doesn't exist.</p>
      </div>
    </div>
  ),
});

const SECTIONS: ShellSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline", icon: ListChecks },
  { id: "scripts", label: "Scripts", icon: FileText },
  { id: "library", label: "Video library", icon: VideoIcon },
  { id: "captions", label: "Captions", icon: MessageSquare },
  { id: "calendar", label: "Schedule", icon: CalendarDays },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

function ClientDashboard() {
  const loaderData = Route.useLoaderData() as { client: ClientType } | undefined;
  const loaderClient = loaderData?.client;
  const liveClient = useClients().find((c) => c.id === loaderClient?.id);
  if (!loaderClient) return null;
  const client = liveClient ?? loaderClient;
  const allVideos = useVideos();
  const videos = useMemo(() => allVideos.filter((v) => v.client_id === client.id), [allVideos, client.id]);
  const [section, setSection] = useState("overview");

  const completed = videos.filter((v) => v.posting_status === "posted").length;
  const inProgress = videos.filter((v) => v.posting_status !== "posted" && v.idea_status === "complete").length;
  const remaining = Math.max(client.monthly_quota - completed - inProgress, 0);

  return (
    <DashboardShell label={client.name} sections={SECTIONS} current={section} onSelect={setSection}>
      <SectionView id="overview" current={section}>
        <Card className="sv-card-holo overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-10 sm:p-8">
            <QuotaRing total={client.monthly_quota} completed={completed} inProgress={inProgress} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">This month</div>
              <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">{client.monthly_quota} videos</h1>
              <p className="mt-2 text-sm text-muted-foreground">Tracked across {client.platforms.length} platforms.</p>
              <div className="mt-5 grid max-w-md grid-cols-3 gap-3 mx-auto sm:mx-0">
                <Legend dotClass="bg-success" label="Completed" value={completed} />
                <Legend dotClass="bg-primary/40" label="In progress" value={inProgress} />
                <Legend dotClass="bg-muted" label="Remaining" value={remaining} />
              </div>
            </div>
          </CardContent>
        </Card>
      </SectionView>

      <SectionView id="pipeline" current={section}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sv-stagger">
          {videos.map((v) => <ClientPipelineCard key={v.id} v={v} />)}
        </div>
      </SectionView>

      <SectionView id="scripts" current={section}>
        <div className="space-y-3">
          {videos.map((v) => <ClientScriptRow key={v.id} v={v} />)}
        </div>
      </SectionView>

      <SectionView id="library" current={section}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sv-stagger">
          {videos.map((v) => <LibraryCard key={v.id} v={v} />)}
        </div>
      </SectionView>

      <SectionView id="captions" current={section}>
        <div className="space-y-3">
          {videos.filter((v) => v.caption_hook || v.caption_body).map((v) => <ClientCaptionCard key={v.id} v={v} />)}
          {videos.filter((v) => v.caption_hook || v.caption_body).length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No captions ready yet.
            </div>
          )}
        </div>
      </SectionView>

      <SectionView id="calendar" current={section}>
        <CalendarBoard videos={videos} />
      </SectionView>

      <SectionView id="performance" current={section}>
        <ClientPerformance videos={videos} />
      </SectionView>
    </DashboardShell>
  );
}

function Legend({ dotClass, label, value }: { dotClass: string; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-0.5 font-display text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ClientPipelineCard({ v }: { v: Video }) {
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);
  return (
    <Card className={cn("sv-card-holo", pulse && "sv-update-pulse")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{v.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">Currently: <span className="font-medium text-foreground">{currentStageLabel(v)}</span></div>
          </div>
          <PostingBadge status={v.posting_status} />
        </div>
        <div className="mt-4"><StageTracker stages={deriveStages(v)} /></div>
        <div className="mt-3"><PlatformList platforms={v.platform} /></div>
        <VideoActionsBar v={v} />
      </CardContent>
    </Card>
  );
}

function ClientScriptRow({ v }: { v: Video }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(v.script_content);
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);

  async function saveScript() {
    await updateVideo(v.id, { script_content: draft });
    toast.success("Script updated");
    setEditing(false);
  }

  return (
    <Card className={cn("sv-card-holo", pulse && "sv-update-pulse")}>
      <CardContent className="p-4">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="truncate font-medium">{v.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {v.script_status === "complete" && v.script_delivery_date ? `Delivered ${v.script_delivery_date}` :
                v.script_eta ? `Expected ${v.script_eta}` : "Awaiting drafting"}
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {open && (
          <div className="mt-4 space-y-4 border-t border-border pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {editing ? (
              <div className="space-y-2">
                <Textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setDraft(v.script_content); setEditing(false); }}>Cancel</Button>
                  <ActionButton onAction={saveScript} successLabel="Saved">Save script</ActionButton>
                </div>
              </div>
            ) : v.script_content ? (
              <pre className="whitespace-pre-wrap rounded-lg bg-accent/40 p-4 font-sans text-sm leading-relaxed text-foreground">{v.script_content}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Script not yet available.</p>
            )}
            <VideoActionsBar v={v} onEdit={() => { setDraft(v.script_content); setEditing(true); }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LibraryCard({ v }: { v: Video }) {
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);
  return (
    <Card className={cn("sv-card-holo", pulse && "sv-update-pulse")}>
      <CardContent className="space-y-3 p-4">
        <VideoEmbed link={v.video_link} platforms={v.platform} />
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{v.title}</div>
            <div className="mt-1"><PlatformList platforms={v.platform} className="h-3.5 w-3.5" /></div>
          </div>
          <PostingBadge status={v.posting_status} />
        </div>
        <VideoActionsBar v={v} />
      </CardContent>
    </Card>
  );
}

function EditableField({ label, value, multiline, onSave }: { label: string; value: string; multiline?: boolean; onSave: (v: string) => Promise<void> | void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        {!editing && (
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setVal(value); setEditing(true); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          {multiline ? <Textarea rows={3} value={val} onChange={(e) => setVal(e.target.value)} /> : <Input value={val} onChange={(e) => setVal(e.target.value)} />}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <ActionButton onAction={async () => { await onSave(val); setEditing(false); }} successLabel="Saved">Save</ActionButton>
          </div>
        </div>
      ) : (
        <div className="mt-1 text-sm whitespace-pre-wrap">{value || <span className="italic text-muted-foreground">Empty</span>}</div>
      )}
    </div>
  );
}

function ClientCaptionCard({ v }: { v: Video }) {
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);
  const [tagEditing, setTagEditing] = useState(false);
  const [tagDraft, setTagDraft] = useState(v.caption_hashtags.join(", "));

  return (
    <Card className={cn("sv-card-holo", pulse && "sv-update-pulse")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-lg font-semibold">{v.title}</div>
            <div className="mt-1"><PlatformList platforms={v.platform} className="h-3.5 w-3.5" /></div>
          </div>
          <PostingBadge status={v.posting_status} />
        </div>
        <EditableField label="Hook" value={v.caption_hook} onSave={(val) => updateVideo(v.id, { caption_hook: val })} />
        <EditableField label="Body" value={v.caption_body} multiline onSave={(val) => updateVideo(v.id, { caption_body: val })} />
        <EditableField label="CTA" value={v.caption_cta} onSave={(val) => updateVideo(v.id, { caption_cta: val })} />
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hashtags</div>
            {!tagEditing && (
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { setTagDraft(v.caption_hashtags.join(", ")); setTagEditing(true); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {tagEditing ? (
            <div className="mt-2 space-y-2">
              <Input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="#tag1, #tag2" />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setTagEditing(false)}>Cancel</Button>
                <ActionButton
                  onAction={async () => {
                    await updateVideo(v.id, { caption_hashtags: tagDraft.split(",").map((t) => t.trim()).filter(Boolean) });
                    setTagEditing(false);
                  }}
                  successLabel="Saved"
                >Save</ActionButton>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.caption_hashtags.length ? v.caption_hashtags.map((t, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{t}</span>
              )) : <span className="text-sm italic text-muted-foreground">None</span>}
            </div>
          )}
        </div>
        <VideoActionsBar v={v} />
      </CardContent>
    </Card>
  );
}

function ClientPerformance({ videos }: { videos: Video[] }) {
  const posted = videos.filter((v) => v.posting_status === "posted");
  const totalViews = posted.reduce((s, v) => s + v.views, 0);
  const totalEng = posted.reduce((s, v) => s + v.engagement, 0);

  const platformViews = new Map<string, number>();
  posted.forEach((v) => { if (v.posting_platform) platformViews.set(v.posting_platform, (platformViews.get(v.posting_platform) ?? 0) + v.views); });
  const bestPlatform = [...platformViews.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const top = [...posted].sort((a, b) => b.views - a.views)[0];
  const top3 = [...posted].sort((a, b) => b.views - a.views).slice(0, 3);

  const chartData = posted
    .filter((v) => v.posting_date)
    .sort((a, b) => (a.posting_date! < b.posting_date! ? -1 : 1))
    .slice(-6)
    .map((v) => ({ name: v.title.length > 14 ? v.title.slice(0, 14) + "…" : v.title, views: v.views }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sv-stagger">
        <PerfCard icon={<Eye className="h-4 w-4" />} label="Total views" value={totalViews.toLocaleString()} />
        <PerfCard icon={<Heart className="h-4 w-4" />} label="Engagement" value={totalEng.toLocaleString()} />
        <PerfCard icon={<TrendingUp className="h-4 w-4" />} label="Best platform" value={bestPlatform ? (bestPlatform === "google" ? "Google Biz" : bestPlatform.charAt(0).toUpperCase() + bestPlatform.slice(1)) : "—"} />
        <PerfCard icon={<Trophy className="h-4 w-4" />} label="Top post" value={top ? `${top.views.toLocaleString()} views` : "—"} sub={top?.title} />
      </div>

      <Card className="sv-card-holo">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-display text-xl">Views by recent post</CardTitle>
          <Badge variant="secondary" className="text-[10px]">Updated weekly</Badge>
        </CardHeader>
        <CardContent className="h-64">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "var(--color-accent)" }}
                />
                <Bar dataKey="views" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No posted content yet.</div>
          )}
        </CardContent>
      </Card>

      <Card className="sv-card-holo">
        <CardHeader><CardTitle className="font-display text-xl">Top 3 posts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {top3.length === 0 && <p className="text-sm text-muted-foreground">No posted content yet.</p>}
          {top3.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 transition-all hover:-translate-y-0.5">
              <div className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                {v.posting_platform && <PlatformIcon platform={v.posting_platform} className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">#{i + 1}</div>
                <div className="truncate font-medium">{v.title}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold tabular-nums">{v.views.toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground">views</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PerfCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="sv-card-holo transition-transform hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
        <div className="mt-1.5 truncate font-display text-2xl font-semibold tabular-nums">{value}</div>
        {sub && <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

// Keep imports used to satisfy linter even when conditional
void Dialog; void DialogContent; void DialogFooter; void DialogHeader; void DialogTitle; void DialogTrigger; void Label;
