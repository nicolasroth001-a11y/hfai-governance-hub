import { SectionHeader } from "@/components/SectionHeader";

export default function RulesList() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Rules" description="AI governance rules and policies" />
      <p className="text-sm text-card-foreground/50">No rules route exists in the backend yet.</p>
    </div>
  );
}
