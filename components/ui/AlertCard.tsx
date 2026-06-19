import { cn } from "@/lib/utils";
import type { MissionAlert } from "@/types/mission";

const severityClasses: Record<MissionAlert["severity"], string> = {
  info: "border-cyan-300/22 bg-cyan-300/[0.045] text-cyan-100",
  low: "border-cyan-300/18 bg-white/[0.035] text-slate-100",
  medium: "border-amber-300/35 bg-amber-300/[0.07] text-amber-100",
  high: "border-red-400/38 bg-red-400/[0.07] text-red-100",
};

const severityLabels: Record<MissionAlert["severity"], string> = {
  info: "Info",
  low: "Advisory",
  medium: "Watch",
  high: "Action",
};

export function AlertCard({ alert }: { alert: MissionAlert }) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-card)] border p-3 transition duration-200 hover:translate-y-[-1px] hover:border-cyan-300/36",
        severityClasses[alert.severity],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] opacity-75">
            {severityLabels[alert.severity]}
          </p>
          <h3 className="mt-1 font-semibold text-white">{alert.title}</h3>
        </div>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
          {alert.timestamp}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{alert.source}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200/88">{alert.summary}</p>
      <p className="mt-3 border-t border-white/10 pt-2 font-mono text-xs text-cyan-100/86">
        {alert.concept}
      </p>
    </article>
  );
}
