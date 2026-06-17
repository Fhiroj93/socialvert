import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/sv/Logo";
import { ThemeToggle } from "@/components/sv/ThemeToggle";
import { LayoutDashboard, Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Socialvert — Welcome" },
      { name: "description", content: "Manager and client access to your Socialvert content dashboard." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.55_0.22_264_/_0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.55_0.22_264_/_0.25),transparent)]" />

      <div className="absolute right-4 top-4"><ThemeToggle /></div>

      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 sv-float"><Logo size="lg" /></div>

        <h1 className="text-center text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl sv-fade-up">
          Welcome to your <span className="sv-gradient-text">Content Dashboard</span>
        </h1>
        <p className="mt-4 max-w-xl text-center text-base text-muted-foreground sv-fade-up" style={{ animationDelay: "0.15s" }}>
          Choose how you'd like to access the platform today.
        </p>

        <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sv-stagger">
          <Link to="/manager-login" className="group sv-card-holo rounded-2xl p-7 text-left">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary sv-pulse-glow">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Manager</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Internal team access to all client pipelines, scripts, and scheduling.</p>
            <div className="mt-6 flex items-center text-sm font-medium text-primary">
              Continue <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link to="/client-login" className="group sv-card-holo rounded-2xl p-7 text-left">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary sv-pulse-glow">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Client</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">View your content pipeline, captions, schedule, and performance.</p>
            <div className="mt-6 flex items-center text-sm font-medium text-primary">
              Continue <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">© {new Date().getFullYear()} Socialvert — demo environment</p>
      </main>
    </div>
  );
}
