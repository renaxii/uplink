import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import type { SatelliteNode } from "@/types/mission";

export function NetworkStatusPanel({ nodes }: { nodes: SatelliteNode[] }) {
  return (
    <Panel className="flex min-h-0 flex-col p-3 sm:p-4">
      <SectionHeader
        eyebrow="Network"
        title="Satellite Status"
        description="Compact health checks for mission assets."
      />
      <div className="panel-scroll mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {nodes.map((node) => (
          <article
            key={node.id}
            className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.035] p-3 transition duration-200 hover:border-cyan-300/24 hover:bg-white/[0.055]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-white">{node.name}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {node.orbit} / {node.region}
                </p>
              </div>
              <StatusPill state={node.state} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-400">Signal integrity</p>
                <p className="font-mono text-cyan-100">{node.signalIntegrity}%</p>
              </div>
              <div>
                <p className="text-slate-400">Latency</p>
                <p className="font-mono text-white">{node.latencyMs} ms</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
