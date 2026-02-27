import { SectionHeader } from "@/components/SectionHeader";

export default function AdminCustomers() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Customers" description="Manage customer organizations" />
      <p className="text-sm text-card-foreground/50">No customer management route exists in the backend yet.</p>
    </div>
  );
}
