import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { MissionProgress } from "@/types/mission";

export function PlayerProgressPanel({
  progress,
  compact = false,
}: {
  progress: MissionProgress;
  compact?: boolean;
}) {
  const completionPercent = Math.round((progress.completed / progress.total) * 100);
  const scorePercent = Math.min(progress.score, 100);

  return (
    <Panel className="p-3 sm:p-4">
      {!compact ? (
        <SectionHeader
          eyebrow="Operator Profile"
          title="Player Progress"
          description="Mission completion, score, and correct response tracking."
        />
      ) : null}
      <div className={compact ? "grid grid-cols-3 gap-3" : "mt-4 grid gap-3"}>
        <ProgressMeter label="Mission completion" value={completionPercent} detail={`${progress.completed}/${progress.total}`} />
        <ProgressMeter label="Score" value={scorePercent} detail={`${progress.score} pts`} />
        <ProgressMeter label="Correct answers" value={progress.correctAnswers * 100} detail={`${progress.correctAnswers}/${progress.total}`} />
      </div>
    </Panel>
  );
}

function ProgressMeter({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-xs text-slate-400">{detail}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.28)]"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-white to-amber-200 transition-[width] duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
