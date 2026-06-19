type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.035] p-3 transition duration-200 hover:border-cyan-300/24 hover:bg-white/[0.055]">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}
