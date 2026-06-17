import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/sv/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getClientBySlug, deriveStages, currentStageLabel } from "@/lib/mockData";
import { useVideos, updateVideo } from "@/lib/store";
import { StageTracker } from "@/components/sv/StageTracker";
import { QuotaRing } from "@/components/sv/QuotaRing";
import { PlatformIcon, PlatformList } from "@/components/sv/PlatformIcon";
import { PostingBadge } from "@/components/sv/StatusBadge";
import { ChevronDown, ChevronUp, ExternalLink, ThumbsUp, ThumbsDown, Pencil, CalendarDays, Eye, Heart, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "@/lib/types";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/client/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Socialvert Client Dashboard` }],
  }),
  loader: ({ params }) => {
    const client = getClientBySlug(params.slug);
    if (!client || !client.active) throw notFound();
    return { client };
  },
  component: ClientDashboard,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Client not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">That account doesn't exist in this demo.</p>
      </div>
    </div>
  ),
});

function ClientDashboard() {
  const { client } = Route.useLoaderData();
  const allVideos = useVideos();
  const videos = useMemo(() => allVideos.filter((v) => v.client_id === client.id), [allVideos, client.id]);

  const completed = videos.filter((v) => v.posting_status === "posted").length;
  const inProgress = videos.filter((v) => v.posting_status !== "posted" && v.idea_status === "complete").length;
  const remaining = Math.max(client.monthly_quota - completed - inProgress, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar label={client.name} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Quota header */}
        <Card className="sv-card-holo overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-10 sm:p-8">
            <QuotaRing total={client.monthly_quota} completed={completed} inProgress={inProgress} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">This month</div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{client.monthly_quota} videos</h1>
              <p className="mt-2 text-sm text-muted-foreground">Tracked across {client.platforms.length} platforms.</p>
              <div className="mt-5 grid grid-cols-3 gap-3 max-w-md mx-auto sm:mx-0">
                <Legend dotClass="bg-success" label="Completed" value={completed} />
                <Legend dotClass="bg-primary/40" label="In progress" value={inProgress} />
                <Legend dotClass="bg-muted" label="Remaining" value={remaining} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pipeline">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="library">Video library</TabsTrigger>
              <TabsTrigger value="captions">Captions</TabsTrigger>
              <TabsTrigger value="calendar">Schedule</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pipeline" className="mt-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {videos.map((v) => (
                <Card key={v.id} className="sv-card-holo">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{v.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Currently: <span className="font-medium text-foreground">{currentStageLabel(v)}</span></div>
                      </div>
                      <PostingBadge status={v.posting_status} />
                    </div>
                    <div className="mt-4"><StageTracker stages={deriveStages(v)} /></div>
                    <div className="mt-3"><PlatformList platforms={v.platform} /></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scripts" className="mt-6 space-y-3">
            {videos.map((v) => <ClientScriptRow key={v.id} v={v} />)}
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <Card key={v.id} className="sv-card-holo">
                  <CardContent className="p-4">
                    <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center text-primary/60">
                      <PlatformIcon platform={v.platform[0]} className="h-10 w-10" />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{v.title}</div>
                        <div className="mt-1"><PlatformList platforms={v.platform} className="h-3.5 w-3.5" /></div>
                      </div>
                      <PostingBadge status={v.posting_status} />
                    </div>
                    <div className="mt-4">
                      {v.video_link ? (
                        <Button asChild variant="secondary" className="w-full">
                          <a href={v.video_link} target="_blank" rel="noreferrer"><ExternalLink className="mr-1.5 h-4 w-4" /> View video</a>
                        </Button>
                      ) : (
                        <Button variant="secondary" className="w-full" disabled>Not yet available</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="captions" className="mt-6 space-y-3">
            {videos.filter((v) => v.caption_hook || v.caption_body).map((v) => <ClientCaptionCard key={v.id} v={v} />)}
            {videos.filter((v) => v.caption_hook || v.caption_body).length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No captions ready yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6"><ClientCalendar videos={videos} /></TabsContent>

          <TabsContent value="performance" className="mt-6"><ClientPerformance videos={videos} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Legend({ dotClass, label, value }: { dotClass: string; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ClientScriptRow({ v }: { v: Video }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<"up"|"down"|null>(null);

  function react(kind: "up"|"down") {
    setFeedback(kind);
    toast.success(kind === "up" ? "Approval sent to your team" : "Change request sent to your team");
  }

  return (
    <Card className="sv-card-holo">
      <CardContent className="p-4">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="font-medium truncate">{v.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {v.script_status === "complete" && v.script_delivery_date ? `Delivered ${v.script_delivery_date}` :
                v.script_eta ? `Expected ${v.script_eta}` : "Awaiting drafting"}
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {open && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            {v.script_content ? (
              <pre className="whitespace-pre-wrap rounded-lg bg-accent/40 p-4 font-sans text-sm leading-relaxed text-foreground">{v.script_content}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Script not yet available.</p>
            )}
            {v.script_status === "complete" && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant={feedback === "up" ? "default" : "secondary"} onClick={() => react("up")}><ThumbsUp className="mr-1.5 h-3.5 w-3.5" /> Approve</Button>
                <Button size="sm" variant={feedback === "down" ? "default" : "secondary"} onClick={() => react("down")}><ThumbsDown className="mr-1.5 h-3.5 w-3.5" /> Request changes</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EditableField({ label, value, multiline, onSave }: { label: string; value: string; multiline?: boolean; onSave: (v: string) => void }) {
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
            <Button size="sm" onClick={() => { onSave(val); setEditing(false); toast.success("Saved"); }}>Save</Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 text-sm whitespace-pre-wrap">{value || <span className="text-muted-foreground italic">Empty</span>}</div>
      )}
    </div>
  );
}

function ClientCaptionCard({ v }: { v: Video }) {
  return (
    <Card className="sv-card-holo">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold">{v.title}</div>
            <div className="mt-1"><PlatformList platforms={v.platform} className="h-3.5 w-3.5" /></div>
          </div>
          <PostingBadge status={v.posting_status} />
        </div>
        <EditableField label="Hook" value={v.caption_hook} onSave={(val) => updateVideo(v.id, { caption_hook: val })} />
        <EditableField label="Body" value={v.caption_body} multiline onSave={(val) => updateVideo(v.id, { caption_body: val })} />
        <EditableField label="CTA" value={v.caption_cta} onSave={(val) => updateVideo(v.id, { caption_cta: val })} />
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hashtags</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {v.caption_hashtags.length ? v.caption_hashtags.map((t, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{t}</span>
            )) : <span className="text-sm text-muted-foreground italic">None</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientCalendar({ videos }: { videos: Video[] }) {
  const [view, setView] = useState<"calendar"|"list">("calendar");
  const scheduled = videos.filter((v) => v.posting_date);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Content schedule</h3>
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button size="sm" variant={view === "calendar" ? "secondary" : "ghost"} onClick={() => setView("calendar")}>Calendar</Button>
          <Button size="sm" variant={view === "list" ? "secondary" : "ghost"} onClick={() => setView("list")}>List</Button>
        </div>
      </div>

      {view === "calendar" ? <MonthGrid scheduled={scheduled} /> : <ScheduleList scheduled={scheduled} />}
    </div>
  );
}

function MonthGrid({ scheduled }: { scheduled: Video[] }) {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = new Map<string, Video[]>();
  scheduled.forEach((v) => {
    if (!v.posting_date) return;
    const arr = byDay.get(v.posting_date) ?? [];
    arr.push(v);
    byDay.set(v.posting_date, arr);
  });

  const monthName = first.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <Card className="sv-card-holo">
      <CardHeader className="pb-3"><CardTitle className="text-base">{monthName}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="py-1">{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="aspect-square" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const items = byDay.get(dateStr) ?? [];
            const isToday = d === now.getDate();
            return (
              <div key={i} className={`aspect-square rounded-md border p-1 text-left text-[11px] ${isToday ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="font-medium">{d}</div>
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {items.slice(0, 3).map((v) => (
                    <span key={v.id}
                      className={`h-1.5 w-1.5 rounded-full ${v.posting_status === "posted" ? "bg-success" : "bg-primary"}`}
                      title={v.title} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleList({ scheduled }: { scheduled: Video[] }) {
  return (
    <Card className="sv-card-holo">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-left">Video</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {scheduled.sort((a, b) => (a.posting_date! < b.posting_date! ? -1 : 1)).map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 tabular-nums">{v.posting_date}</td>
                  <td className="px-4 py-3">{v.posting_platform && <PlatformIcon platform={v.posting_platform} />}</td>
                  <td className="px-4 py-3 font-medium">{v.title}</td>
                  <td className="px-4 py-3"><PostingBadge status={v.posting_status} /></td>
                  <td className="px-4 py-3 text-right"><RescheduleButton v={v} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RescheduleButton({ v }: { v: Video }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(v.posting_date ?? "");
  function submit() {
    toast.success("Schedule updated — request sent to your content team");
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="ghost">Reschedule</Button></DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reschedule "{v.title}"</DialogTitle></DialogHeader>
        <div className="py-2 space-y-1.5"><Label>New date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  const chartData = posted.slice(-6).map((v) => ({ name: v.title.length > 14 ? v.title.slice(0, 14) + "…" : v.title, views: v.views }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PerfCard icon={<Eye className="h-4 w-4" />} label="Total views" value={totalViews.toLocaleString()} />
        <PerfCard icon={<Heart className="h-4 w-4" />} label="Engagement" value={totalEng.toLocaleString()} />
        <PerfCard icon={<TrendingUp className="h-4 w-4" />} label="Best platform" value={bestPlatform ? (bestPlatform === "google" ? "Google Biz" : bestPlatform.charAt(0).toUpperCase() + bestPlatform.slice(1)) : "—"} />
        <PerfCard icon={<Trophy className="h-4 w-4" />} label="Top post" value={top ? `${top.views.toLocaleString()} views` : "—"} sub={top?.title} />
      </div>

      <Card className="sv-card-holo">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Views by recent post</CardTitle>
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
        <CardHeader><CardTitle className="text-base">Top 3 posts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {top3.length === 0 && <p className="text-sm text-muted-foreground">No posted content yet.</p>}
          {top3.map((v, i) => (
            <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
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
    <Card className="sv-card-holo">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
        <div className="mt-1.5 text-xl font-semibold tabular-nums truncate">{value}</div>
        {sub && <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
