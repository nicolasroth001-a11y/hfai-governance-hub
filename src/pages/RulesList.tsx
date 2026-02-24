import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { mockRules } from "@/lib/mock-data";
import { AlertTriangle } from "lucide-react";

export default function RulesList() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rules</h1>
        <p className="text-muted-foreground text-sm mt-1">AI governance rules and policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockRules.map((rule) => (
          <Link key={rule.id} to={`/rules/${rule.id}`}>
            <Card className="p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-card-foreground/50 font-mono">{rule.id}</p>
                  <h3 className="text-sm font-semibold text-card-foreground mt-1">{rule.name}</h3>
                </div>
                <SeverityBadge severity={rule.severity_default} />
              </div>
              <p className="text-xs text-card-foreground/70 mb-4">{rule.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs bg-card-foreground/5 text-card-foreground/60 border-card-foreground/10">
                  {rule.category}
                </Badge>
                <span className="text-xs text-card-foreground/50 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {rule.violations_count} violations
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
