import { SectionHeader } from "@/components/SectionHeader";
import { RuleCard } from "@/components/RuleCard";
import { mockRules } from "@/lib/mock-data";

export default function RulesList() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Rules" description="AI governance rules and policies" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockRules.map((rule) => (
          <RuleCard key={rule.id} {...rule} />
        ))}
      </div>
    </div>
  );
}
