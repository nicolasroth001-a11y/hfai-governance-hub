import { Link } from "react-router-dom";
import { Card as ShadcnCard } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";

interface ViolationCardProps {
  id: string;
  description: string;
  severity: string;
  rule_id: string;
  detected_at: string;
  status: string;
}

export function ViolationCard({ id, description, severity, rule_id, detected_at, status }: ViolationCardProps) {
  return (
    <Link to={`/violations/${id}`}>
      <ShadcnCard className="p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-primary font-medium">{id}</span>
            <SeverityBadge severity={severity} />
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-card-foreground mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-xs text-card-foreground/50">
          <span>Rule: {rule_id}</span>
          <span>{formatDistanceToNow(new Date(detected_at), { addSuffix: true })}</span>
        </div>
      </ShadcnCard>
    </Link>
  );
}
