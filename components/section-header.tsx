interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
        <span className="text-brand font-mono text-sm font-normal opacity-70">
          {number}
        </span>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-muted-fg mt-2 ml-[calc(theme(fontSize.sm)+0.75rem)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
