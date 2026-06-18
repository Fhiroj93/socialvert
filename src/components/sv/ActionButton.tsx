import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

export function ActionButton({
  children,
  onAction,
  variant = "default",
  size = "sm",
  className,
  successLabel = "Done",
  icon,
  disabled,
}: {
  children: ReactNode;
  onAction: () => Promise<unknown> | unknown;
  variant?: Variant;
  size?: Size;
  className?: string;
  successLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  async function run() {
    if (state !== "idle") return;
    setState("loading");
    try {
      await onAction();
      setState("success");
      setTimeout(() => setState("idle"), 1300);
    } catch {
      setState("idle");
    }
  }

  return (
    <Button
      type="button"
      onClick={run}
      variant={variant}
      size={size}
      disabled={disabled || state === "loading"}
      className={cn("transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]", className)}
    >
      {state === "loading" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {state === "success" && <Check className="mr-1.5 h-3.5 w-3.5 text-success" />}
      {state === "idle" && icon}
      <span>{state === "success" ? successLabel : children}</span>
    </Button>
  );
}
