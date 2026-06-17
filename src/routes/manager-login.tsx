import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/sv/Logo";
import { ThemeToggle } from "@/components/sv/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound } from "lucide-react";
import { DEMO_MANAGER_PASSCODE } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/manager-login")({
  head: () => ({ meta: [{ title: "Manager Sign in — Socialvert" }] }),
  component: ManagerLogin,
});

function ManagerLogin() {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      if (pass === DEMO_MANAGER_PASSCODE) {
        navigate({ to: "/manager" });
      } else {
        toast.error("Incorrect passcode", { description: `Demo passcode: ${DEMO_MANAGER_PASSCODE}` });
        setSubmitting(false);
      }
    }, 250);
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="absolute left-4 top-4">
        <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Link></Button>
      </div>

      <form onSubmit={onSubmit} className="sv-card-holo w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex justify-center"><Logo size="md" /></div>
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mx-auto">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-center text-2xl font-semibold tracking-tight">Manager access</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Enter your team passcode to continue.</p>

        <div className="mt-7 space-y-2">
          <Label htmlFor="passcode">Passcode</Label>
          <Input id="passcode" type="password" autoFocus value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          <p className="text-[11px] text-muted-foreground">Demo: <code className="font-mono">{DEMO_MANAGER_PASSCODE}</code></p>
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={submitting || !pass}>
          {submitting ? "Verifying…" : "Enter dashboard"}
        </Button>
      </form>
    </div>
  );
}
