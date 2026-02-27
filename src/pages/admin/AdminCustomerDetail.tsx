import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft } from "lucide-react";

export default function AdminCustomerDetail() {
  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <SectionHeader title="Customer Detail" description="Not available" />
      </div>
      <p className="text-sm text-card-foreground/50">No customer management route exists in the backend yet.</p>
    </div>
  );
}
