import { Card as ShadcnCard } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow, format } from "date-fns";
import { Calendar, Shield } from "lucide-react";

interface ViolationDetailCardProps {
  id: string;
  description: string;
  severity: string;
  rule_id: string;
  detected_at: string;
  status: string;
}

export function ViolationDetailCard({ id, description, severity, rule_id, detected_at, status }: ViolationDetailCardProps) {
  return (
    <ShadcnCard className="p-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-primary font-semibold">{id}</span>
          <SeverityBadge severity={severity} />
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="text-sm text-card-foreground leading-relaxed mb-4">{description}</p>

      <div className="space-y-2 pt-3 border-t border-primary/10">
        <div className="flex items-center gap-2 text-xs text-card-foreground/60">
          <Shield className="h-3.5 w-3.5 text-primary/70" />
          <span>Rule: <span className="text-card-foreground font-medium">{rule_id}</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-card-foreground/60">
          <Calendar className="h-3.5 w-3.5 text-primary/70" />
          <span>
            {format(new Date(detected_at), "MMM d, yyyy 'at' HH:mm")}
            <span className="text-card-foreground/40 ml-1">
              ({formatDistanceToNow(new Date(detected_at), { addSuffix: true })})
            </span>
          </span>
        </div>
      </div>
    </ShadcnCard>
  );
}
