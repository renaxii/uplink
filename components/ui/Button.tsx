import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "quiet" | "warning";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-cyan-300/50 bg-cyan-300 text-slate-950 shadow-[0_10px_30px_rgba(79,214,247,0.22)] hover:bg-white hover:border-white",
  secondary:
    "border-cyan-300/24 bg-cyan-300/8 text-cyan-50 hover:border-cyan-300/48 hover:bg-cyan-300/14",
  quiet:
    "border-white/10 bg-white/[0.035] text-slate-200 hover:border-white/20 hover:bg-white/[0.07]",
  warning:
    "border-amber-300/45 bg-amber-300/12 text-amber-100 hover:border-amber-200/70 hover:bg-amber-300/18",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 text-sm font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
