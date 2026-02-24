import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import { mockRules } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function RuleDetail() {
  const { id } = useParams();
  const rule = mockRules.find((r) => r.id === id);

  if (!rule) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Rule not found.{" "}
        <Link to="/rules" className="text-primary hover:underline">Back to rules</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/rules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Rules
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{rule.name}</h1>
        <SeverityBadge severity={rule.severity_default} />
        <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">
          {rule.status}
        </Badge>
      </div>

      <Card className="p-6">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-card-foreground/60">Rule ID</span>
            <span className="text-card-foreground font-mono text-xs">{rule.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-foreground/60">Category</span>
            <span className="text-card-foreground">{rule.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-foreground/60">Default Severity</span>
            <SeverityBadge severity={rule.severity_default} />
          </div>
          <div className="flex justify-between">
            <span className="text-card-foreground/60">Violations</span>
            <span className="text-card-foreground">{rule.violations_count}</span>
          </div>
          <div className="pt-2">
            <span className="text-card-foreground/60 block mb-2">Description</span>
            <p className="text-card-foreground/80 leading-relaxed">{rule.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
