import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Synchronizing telemetry",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "loading-scan flex min-h-10 items-center gap-3 rounded-[var(--radius-control)] border border-cyan-300/18 bg-white/[0.035] px-3 py-2 text-sm text-slate-300",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(139,233,255,0.58)]" />
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}
