import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  open: "bg-destructive/15 text-destructive border-destructive/30",
  under_review: "bg-warning/15 text-warning border-warning/30",
  resolved: "bg-success/15 text-success border-success/30",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  under_review: "Under Review",
  resolved: "Resolved",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize text-xs font-medium", statusStyles[status] || "")}>
      {statusLabels[status] || status}
    </Badge>
  );
}
