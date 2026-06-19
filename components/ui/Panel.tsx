import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
  role?: string;
  tone?: "default" | "elevated" | "subtle";
};

const toneClasses = {
  default: "bg-[var(--surface-1)] shadow-[var(--shadow-panel)]",
  elevated:
    "bg-[linear-gradient(180deg,rgba(13,32,55,0.9),rgba(6,16,31,0.86))] shadow-[var(--shadow-panel)]",
  subtle: "bg-[var(--surface-2)] shadow-[0_12px_42px_rgba(0,0,0,0.2)]",
};

export function Panel({ children, className, role, tone = "default" }: PanelProps) {
  return (
    <section
      role={role}
      className={cn(
        "motion-safe-fade-up min-h-0 rounded-[var(--radius-card)] border border-[var(--line-soft)] backdrop-blur transition duration-300 ease-out hover:border-cyan-300/22",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}
