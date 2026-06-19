type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
};

const titleSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  size = "md",
}: SectionHeaderProps) {
  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-cyan-200/90">
        {eyebrow}
      </p>
      <h2 className={`${titleSizes[size]} font-semibold leading-tight text-white`}>
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-slate-300/78">{description}</p>
      ) : null}
    </div>
  );
}
