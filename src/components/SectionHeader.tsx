interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-page">{title}</h1>
      {description && <p className="text-body text-muted-foreground">{description}</p>}
    </div>
  );
}
