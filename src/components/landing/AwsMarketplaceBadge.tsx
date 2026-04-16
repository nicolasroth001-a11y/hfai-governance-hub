import { Cloud } from "lucide-react";

interface AwsMarketplaceBadgeProps {
  variant?: "default" | "compact";
}

export function AwsMarketplaceBadge({ variant = "default" }: AwsMarketplaceBadgeProps) {
  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-secondary/20 px-2 py-1 text-[10px] text-muted-foreground">
        <Cloud className="h-3 w-3 text-primary/70" />
        <span>AWS Marketplace · Coming Q2 2026</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent px-3 py-1.5 text-xs text-foreground/80">
      <Cloud className="h-3.5 w-3.5 text-primary" />
      <span className="font-medium">Available on AWS Marketplace</span>
      <span className="text-muted-foreground">— Coming Q2 2026</span>
    </div>
  );
}
