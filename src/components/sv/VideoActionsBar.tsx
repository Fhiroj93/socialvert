import { useState } from "react";
import { Check, MessageSquare, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "./ActionButton";
import { updateVideo } from "@/lib/liveStore";
import { toast } from "sonner";
import type { Video } from "@/lib/types";

export function VideoActionsBar({ v, onEdit }: { v: Video; onEdit?: () => void }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState(v.client_feedback ?? "");

  async function approve() {
    await updateVideo(v.id, { client_approval_status: "approved", client_feedback: null });
    toast.success("Approval sent to your team");
  }
  async function sendChanges() {
    if (!feedback.trim()) {
      toast.error("Add a short note so the team knows what to change");
      return;
    }
    await updateVideo(v.id, { client_approval_status: "changes_requested", client_feedback: feedback.trim() });
    toast.success("Change request sent");
    setFeedbackOpen(false);
  }

  const approved = v.client_approval_status === "approved";
  const requested = v.client_approval_status === "changes_requested";

  return (
    <div className="mt-3 space-y-2">
      {approved && (
        <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
          <Check className="mr-1 h-3 w-3" /> You approved this
        </Badge>
      )}
      {requested && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-2 text-xs">
          <div className="font-semibold text-warning-foreground">Changes requested</div>
          {v.client_feedback && <div className="mt-1 text-muted-foreground whitespace-pre-wrap">"{v.client_feedback}"</div>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <ActionButton
          onAction={approve}
          variant={approved ? "secondary" : "default"}
          successLabel="Approved"
          icon={<Check className="mr-1.5 h-3.5 w-3.5" />}
          className={approved ? "" : "bg-success text-success-foreground hover:bg-success/90"}
        >
          Approve
        </ActionButton>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setFeedbackOpen((o) => !o)}
          className="transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Request changes
        </Button>
        {onEdit && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      {feedbackOpen && (
        <div className="space-y-2 rounded-lg border border-border bg-card/50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <Textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell the team what to adjust…"
          />
          <div className="flex justify-end gap-1.5">
            <Button type="button" size="sm" variant="ghost" onClick={() => setFeedbackOpen(false)}>
              <X className="mr-1 h-3.5 w-3.5" /> Cancel
            </Button>
            <ActionButton onAction={sendChanges} successLabel="Sent">Send feedback</ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
