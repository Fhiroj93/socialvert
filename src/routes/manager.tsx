import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardShell, SectionView, type ShellSection } from "@/components/sv/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useClients, useVideos, updateVideo, addVideo, useRecentlyUpdated } from "@/lib/store";
import { deriveStages, currentStageLabel } from "@/lib/mockData";
import { StageTracker } from "@/components/sv/StageTracker";
import { PlatformIcon, PlatformList } from "@/components/sv/PlatformIcon";
import { PostingBadge, VideoProductionBadge } from "@/components/sv/StatusBadge";
import { ActionButton } from "@/components/sv/ActionButton";
import { CalendarBoard } from "@/components/sv/CalendarBoard";
import type { Platform, Video, VideoType, VideoProductionStatus } from "@/lib/types";
import {
  Plus, Sparkles, Lock, CheckCircle2, CalendarDays,
  LayoutDashboard, Users, ListChecks, FileText, Clapperboard, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/manager")({
  head: () => ({ meta: [{ title: "Manager Dashboard — Socialvert" }] }),
  component: ManagerDashboard,
});

const ALL_PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "google"];

const SECTIONS: ShellSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: ListChecks },
  { id: "scripts", label: "Scripts", icon: FileText },
  { id: "production", label: "Video", icon: Clapperboard },
  { id: "captions", label: "Captions & Schedule", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function ManagerDashboard() {
  const clients = useClients();
  const videos = useVideos();
  const activeClients = clients.filter((c) => c.active);
  const [selectedClientId, setSelectedClientId] = useState(activeClients[0]?.id ?? "");
  const [section, setSection] = useState("overview");

  // Keep selection valid as clients load
  if (!selectedClientId && activeClients[0]) {
    setSelectedClientId(activeClients[0].id);
  }

  const clientVideos = useMemo(
    () => videos.filter((v) => v.client_id === selectedClientId),
    [videos, selectedClientId],
  );

  const totals = useMemo(() => {
    const activeVids = videos.filter((v) => activeClients.some((c) => c.id === v.client_id));
    return {
      activeClients: activeClients.length,
      totalThisMonth: activeVids.length,
      completed: activeVids.filter((v) => v.posting_status === "posted").length,
      inProgress: activeVids.filter((v) => v.posting_status !== "posted").length,
    };
  }, [videos, activeClients]);

  function handleClientRowClick(id: string, active: boolean) {
    if (!active) { toast.info("Demo client", { description: "No live data for this account." }); return; }
    setSelectedClientId(id);
    setSection("pipeline");
  }

  return (
    <DashboardShell label="Manager Dashboard" sections={SECTIONS} current={section} onSelect={setSection}>
      {/* OVERVIEW */}
      <SectionView id="overview" current={section}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 sv-stagger">
            <StatCard label="Active clients" value={totals.activeClients} />
            <StatCard label="Videos this month" value={totals.totalThisMonth} />
            <StatCard label="Completed" value={totals.completed} accent="success" />
            <StatCard label="In progress" value={totals.inProgress} accent="primary" />
          </div>

          <Card className="sv-card-holo">
            <CardHeader><CardTitle className="font-display text-xl">All clients</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {clients.map((c) => {
                  const cv = videos.filter((v) => v.client_id === c.id);
                  const done = cv.filter((v) => v.posting_status === "posted").length;
                  const pct = c.active && cv.length ? Math.round((done / c.monthly_quota) * 100) : 0;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleClientRowClick(c.id, c.active)}
                      className={`flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4 ${c.active ? "cursor-pointer hover:bg-accent/50" : "opacity-60"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{c.name}</span>
                          {!c.active && <Badge variant="secondary" className="gap-1 text-[10px]"><Lock className="h-3 w-3" /> Demo</Badge>}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{c.monthly_quota}/mo</span>
                          <PlatformList platforms={c.platforms} className="h-3.5 w-3.5" />
                          {c.last_activity && <span>· Updated {new Date(c.last_activity).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:w-64">
                        <Progress value={c.active ? pct : 0} className="h-2 flex-1" />
                        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{c.active ? `${pct}%` : "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionView>

      {/* CLIENTS */}
      <SectionView id="clients" current={section}>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl font-semibold">Select a client</h2>
          <ClientPicker clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sv-stagger">
          {activeClients.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedClientId(c.id); setSection("pipeline"); }}
              className={`sv-card-holo rounded-2xl p-5 text-left transition-transform hover:-translate-y-1 ${selectedClientId === c.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="font-display text-lg font-semibold">{c.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.monthly_quota} videos / month</div>
              <div className="mt-3"><PlatformList platforms={c.platforms} /></div>
            </button>
          ))}
        </div>
      </SectionView>

      {/* PIPELINE */}
      <SectionView id="pipeline" current={section}>
        <div className="space-y-5">
          <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId}>
            <NewContentIdeaDialog clientId={selectedClientId} />
          </SelectedClientBanner>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sv-stagger">
            {clientVideos.map((v) => <ManagerPipelineCard key={v.id} v={v} />)}
            {clientVideos.length === 0 && <EmptyState text="No videos yet for this client." />}
          </div>
        </div>
      </SectionView>

      {/* SCRIPTS */}
      <SectionView id="scripts" current={section}>
        <div className="space-y-5">
          <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
          <div className="space-y-3">
            {clientVideos.map((v) => <ScriptRow key={v.id} v={v} />)}
          </div>
        </div>
      </SectionView>

      {/* PRODUCTION */}
      <SectionView id="production" current={section}>
        <div className="space-y-5">
          <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
          <Card className="sv-card-holo">
            <CardContent className="divide-y divide-border p-0">
              {clientVideos.map((v) => (
                <div key={v.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{v.title}</div>
                    <div className="mt-1"><VideoProductionBadge status={v.video_status} /></div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select value={v.video_status} onValueChange={(s) => updateVideo(v.id, { video_status: s as VideoProductionStatus })}>
                      <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awaiting_recording">Awaiting recording</SelectItem>
                        <SelectItem value="in_editing">In editing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Video link (Drive / Frame.io / YouTube)"
                      value={v.video_link ?? ""}
                      onChange={(e) => updateVideo(v.id, { video_link: e.target.value || null })}
                      className="w-full sm:w-72"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SectionView>

      {/* CAPTIONS + SCHEDULE */}
      <SectionView id="captions" current={section}>
        <div className="space-y-5">
          <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
          <CalendarBoard videos={clientVideos} />
          <div className="space-y-4">
            {clientVideos.map((v) => <CaptionScheduleCard key={v.id} v={v} />)}
          </div>
        </div>
      </SectionView>

      {/* ANALYTICS */}
      <SectionView id="analytics" current={section}>
        <ManagerAnalytics />
      </SectionView>
    </DashboardShell>
  );
}

function ManagerPipelineCard({ v }: { v: Video }) {
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);
  return (
    <Card className={cn("sv-card-holo transition-all", pulse && "sv-update-pulse")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{v.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{currentStageLabel(v)}</div>
          </div>
          <Badge variant="secondary" className="text-[10px] capitalize">{v.video_type}</Badge>
        </div>
        <div className="mt-4"><StageTracker stages={deriveStages(v)} /></div>
        <div className="mt-3 flex items-center justify-between">
          <PlatformList platforms={v.platform} />
          <div className="flex items-center gap-1.5">
            {v.client_approval_status === "approved" && (
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]">Client approved</Badge>
            )}
            {v.client_approval_status === "changes_requested" && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-[10px]">Changes requested</Badge>
            )}
            <PostingBadge status={v.posting_status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "primary" | "success" }) {
  const accentCls = accent === "primary" ? "text-primary" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <Card className="sv-card-holo transition-transform hover:-translate-y-1">
      <CardContent className="p-4 sm:p-5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 font-display text-4xl font-bold tabular-nums ${accentCls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{text}</div>;
}

function ClientPicker({ clients, value, onChange }: { clients: ReturnType<typeof useClients>; value: string; onChange: (id: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Select client" /></SelectTrigger>
      <SelectContent>
        {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function SelectedClientBanner({ clients, value, onChange, children }: {
  clients: ReturnType<typeof useClients>; value: string; onChange: (id: string) => void; children?: React.ReactNode;
}) {
  const c = clients.find((x) => x.id === value);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-accent/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Client</span>
        <ClientPicker clients={clients} value={value} onChange={onChange} />
        {c && <PlatformList platforms={c.platforms} />}
      </div>
      {children}
    </div>
  );
}

function NewContentIdeaDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [angle, setAngle] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram"]);
  const [type, setType] = useState<VideoType>("educational");

  function save() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    const v: Video = {
      id: `${clientId}-v-${Date.now()}`, client_id: clientId, title: title.trim(),
      content_angle: angle, video_type: type, platform: platforms,
      idea_status: "complete", script_status: "not_started", script_content: "",
      script_delivery_date: null, script_eta: null,
      video_status: "awaiting_recording", video_link: null,
      caption_hook: "", caption_body: "", caption_cta: "", caption_hashtags: [],
      posting_date: null, posting_platform: null, posting_status: "pending",
      views: 0, engagement: 0,
      client_approval_status: null, client_feedback: null, updated_at: null,
    };
    addVideo(v);
    toast.success("Idea added to pipeline");
    setOpen(false); setTitle(""); setAngle(""); setPlatforms(["instagram"]); setType("educational");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="transition-transform hover:-translate-y-0.5 active:translate-y-0"><Plus className="mr-1.5 h-4 w-4" /> New content idea</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2 font-display text-2xl"><Sparkles className="h-4 w-4 text-primary" /> New content idea</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5"><Label>Video title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 3 Mistakes After a Car Accident" /></div>
          <div className="space-y-1.5"><Label>Content angle</Label><Textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={3} placeholder="What's the hook? What's the takeaway?" /></div>
          <div className="space-y-1.5">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_PLATFORMS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={platforms.includes(p)}
                    onCheckedChange={(c) => setPlatforms((cur) => c ? [...cur, p] : cur.filter((x) => x !== p))} />
                  <PlatformIcon platform={p} />
                  <span className="capitalize">{p === "google" ? "Google Business" : p}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Video type</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as VideoType)} className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="educational" /> Educational</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="authentic" /> Authentic</label>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save}>Add to pipeline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScriptRow({ v }: { v: Video }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(v.script_content);
  const [eta, setEta] = useState(v.script_eta ?? "");
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);

  async function markComplete() {
    const today = new Date().toISOString().slice(0, 10);
    await updateVideo(v.id, { script_content: text, script_status: "complete", script_delivery_date: today, script_eta: null });
    toast.success("Script marked complete");
    setOpen(false);
  }
  async function saveDraft() {
    await updateVideo(v.id, { script_content: text, script_eta: eta || null, script_status: text.trim() ? "in_progress" : "not_started" });
    toast.success("Draft saved");
  }

  return (
    <Card className={cn("sv-card-holo", pulse && "sv-update-pulse")}>
      <CardContent className="p-4">
        <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen((o) => !o)}>
          <div className="min-w-0">
            <div className="truncate font-medium">{v.title}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {v.script_status === "complete" ? (
                <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Delivered {v.script_delivery_date}</span>
              ) : v.script_status === "in_progress" ? (
                <span>Drafting{v.script_eta && ` — ETA ${v.script_eta}`}</span>
              ) : (
                <span>Not started{v.script_eta && ` — ETA ${v.script_eta}`}</span>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] capitalize">{v.script_status.replace("_", " ")}</Badge>
        </button>
        {open && (
          <div className="mt-4 space-y-3 border-t border-border pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-1.5"><Label>Script</Label><Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="HOOK:&#10;BODY:&#10;CTA:" /></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <Label>ETA</Label>
                <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className="w-44" />
              </div>
              <div className="flex gap-2">
                <ActionButton onAction={saveDraft} variant="ghost" successLabel="Saved">Save draft</ActionButton>
                <ActionButton onAction={markComplete} successLabel="Marked complete" icon={<CheckCircle2 className="mr-1.5 h-4 w-4" />}>Mark complete</ActionButton>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CaptionScheduleCard({ v }: { v: Video }) {
  const [hook, setHook] = useState(v.caption_hook);
  const [body, setBody] = useState(v.caption_body);
  const [cta, setCta] = useState(v.caption_cta);
  const [tags, setTags] = useState(v.caption_hashtags.join(", "));
  const [date, setDate] = useState(v.posting_date ?? "");
  const [plat, setPlat] = useState<Platform>(v.posting_platform ?? v.platform[0] ?? "instagram");
  const recent = useRecentlyUpdated();
  const pulse = recent.has(v.id);

  async function saveCaptions() {
    await updateVideo(v.id, {
      caption_hook: hook, caption_body: body, caption_cta: cta,
      caption_hashtags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    toast.success("Captions saved");
  }
  async function schedule() {
    if (!date) { toast.error("Pick a posting date"); throw new Error("no date"); }
    await updateVideo(v.id, { posting_date: date, posting_platform: plat, posting_status: "scheduled" });
    toast.success(`Scheduled for ${date}`);
  }
  async function markPosted() {
    await updateVideo(v.id, { posting_status: "posted" });
    toast.success("Marked as posted");
  }

  return (
    <Card className={cn("sv-card-holo", pulse && "sv-update-pulse")}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-lg font-semibold">{v.title}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <PlatformList platforms={v.platform} />
              <span>·</span>
              <span>{currentStageLabel(v)}</span>
            </div>
          </div>
          <PostingBadge status={v.posting_status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Hook</Label><Input value={hook} onChange={(e) => setHook(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>CTA</Label><Input value={cta} onChange={(e) => setCta(e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Body copy</Label><Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Hashtags <span className="text-muted-foreground">(comma-separated)</span></Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#injurylaw, #legaltips" />
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.split(",").map((t) => t.trim()).filter(Boolean).map((t, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end"><ActionButton onAction={saveCaptions} variant="secondary" successLabel="Saved">Save captions</ActionButton></div>

        <div className="rounded-lg border border-border bg-accent/30 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Schedule</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Posting date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={plat} onValueChange={(p) => setPlat(p as Platform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {v.platform.map((p) => <SelectItem key={p} value={p} className="capitalize">{p === "google" ? "Google Business" : p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <ActionButton onAction={schedule} successLabel="Scheduled" className="flex-1">Schedule</ActionButton>
              {v.posting_status === "scheduled" && (
                <ActionButton onAction={markPosted} variant="secondary" successLabel="Posted">Mark posted</ActionButton>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ManagerAnalytics() {
  const clients = useClients();
  const videos = useVideos();
  const active = clients.filter((c) => c.active);
  const posted = videos.filter((v) => v.posting_status === "posted");
  const platformsConnected = new Set(active.flatMap((c) => c.platforms)).size;
  const avgCompleted = active.length ? Math.round((posted.length / active.length) * 10) / 10 : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 sv-stagger">
        <StatCard label="Posts published" value={posted.length} accent="success" />
        <StatCard label="Platforms connected" value={platformsConnected} accent="primary" />
        <StatCard label="Avg posts / client" value={avgCompleted as unknown as number} />
        <StatCard label="Active clients" value={active.length} />
      </div>

      <Card className="sv-card-holo">
        <CardHeader><CardTitle className="font-display text-xl">Client overview</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Quota</th>
                  <th className="px-4 py-3 text-left">Platforms</th>
                  <th className="px-4 py-3 text-left">Last activity</th>
                  <th className="px-4 py-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const cv = videos.filter((v) => v.client_id === c.id);
                  const done = cv.filter((v) => v.posting_status === "posted").length;
                  const pct = c.active && cv.length ? Math.round((done / c.monthly_quota) * 100) : 0;
                  const last = c.last_activity ? new Date(c.last_activity).toLocaleDateString() : "—";
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{c.name}{!c.active && <Badge variant="secondary" className="ml-2 text-[10px]">Demo</Badge>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.monthly_quota}/mo</td>
                      <td className="px-4 py-3"><PlatformList platforms={c.platforms} className="h-3.5 w-3.5" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{c.active ? last : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.active ? `${pct}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
