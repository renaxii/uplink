"use client";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { MissionChoice, MissionPhase, TrainingMission } from "@/types/mission";

export function MissionPlayPanel({
  mission,
  phase,
  selectedChoice,
  onInvestigate,
  onChoose,
  onReset,
}: {
  mission: TrainingMission;
  phase: MissionPhase;
  selectedChoice: MissionChoice | null;
  onInvestigate: () => void;
  onChoose: (choice: MissionChoice) => void;
  onReset: () => void;
}) {
  const isOutcome = phase === "outcome";

  return (
    <Panel tone="elevated" className="flex min-h-0 flex-col p-3 sm:p-4">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <SectionHeader
          eyebrow="Active Mission"
          title={mission.title}
          description={mission.scenario}
        />
        <span className="rounded-full border border-amber-300/34 bg-amber-300/10 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-amber-100">
          Watch
        </span>
      </div>

      <div className="panel-scroll mt-3 min-h-0 flex-1 overflow-auto pr-1">
        <section
          aria-labelledby="mission-alert-title"
          className="rounded-[var(--radius-card)] border border-amber-300/28 bg-amber-300/[0.06] p-3"
        >
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-amber-100">
            Alert
          </p>
          <h3 id="mission-alert-title" className="mt-1 font-semibold text-white">
            Sudden position shift reported
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-200/88">
            {mission.alertSummary}
          </p>
        </section>

        <section className="mt-3" aria-labelledby="investigation-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="investigation-title" className="text-sm font-semibold text-white">
              Investigation
            </h3>
            {phase === "alert" ? (
              <Button variant="secondary" onClick={onInvestigate} className="min-h-9 px-3 py-1.5">
                Investigate
              </Button>
            ) : null}
          </div>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
            {(phase === "alert" ? mission.investigation.slice(0, 1) : mission.investigation).map(
              (item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" />
                  <span>{item}</span>
                </li>
              ),
            )}
          </ul>
        </section>

        <section className="mt-3" aria-labelledby="choices-title">
          <h3 id="choices-title" className="text-sm font-semibold text-white">
            Player action choices
          </h3>
          <div className="mt-2 grid gap-2">
            {mission.choices.map((choice) => {
              const isSelected = selectedChoice?.id === choice.id;

              return (
                <Button
                  key={choice.id}
                  variant={isSelected ? (choice.isCorrect ? "primary" : "warning") : "quiet"}
                  disabled={phase === "alert" || isOutcome}
                  aria-pressed={isSelected}
                  onClick={() => onChoose(choice)}
                  className="justify-start text-left"
                >
                  {choice.label}
                </Button>
              );
            })}
          </div>
        </section>

        <section
          className="mt-3 rounded-[var(--radius-card)] border border-cyan-300/18 bg-cyan-300/[0.045] p-3"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3 className="text-sm font-semibold text-white">Outcome and explanation</h3>
          {isOutcome && selectedChoice ? (
            <div className="mt-2 space-y-2 text-sm leading-6 text-slate-200/88">
              <p>
                <span className="font-semibold text-white">
                  {selectedChoice.isCorrect ? "Safe response:" : "Risk found:"}
                </span>{" "}
                {selectedChoice.response}
              </p>
              <p>{mission.explanation}</p>
              <Button variant="secondary" onClick={onReset} className="mt-1">
                Run mission again
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Investigate the alert, choose a response, then review the lesson.
            </p>
          )}
        </section>
      </div>
    </Panel>
  );
}
