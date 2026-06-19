import type { OperationalState } from "@/types/mission";
import { cn } from "@/lib/utils";

const stateClasses: Record<OperationalState, string> = {
  nominal: "border-cyan-300/36 bg-cyan-300/10 text-cyan-100",
  watch: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  degraded: "border-amber-300/48 bg-amber-300/14 text-amber-100",
  critical: "border-red-400/48 bg-red-400/12 text-red-100",
};

export function StatusPill({
  state,
  label,
}: {
  state: OperationalState;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        stateClasses[state],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-[uplink-pulse_2.8s_ease-in-out_infinite]" />
      {label ?? state}
    </span>
  );
}
