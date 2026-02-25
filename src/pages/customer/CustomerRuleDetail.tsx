import { useParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { RuleCard } from "@/components/RuleCard";
import { mockRules } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export default function CustomerRuleDetail() {
  const { id } = useParams();
  const rule = mockRules.find((r) => r.id === id) || mockRules[0];

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/customer/rules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Rules
        </Link>
        <SectionHeader title={rule.name} description={`Rule ${rule.id}`} />
      </div>
      <div className="max-w-2xl">
        <RuleCard id={rule.id} name={rule.name} description={rule.description} category={rule.category} severity_default={rule.severity_default} violations_count={rule.violations_count} />
      </div>
    </div>
  );
}
