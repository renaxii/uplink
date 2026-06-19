import { MetricCard } from "@/components/ui/MetricCard";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EarthViewport } from "./EarthViewport";

export function EarthPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Panel tone="elevated" className="grid h-full min-h-0 gap-3 p-3 sm:p-4 lg:grid-rows-[auto_minmax(0,1fr)_auto]">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Orbital View"
          title="3D Earth Operations"
          description={
            compact
              ? undefined
              : "Live training view for satellite coverage, handoffs, and ground station links."
          }
          size={compact ? "md" : "lg"}
        />
        <LoadingState label="Sensor fusion stable" className="hidden sm:flex sm:min-w-56" />
      </div>
      <EarthViewport />
      <div className="grid shrink-0 gap-2 sm:grid-cols-3">
        <MetricCard label="Coverage" value="91%" detail="Active relay footprint" />
        <MetricCard label="Latency" value="42 ms" detail="Median command round trip" />
        <MetricCard label="Trust" value="86%" detail="Telemetry confidence score" />
      </div>
    </Panel>
  );
}
