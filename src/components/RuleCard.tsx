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
      <ShadcnCard className="p-6 hover:shadow-card-hover transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] text-card-foreground/35 font-mono">{id}</p>
            <h3 className="text-body font-semibold text-card-foreground mt-1">{name}</h3>
          </div>
          <SeverityBadge severity={severity_default} />
        </div>
        <p className="text-caption text-card-foreground/60 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-card-foreground/6">
          <Badge variant="outline" className="text-[11px] bg-card-foreground/4 text-card-foreground/50 border-card-foreground/8">
            {category}
          </Badge>
          <span className="text-[11px] text-card-foreground/40 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {violations_count}
          </span>
        </div>
      </ShadcnCard>
    </Link>
  );
}
