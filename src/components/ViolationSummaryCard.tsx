import { Card as ShadcnCard } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow, format } from "date-fns";
import { Calendar, Shield, Hash, FileText } from "lucide-react";

interface ViolationSummaryCardProps {
  id: string | number;
  description: string;
  severity: string;
  rule_id: string | number;
  detected_at: string;
  status: string;
}

export function ViolationSummaryCard({ id, description, severity, rule_id, detected_at, status }: ViolationSummaryCardProps) {
  const formattedDate = (() => {
    try {
      return format(new Date(detected_at), "MMM d, yyyy 'at' HH:mm");
    } catch {
      return detected_at;
    }
  })();

  const relativeDate = (() => {
    try {
      return formatDistanceToNow(new Date(detected_at), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <ShadcnCard className="p-card overflow-hidden">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-card-foreground/6">
        <FileText className="h-4 w-4 text-primary/80" />
        <h2 className="text-section text-card-foreground">Violation Summary</h2>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <SeverityBadge severity={severity} />
          <StatusBadge status={status} />
        </div>
      </div>

      <p className="text-sm text-card-foreground leading-relaxed mb-5">{description}</p>

      <div className="space-y-3 pt-4 border-t border-card-foreground/6">
        <div className="flex items-center gap-2.5 text-xs text-card-foreground/60">
          <Hash className="h-3.5 w-3.5 text-primary/60 shrink-0" />
          <span>Violation ID: <span className="text-card-foreground font-mono font-medium">{id}</span></span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-card-foreground/60">
          <Shield className="h-3.5 w-3.5 text-primary/60 shrink-0" />
          <span>Rule: <span className="text-card-foreground font-mono font-medium">{rule_id}</span></span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-card-foreground/60">
          <Calendar className="h-3.5 w-3.5 text-primary/60 shrink-0" />
          <span>
            {formattedDate}
            {relativeDate && (
              <span className="text-card-foreground/35 ml-1.5">({relativeDate})</span>
            )}
          </span>
        </div>
      </div>
    </ShadcnCard>
  );
}
