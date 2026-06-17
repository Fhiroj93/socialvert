import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/sv/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useClients, useVideos, updateVideo, addVideo } from "@/lib/store";
import { deriveStages, currentStageLabel } from "@/lib/mockData";
import { StageTracker } from "@/components/sv/StageTracker";
import { PlatformIcon, PlatformList } from "@/components/sv/PlatformIcon";
import { PostingBadge, VideoProductionBadge } from "@/components/sv/StatusBadge";
import type { Platform, Video, VideoType, VideoProductionStatus } from "@/lib/types";
import { Plus, Sparkles, Lock, ExternalLink, CheckCircle2, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/manager")({
  head: () => ({ meta: [{ title: "Manager Dashboard — Socialvert" }] }),
  component: ManagerDashboard,
});

const ALL_PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube", "google"];

function ManagerDashboard() {
  const clients = useClients();
  const videos = useVideos();
  const activeClients = clients.filter((c) => c.active);
  const [selectedClientId, setSelectedClientId] = useState(activeClients[0]?.id ?? "");
  const [tab, setTab] = useState("overview");

  const clientVideos = useMemo(() => videos.filter((v) => v.client_id === selectedClientId), [videos, selectedClientId]);

  const totals = useMemo(() => {
    const activeVids = videos.filter((v) => activeClients.some((c) => c.id === v.client_id));
    return {
      activeClients: clients.length,
      totalThisMonth: activeVids.length,
      completed: activeVids.filter((v) => v.posting_status === "posted").length,
      inProgress: activeVids.filter((v) => v.posting_status !== "posted").length,
    };
  }, [videos, activeClients, clients]);

  function handleClientRowClick(id: string, active: boolean) {
    if (!active) { toast.info("Demo client", { description: "No live data for this account." }); return; }
    setSelectedClientId(id); setTab("pipeline");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar label="Manager Dashboard" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="production">Video</TabsTrigger>
              <TabsTrigger value="captions">Captions & Schedule</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCard label="Active clients" value={totals.activeClients} />
              <StatCard label="Videos this month" value={totals.totalThisMonth} />
              <StatCard label="Completed" value={totals.completed} accent="success" />
              <StatCard label="In progress" value={totals.inProgress} accent="primary" />
            </div>

            <Card className="sv-card-holo">
              <CardHeader><CardTitle className="text-base">All clients</CardTitle></CardHeader>
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
                        className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${c.active ? "cursor-pointer hover:bg-accent/40" : "opacity-60"}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{c.name}</span>
                            {!c.active && <Badge variant="secondary" className="gap-1 text-[10px]"><Lock className="h-3 w-3" /> Demo</Badge>}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{c.monthly_quota}/mo</span>
                            <PlatformList platforms={c.platforms} className="h-3.5 w-3.5" />
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
          </TabsContent>

          {/* CLIENTS */}
          <TabsContent value="clients" className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Select a client</h2>
              <ClientPicker clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {activeClients.map((c) => (
                <button key={c.id} onClick={() => { setSelectedClientId(c.id); setTab("pipeline"); }}
                  className={`sv-card-holo rounded-2xl p-5 text-left ${selectedClientId === c.id ? "ring-2 ring-primary" : ""}`}>
                  <div className="font-semibold">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.monthly_quota} videos / month</div>
                  <div className="mt-3"><PlatformList platforms={c.platforms} /></div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* PIPELINE */}
          <TabsContent value="pipeline" className="mt-6 space-y-5">
            <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId}>
              <NewContentIdeaDialog clientId={selectedClientId} />
            </SelectedClientBanner>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {clientVideos.map((v) => (
                <Card key={v.id} className="sv-card-holo">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{v.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{currentStageLabel(v)}</div>
                      </div>
                      <Badge variant="secondary" className="capitalize text-[10px]">{v.video_type}</Badge>
                    </div>
                    <div className="mt-4"><StageTracker stages={deriveStages(v)} /></div>
                    <div className="mt-3 flex items-center justify-between">
                      <PlatformList platforms={v.platform} />
                      <PostingBadge status={v.posting_status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {clientVideos.length === 0 && <EmptyState text="No videos yet for this client." />}
            </div>
          </TabsContent>

          {/* SCRIPTS */}
          <TabsContent value="scripts" className="mt-6 space-y-5">
            <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
            <div className="space-y-3">
              {clientVideos.map((v) => <ScriptRow key={v.id} v={v} />)}
            </div>
          </TabsContent>

          {/* PRODUCTION */}
          <TabsContent value="production" className="mt-6 space-y-5">
            <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
            <Card className="sv-card-holo">
              <CardContent className="divide-y divide-border p-0">
                {clientVideos.map((v) => (
                  <div key={v.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{v.title}</div>
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
                        placeholder="Video link (Drive / Frame.io)"
                        value={v.video_link ?? ""}
                        onChange={(e) => updateVideo(v.id, { video_link: e.target.value || null })}
                        className="w-full sm:w-72"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAPTIONS + SCHEDULE */}
          <TabsContent value="captions" className="mt-6 space-y-5">
            <SelectedClientBanner clients={activeClients} value={selectedClientId} onChange={setSelectedClientId} />
            <div className="space-y-4">
              {clientVideos.map((v) => <CaptionScheduleCard key={v.id} v={v} />)}
            </div>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6 space-y-5">
            <ManagerAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "primary"|"success" }) {
  const accentCls = accent === "primary" ? "text-primary" : accent === "success" ? "text-success" : "text-foreground";
  return (
    <Card className="sv-card-holo">
      <CardContent className="p-4 sm:p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 text-3xl font-bold tabular-nums ${accentCls}`}>{value}</div>
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
      <div className="flex items-center gap-3">
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
    };
    addVideo(v);
    toast.success("Idea added to pipeline");
    setOpen(false); setTitle(""); setAngle(""); setPlatforms(["instagram"]); setType("educational");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> New content idea</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> New content idea</DialogTitle></DialogHeader>
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

  function markComplete() {
    const today = new Date().toISOString().slice(0, 10);
    updateVideo(v.id, { script_content: text, script_status: "complete", script_delivery_date: today, script_eta: null });
    toast.success("Script marked complete");
    setOpen(false);
  }
  function saveDraft() {
    updateVideo(v.id, { script_content: text, script_eta: eta || null, script_status: text.trim() ? "in_progress" : "not_started" });
    toast.success("Saved");
  }

  return (
    <Card className="sv-card-holo">
      <CardContent className="p-4">
        <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen((o) => !o)}>
          <div className="min-w-0">
            <div className="font-medium truncate">{v.title}</div>
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
          <Badge variant="outline" className="capitalize text-[10px]">{v.script_status.replace("_", " ")}</Badge>
        </button>
        {open && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="space-y-1.5"><Label>Script</Label><Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="HOOK:&#10;BODY:&#10;CTA:" /></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <Label>ETA</Label>
                <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className="w-44" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={saveDraft}>Save draft</Button>
                <Button onClick={markComplete}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark complete</Button>
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

  function saveCaptions() {
    updateVideo(v.id, {
      caption_hook: hook, caption_body: body, caption_cta: cta,
      caption_hashtags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    toast.success("Captions saved");
  }
  function schedule() {
    if (!date) { toast.error("Pick a posting date"); return; }
    updateVideo(v.id, { posting_date: date, posting_platform: plat, posting_status: "scheduled" });
    toast.success(`Scheduled for ${date} on ${plat}`);
  }
  function markPosted() {
    updateVideo(v.id, { posting_status: "posted" });
    toast.success("Marked as posted");
  }

  return (
    <Card className="sv-card-holo">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{v.title}</div>
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
        <div className="flex justify-end"><Button variant="secondary" onClick={saveCaptions}>Save captions</Button></div>

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
              <Button className="flex-1" onClick={schedule}>Schedule</Button>
              {v.posting_status === "scheduled" && <Button variant="secondary" onClick={markPosted}>Mark posted</Button>}
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
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Posts published" value={posted.length} accent="success" />
        <StatCard label="Platforms connected" value={platformsConnected} accent="primary" />
        <StatCard label="Avg posts / client" value={avgCompleted as unknown as number} />
        <StatCard label="Active clients" value={active.length} />
      </div>

      <Card className="sv-card-holo">
        <CardHeader><CardTitle className="text-base">Client overview</CardTitle></CardHeader>
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
                  const last = cv.filter((v) => v.posting_date).map((v) => v.posting_date!).sort().reverse()[0] ?? "—";
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
    </>
  );
}

// keep ExternalLink import-used to avoid linter complaints
void ExternalLink;
