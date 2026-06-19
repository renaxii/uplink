export type MobileTab = "overview" | "mission" | "systems";

const tabs: Array<{ id: MobileTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "mission", label: "Mission" },
  { id: "systems", label: "Systems" },
];

export function MobileMissionTabs({
  activeTab,
  onChange,
}: {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}) {
  return (
    <nav
      className="grid shrink-0 grid-cols-3 gap-1 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.035] p-1 lg:hidden"
      aria-label="Mission dashboard sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-current={activeTab === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
          className="min-h-11 rounded-[var(--radius-control)] px-2 text-sm font-semibold text-slate-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 aria-[current=page]:bg-cyan-300 aria-[current=page]:text-slate-950"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
