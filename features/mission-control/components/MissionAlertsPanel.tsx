import { AlertCard } from "@/components/ui/AlertCard";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { MissionAlert, MissionChoice } from "@/types/mission";

export function MissionAlertsPanel({
  alerts,
  selectedChoice,
}: {
  alerts: MissionAlert[];
  selectedChoice?: MissionChoice | null;
}) {
  return (
    <Panel className="flex min-h-0 flex-col p-3 sm:p-4">
      <SectionHeader
        eyebrow="Alerts"
        title="Mission Signals"
        description="Prioritized operational events with security context."
      />
      <div className="panel-scroll mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
        {selectedChoice ? (
          <div
            className="rounded-[var(--radius-card)] border border-cyan-300/22 bg-cyan-300/[0.045] p-3 text-sm leading-6 text-slate-200"
            role="status"
          >
            Last action: {selectedChoice.label}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
