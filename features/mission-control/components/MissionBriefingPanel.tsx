import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function MissionBriefingPanel() {
  return (
    <Panel className="p-4">
      <SectionHeader
        eyebrow="Briefing"
        title="Protect the Uplink"
        description="Players will learn how defenders validate commands, telemetry, and access patterns before acting."
      />
      <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
        <p>
          The first scenario will focus on distinguishing sensor faults from suspicious
          data manipulation without jumping to unsafe operational decisions.
        </p>
        <p>
          Future gameplay can plug into this panel for objectives, decision history,
          and concept explanations after each challenge.
        </p>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Button variant="primary">Review Scenario</Button>
        <Button variant="quiet">Open Training Log</Button>
      </div>
    </Panel>
  );
}
