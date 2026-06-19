"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { AppChrome } from "@/components/layout/AppChrome";
import { telemetryAnomalyMission } from "@/features/mission-control/data/mission-control";
import {
  CELESTRAK_STATIONS_URL,
  useRealSatellites,
} from "@/features/mission-control/hooks/useRealSatellites";
import type { MissionChoice, MissionPhase, MissionProgress } from "@/types/mission";
import { EarthViewport } from "./EarthViewport";

type InvestigationTool = "terminal" | "telemetry" | "signal" | "command";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const phaseCopy: Record<MissionPhase, string> = {
  alert: "Live incident",
  investigate: "Evidence unlocked",
  decision: "Choose response",
  outcome: "Outcome",
};

export function MissionDashboard() {
  const [phase, setPhase] = useState<MissionPhase>("alert");
  const [selectedChoice, setSelectedChoice] = useState<MissionChoice | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [activeTool, setActiveTool] = useState<InvestigationTool | null>(null);
  const [showSources, setShowSources] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const satelliteData = useRealSatellites();

  const progress = useMemo<MissionProgress>(
    () => ({
      completed: completed ? 1 : 0,
      total: 1,
      score,
      correctAnswers,
    }),
    [completed, correctAnswers, score],
  );

  const playTone = (kind: "alert" | "confirm" | "warn") => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const audioWindow = window as AudioWindow;
    const AudioCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioCtor) {
      return;
    }

    const context = audioContextRef.current ?? new AudioCtor();
    audioContextRef.current = context;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency = kind === "confirm" ? 720 : kind === "warn" ? 220 : 440;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.18, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.18);
  };

  const handleInvestigate = () => {
    setPhase("investigate");
    setActiveTool("telemetry");
    playTone("alert");
  };

  const handleChoose = (choice: MissionChoice) => {
    if (phase === "outcome") {
      return;
    }

    setSelectedChoice(choice);
    setPhase("outcome");
    setCompleted(true);
    setScore(choice.isCorrect ? 100 : 25);
    setCorrectAnswers(choice.isCorrect ? 1 : 0);
    playTone(choice.isCorrect ? "confirm" : "warn");
  };

  const handleReset = () => {
    setPhase("alert");
    setSelectedChoice(null);
    setCompleted(false);
    setScore(0);
    setCorrectAnswers(0);
    playTone("alert");
  };

  return (
    <AppChrome>
      <div className="relative h-full min-h-0 overflow-hidden bg-[#020817]">
        <EarthViewport className="absolute inset-0 min-h-0" satellites={satelliteData.satellites} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0,rgba(2,8,23,0.16)_40%,rgba(2,8,23,0.74)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020817]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-[#020817]/88 to-transparent" />

        <header className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-3 sm:left-5 sm:right-5 sm:top-5">
          <div aria-hidden="true" className="pointer-events-none" />
          <FloatingPanel
            title="Network Watch"
            initialStyle={{ right: 20, top: 20, width: 340, height: 160 }}
            minimizedStyle={{ right: 20, top: 20 }}
            className="pointer-events-auto"
          >
          <NetworkWatch
            phase={phase}
            count={satelliteData.satellites.length}
            status={satelliteData.status}
            message={satelliteData.message}
            updatedAt={satelliteData.updatedAt}
            showSources={showSources}
            onToggleSources={() => setShowSources((current) => !current)}
          />
          </FloatingPanel>
        </header>

        <ToolDock activeTool={activeTool} onSelectTool={setActiveTool} />

        {activeTool ? (
          <FloatingPanel
            title={toolLabel(activeTool)}
            initialStyle={{ right: 116, top: 100, width: 360, height: 360 }}
            minimizedStyle={{ right: 116, bottom: 20 }}
            canClose
            onClose={() => setActiveTool(null)}
          >
            <ToolOverlay
              tool={activeTool}
              phase={phase}
              selectedChoice={selectedChoice}
              dataStatus={satelliteData.status}
              satellites={satelliteData.satellites}
              onClose={() => setActiveTool(null)}
            />
          </FloatingPanel>
        ) : null}

        <FloatingPanel
          title="Mission"
          initialStyle={{ left: 20, bottom: 20, width: 390, height: 420 }}
          minimizedStyle={{ left: 20, bottom: 20 }}
          bodyClassName="panel-scroll h-full min-h-0 overflow-auto p-3 sm:p-4"
        >
        <section aria-labelledby="mission-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-amber-100">
                {phaseCopy[phase]}
              </p>
              <h2
                id="mission-title"
                className="font-display mt-1 text-[1.7rem] font-semibold leading-none text-white"
              >
                {telemetryAnomalyMission.title}
              </h2>
            </div>
            <ScoreChip progress={progress} />
          </div>

          <div className="mt-3 rounded-[10px] border border-amber-200/24 bg-amber-200/[0.07] p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-200 motion-safe:animate-[uplink-pulse_1.5s_ease-in-out_infinite]" />
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-amber-100">
                Aurora-7 position anomaly
              </p>
            </div>
              <p className="mt-2 text-sm leading-6 text-slate-100/90">
              {telemetryAnomalyMission.scenario} {telemetryAnomalyMission.alertSummary}
            </p>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Evidence</h3>
              {phase === "alert" ? (
                <button type="button" onClick={handleInvestigate} className="action-button action-button-primary">
                  Open telemetry inspector
                </button>
              ) : null}
            </div>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-200/86">
              {(phase === "alert"
                ? telemetryAnomalyMission.investigation.slice(0, 1)
                : telemetryAnomalyMission.investigation
              ).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {phase !== "alert" ? (
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-white">Choose response</h3>
              <div className="mt-2 grid gap-2">
                {telemetryAnomalyMission.choices.map((choice) => {
                  const isSelected = selectedChoice?.id === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleChoose(choice)}
                      disabled={phase === "outcome"}
                      aria-pressed={isSelected}
                      className="action-button justify-start text-left disabled:cursor-not-allowed disabled:opacity-70 aria-pressed:border-white/60 aria-pressed:bg-white/14"
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {phase === "outcome" && selectedChoice ? (
            <div
              className="mt-3 rounded-[10px] border border-cyan-200/24 bg-cyan-200/[0.07] p-3"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan-100">
                {selectedChoice.isCorrect ? "Mission stabilized" : "Consequence logged"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-100/90">
                <span className="font-semibold text-white">
                  {selectedChoice.isCorrect ? "Safe response:" : "Risk found:"}
                </span>{" "}
                {selectedChoice.response}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200/82">
                {telemetryAnomalyMission.explanation}
              </p>
              <button type="button" onClick={handleReset} className="action-button mt-3">
                Replay incident
              </button>
            </div>
          ) : null}
        </section>
        </FloatingPanel>
      </div>
    </AppChrome>
  );
}

function NetworkWatch({
  phase,
  count,
  status,
  message,
  updatedAt,
  showSources,
  onToggleSources,
}: {
  phase: MissionPhase;
  count: number;
  status: "loading" | "ready" | "fallback";
  message: string;
  updatedAt: string | null;
  showSources: boolean;
  onToggleSources: () => void;
}) {
  const isOutcome = phase === "outcome";

  return (
    <aside className="flex h-full min-h-0 flex-col text-left" aria-label="Network Watch">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isOutcome ? "bg-cyan-200" : "bg-amber-200"
              } motion-safe:animate-[uplink-pulse_1.8s_ease-in-out_infinite]`}
            />
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-white">
              {isOutcome ? "Stable" : "Watch"}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {count > 0 ? `${count} real objects` : "Earth-only fallback"}
          </p>
        </div>
        <button
          type="button"
          className="source-button"
          style={{ minHeight: 44 }}
          aria-expanded={showSources}
          onClick={onToggleSources}
        >
          Data sources
        </button>
      </div>

      {showSources ? (
        <div className="panel-scroll mt-3 min-h-0 flex-1 overflow-auto rounded-[12px] border border-cyan-200/18 bg-[#031024]/70 p-3 text-left">
          <p className="text-sm leading-5 text-slate-200">{message}</p>
          <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-slate-400">
            CelesTrak current NORAD GP, stations group
            {status === "ready" && updatedAt ? ` / Epoch ${updatedAt}` : ""}
          </p>
          <a
            href={CELESTRAK_STATIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-sm font-semibold text-cyan-100 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          >
            View source <span aria-hidden="true" className="ml-1">↗</span>
          </a>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            The orbit tracks are real public data. The cybersecurity incident is a fictional training scenario.
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function ScoreChip({ progress }: { progress: MissionProgress }) {
  return (
    <div className="score-orb" aria-label={`Score ${progress.score} out of 100`}>
      <p className="font-mono text-[0.56rem] uppercase tracking-[0.11em] text-slate-300">
        Score
      </p>
      <p className="font-mono text-base font-semibold leading-none text-white">
        {progress.score}
      </p>
    </div>
  );
}

function ToolDock({
  activeTool,
  onSelectTool,
}: {
  activeTool: InvestigationTool | null;
  onSelectTool: (tool: InvestigationTool | null) => void;
}) {
  const tools: Array<{ id: InvestigationTool; label: string }> = [
    { id: "terminal", label: "Terminal" },
    { id: "telemetry", label: "Telemetry" },
    { id: "signal", label: "Signal Trace" },
    { id: "command", label: "Command Review" },
  ];

  return (
    <nav className="module-strip" aria-label="Investigation tools">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className="module-button"
          aria-pressed={activeTool === tool.id}
          onClick={() => onSelectTool(activeTool === tool.id ? null : tool.id)}
        >
          {tool.id === "command" ? "Command" : tool.label}
        </button>
      ))}
    </nav>
  );
}

function ToolOverlay({
  tool,
  phase,
  selectedChoice,
  dataStatus,
  satellites,
  onClose,
}: {
  tool: InvestigationTool;
  phase: MissionPhase;
  selectedChoice: MissionChoice | null;
  dataStatus: "loading" | "ready" | "fallback";
  satellites: Array<{ name: string; catalogId: string; epoch: string | null }>;
  onClose: () => void;
}) {
  return (
    <aside
      className="panel-scroll max-h-[calc(46dvh-1rem)] overflow-auto p-3 sm:p-4 md:max-h-[calc(100dvh-7rem)]"
      aria-label={`${toolLabel(tool)} tool`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-100">
            Investigation tool
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">{toolLabel(tool)}</h2>
        </div>
        <button type="button" className="source-button" style={{ minHeight: 44 }} onClick={onClose}>
          Close
        </button>
      </div>

      <div className="mt-3">{toolContent(tool, phase, selectedChoice, dataStatus, satellites)}</div>
    </aside>
  );
}

function FloatingPanel({
  title,
  children,
  initialStyle,
  minimizedStyle,
  bodyClassName = "p-3",
  className,
  canClose = false,
  onClose,
}: {
  title: string;
  children: ReactNode;
  initialStyle: CSSProperties;
  minimizedStyle: CSSProperties;
  bodyClassName?: string;
  className?: string;
  canClose?: boolean;
  onClose?: () => void;
}) {
  const [mode, setMode] = useState<"normal" | "minimized" | "maximized">("normal");
  const [frame, setFrame] = useState(() => normalizeFrame(initialStyle));
  const frameRef = useRef(frame);
  const rafRef = useRef<number | null>(null);
  const interactionRef = useRef<
    | {
        kind: "drag";
        pointerId: number;
        dx: number;
        dy: number;
        next: PanelFrame;
      }
    | {
        kind: "resize";
        pointerId: number;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
        next: PanelFrame;
      }
    | null
  >(null);

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLButtonElement) {
      return;
    }

    if (mode !== "normal") {
      return;
    }

    const panel = event.currentTarget.closest<HTMLElement>("[data-floating-panel]");
    if (!panel) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    document.body.classList.add("is-window-dragging");
    interactionRef.current = {
      kind: "drag",
      pointerId: event.pointerId,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      next: frameRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.kind !== "drag" || mode !== "normal") {
      return;
    }

    const next = clampFrame({
      ...frameRef.current,
      left: event.clientX - interaction.dx,
      top: event.clientY - interaction.dy,
    });
    interaction.next = next;
    scheduleFrame(next, frameRef, setFrame, rafRef);
  };

  const endDrag = () => {
    interactionRef.current = null;
    document.body.classList.remove("is-window-dragging");
  };

  if (mode === "minimized") {
    return (
      <button
        type="button"
        className={`window-tab ${className ?? ""}`}
        style={minimizedStyle}
        onClick={() => setMode("normal")}
      >
        {title}
      </button>
    );
  }

  const style = {
    left: frame.left,
    top: frame.top,
    width: frame.width,
    height: frame.height,
  };

  const beginResize = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    document.body.classList.add("is-window-dragging");
    interactionRef.current = {
      kind: "resize",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: frameRef.current.width,
      startHeight: frameRef.current.height,
      next: frameRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: PointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.kind !== "resize") {
      return;
    }

    const next = clampFrame({
      ...frameRef.current,
      width: interaction.startWidth + (event.clientX - interaction.startX),
      height: interaction.startHeight + (event.clientY - interaction.startY),
    });
    interaction.next = next;
    scheduleFrame(next, frameRef, setFrame, rafRef);
  };

  return (
    <section
      data-floating-panel
      className={`game-window ${mode === "maximized" ? "game-window-maximized" : ""} ${className ?? ""}`}
      style={style}
      aria-label={`${title} window`}
    >
      <div
        className="window-titlebar"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-100">{title}</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="window-control"
            aria-label={`Minimize ${title}`}
            onClick={() => setMode("minimized")}
          >
            -
          </button>
          {canClose ? (
            <button type="button" className="window-control window-control-close" aria-label={`Close ${title}`} onClick={onClose}>
              x
            </button>
          ) : null}
        </div>
      </div>
      <div className={bodyClassName}>{children}</div>
      <div
        className="window-resize-handle"
        aria-hidden="true"
        onPointerDown={beginResize}
        onPointerMove={moveResize}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </section>
  );
}

type PanelFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function normalizeFrame(style: CSSProperties): PanelFrame {
  const viewport = getViewport();
  const width = typeof style.width === "number" ? style.width : 360;
  const height = typeof style.height === "number" ? style.height : 300;
  const left =
    typeof style.left === "number"
      ? style.left
      : typeof style.right === "number"
        ? viewport.width - width - style.right
        : 20;
  const top =
    typeof style.top === "number"
      ? style.top
      : typeof style.bottom === "number"
        ? viewport.height - height - style.bottom
        : 20;

  return clampFrame({ left, top, width, height });
}

function clampFrame(frame: PanelFrame): PanelFrame {
  const viewport = getViewport();
  const margin = 8;
  const width = Math.max(260, Math.min(frame.width, viewport.width - margin * 2));
  const height = Math.max(150, Math.min(frame.height, viewport.height - margin * 2));
  return {
    width,
    height,
    left: Math.max(margin, Math.min(viewport.width - width - margin, frame.left)),
    top: Math.max(margin, Math.min(viewport.height - height - margin, frame.top)),
  };
}

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1440, height: 900 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function scheduleFrame(
  next: PanelFrame,
  frameRef: { current: PanelFrame },
  setFrame: (frame: PanelFrame) => void,
  rafRef: { current: number | null },
) {
  frameRef.current = next;
  if (rafRef.current !== null) {
    return;
  }

  rafRef.current = requestAnimationFrame(() => {
    rafRef.current = null;
    setFrame(frameRef.current);
  });
}

function toolLabel(tool: InvestigationTool) {
  return {
    terminal: "Terminal",
    telemetry: "Telemetry Inspector",
    signal: "Signal Trace",
    command: "Command Review",
  }[tool];
}

function toolContent(
  tool: InvestigationTool,
  phase: MissionPhase,
  selectedChoice: MissionChoice | null,
  dataStatus: "loading" | "ready" | "fallback",
  satellites: Array<{ name: string; catalogId: string; epoch: string | null }>,
) {
  if (tool === "terminal") {
    return (
      <div className="rounded-[10px] border border-cyan-200/16 bg-black/28 p-3 font-mono text-xs leading-6 text-cyan-50">
        <p>$ uplink incident inspect --target training</p>
        <p>scenario: training telemetry anomaly</p>
        <p>orbit-data: {dataStatus === "ready" ? "celestrak-gp-loaded" : dataStatus}</p>
        <p>operator-phase: {phase}</p>
      </div>
    );
  }

  if (tool === "telemetry") {
    return (
      <div className="space-y-3 text-sm leading-6 text-slate-200">
        <p>
          The reported position shift conflicts with independent tracking. A safe operator response is to compare
          primary telemetry against backup sensors before issuing commands.
        </p>
        <DataRows
          rows={[
            ["Primary feed", "Position delta flagged"],
            ["Backup sensors", phase === "alert" ? "Not checked" : "Ready for comparison"],
            ["Lesson", "Validate integrity before action"],
          ]}
        />
      </div>
    );
  }

  if (tool === "signal") {
    return (
      <div className="space-y-3 text-sm leading-6 text-slate-200">
        <p>Real-world orbit display is sourced separately from the fictional security scenario.</p>
        <DataRows
          rows={[
            ["Data state", dataStatus],
            ["Objects shown", satellites.length ? String(satellites.length) : "0"],
            ["First object", satellites[0] ? `${satellites[0].name} / ${satellites[0].catalogId}` : "Unavailable"],
            ["Epoch", satellites[0]?.epoch ?? "Unavailable"],
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm leading-6 text-slate-200">
      <p>
        Command review checks whether an action changes spacecraft state before the evidence is trusted.
      </p>
      <DataRows
        rows={[
          ["Selected action", selectedChoice?.label ?? "None"],
          ["Risk", selectedChoice?.isCorrect === false ? "Unsafe command path" : "Awaiting decision"],
          ["Safe principle", "Verify independent data before control actions"],
        ]}
      />
    </div>
  );
}

function DataRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-[10px] border border-white/10 bg-white/[0.035] p-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</dt>
          <dd className="mt-1 font-mono text-xs text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
