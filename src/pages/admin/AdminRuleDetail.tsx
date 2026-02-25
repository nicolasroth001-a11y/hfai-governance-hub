import { useParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { RuleCard } from "@/components/RuleCard";
import { ContentCard } from "@/components/ContentCard";
import { mockRules } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminRuleDetail() {
  const { id } = useParams();
  const rule = mockRules.find((r) => r.id === id) || mockRules[0];

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/rules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Rules
        </Link>
        <SectionHeader title={rule.name} description={`Rule ${rule.id}`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-section items-start">
        <RuleCard id={rule.id} name={rule.name} description={rule.description} category={rule.category} severity_default={rule.severity_default} violations_count={rule.violations_count} />
        <ContentCard title="Edit Rule">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Name</Label>
              <Input defaultValue={rule.name} className="bg-card border-card-foreground/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Description</Label>
              <Textarea defaultValue={rule.description} className="bg-card border-card-foreground/10 resize-none" rows={3} />
            </div>
            <Button className="bg-primary text-primary-foreground">Save Changes</Button>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
