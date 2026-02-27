import { SectionHeader } from "@/components/SectionHeader";

export default function CustomerRules() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Rules" description="AI governance rules applied to your systems" />
      <p className="text-sm text-card-foreground/50">No rules route exists in the backend yet. Rules are created per AI system via the database.</p>
    </div>
  );
}
