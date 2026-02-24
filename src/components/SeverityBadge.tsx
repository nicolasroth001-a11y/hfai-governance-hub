import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize text-xs font-medium", severityStyles[severity] || severityStyles.low)}>
      {severity}
    </Badge>
  );
}
