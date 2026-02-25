import { Link } from "react-router-dom";
import { Card as ShadcnCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AlertTriangle } from "lucide-react";

interface RuleCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  severity_default: string;
  violations_count: number;
}

export function RuleCard({ id, name, description, category, severity_default, violations_count }: RuleCardProps) {
  return (
    <Link to={`/rules/${id}`}>
      <ShadcnCard className="p-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-card-foreground/50 font-mono">{id}</p>
            <h3 className="text-sm font-semibold text-card-foreground mt-1">{name}</h3>
          </div>
          <SeverityBadge severity={severity_default} />
        </div>
        <p className="text-xs text-card-foreground/70 mb-3">{description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-primary/10">
          <Badge variant="outline" className="text-xs bg-card-foreground/5 text-card-foreground/60 border-card-foreground/10">
            {category}
          </Badge>
          <span className="text-xs text-card-foreground/50 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {violations_count} violations
          </span>
        </div>
      </ShadcnCard>
    </Link>
  );
}
