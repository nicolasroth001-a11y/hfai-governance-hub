import { SectionHeader } from "@/components/SectionHeader";

export default function AdminRules() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Rules Management" description="Create and manage AI governance rules" />
      <p className="text-sm text-card-foreground/50">No rules management route exists in the backend yet. Rules are created per AI system via the database.</p>
    </div>
  );
}
