import { StatusPill } from "@/components/ui/StatusPill";
import type { MissionPhase, MissionProgress } from "@/types/mission";

const phaseLabel: Record<MissionPhase, string> = {
  alert: "Alert",
  investigate: "Investigating",
  decision: "Decision",
  outcome: "Outcome",
};

export function TopStatusBar({
  phase,
  progress,
}: {
  phase: MissionPhase;
  progress: MissionProgress;
}) {
  return (
    <header className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line-soft)] pb-3 lg:grid-cols-[auto_1fr_auto]">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-cyan-300/28 bg-cyan-300/10 font-mono text-sm font-semibold text-cyan-100"
          aria-label="Uplink logo"
        >
          UP
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight text-white sm:text-xl">
            Uplink
          </h1>
          <p className="hidden truncate text-xs text-slate-400 sm:block">
            Satellite cybersecurity mission-control simulator
          </p>
        </div>
      </div>

      <div className="hidden min-w-0 items-center gap-2 lg:flex">
        <StatusPill state={phase === "outcome" ? "nominal" : "watch"} label={phaseLabel[phase]} />
        <span className="truncate font-mono text-xs uppercase tracking-[0.16em] text-slate-400">
          Aurora-7 / Telemetry Anomaly
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-right font-mono text-[0.68rem] uppercase tracking-[0.12em] text-slate-400">
        <div>
          <dt>Score</dt>
          <dd className="mt-0.5 text-sm text-white">{progress.score}</dd>
        </div>
        <div>
          <dt>Correct</dt>
          <dd className="mt-0.5 text-sm text-white">{progress.correctAnswers}</dd>
        </div>
        <div>
          <dt>Done</dt>
          <dd className="mt-0.5 text-sm text-white">
            {progress.completed}/{progress.total}
          </dd>
        </div>
      </dl>
    </header>
  );
}
