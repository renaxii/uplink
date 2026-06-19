import type { ReactNode } from "react";

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <main className="h-dvh overflow-hidden bg-[var(--background)] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(139,233,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,233,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(79,214,247,0.13),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,rgba(6,16,31,0.24),#06101f_76%)]" />
      <div className="relative h-dvh w-full overflow-hidden">{children}</div>
    </main>
  );
}
