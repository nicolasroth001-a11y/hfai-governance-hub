import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Building2 } from "lucide-react";

export default function AdminCreateCustomer() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Create Customer" description="Register a new customer organization" />
      <ContentCard icon={Building2} title="Not Available" className="max-w-lg">
        <p className="text-sm text-card-foreground/70">
          Customer creation is not yet supported by the backend. The <code>/admin/create-customer</code> route does not exist.
        </p>
      </ContentCard>
    </div>
  );
}
