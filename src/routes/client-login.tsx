import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/sv/Logo";
import { ThemeToggle } from "@/components/sv/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, ArrowRight } from "lucide-react";
import { getActiveClients } from "@/lib/mockData";
import { PlatformList } from "@/components/sv/PlatformIcon";

export const Route = createFileRoute("/client-login")({
  head: () => ({ meta: [{ title: "Client Sign in — Socialvert" }] }),
  component: ClientLogin,
});

function ClientLogin() {
  const navigate = useNavigate();
  const list = getActiveClients();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="absolute left-4 top-4">
        <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Link></Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col items-center pt-6">
          <Logo size="md" />
          <h1 className="mt-8 text-center text-3xl font-bold tracking-tight">Select your account</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Tap your business to access your content dashboard.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ to: "/client/$slug", params: { slug: c.slug } })}
              className="sv-card-holo group rounded-2xl p-6 text-left"
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold leading-tight">{c.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{c.monthly_quota} videos / month</p>
              <div className="mt-4 flex items-center justify-between">
                <PlatformList platforms={c.platforms} />
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
