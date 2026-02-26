import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/20",
  under_review: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  under_review: "Under Review",
  resolved: "Resolved",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize text-[11px] font-medium px-2 py-0.5", statusStyles[status] || "")}>
      {statusLabels[status] || status}
    </Badge>
  );
}
