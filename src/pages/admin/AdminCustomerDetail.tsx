import { useParams, Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { StatCard } from "@/components/StatCard";
import { mockCustomers } from "@/lib/mock-data";
import { ArrowLeft, Box, AlertTriangle, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const customer = mockCustomers.find((c) => c.id === id) || mockCustomers[0];

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <SectionHeader title={customer.name} description={`Customer ${customer.id}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-base">
        <StatCard title="AI Models" value={customer.ai_models} icon={Box} />
        <StatCard title="Total Violations" value={customer.violations_total} icon={AlertTriangle} />
        <StatCard title="Plan" value={customer.plan} icon={Building2} />
      </div>

      <ContentCard title="Organization Details">
        <div className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Email</span><span className="text-card-foreground">{customer.email}</span></div>
          <div className="border-t border-primary/10" />
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Plan</span><span className="text-card-foreground font-medium text-primary">{customer.plan}</span></div>
          <div className="border-t border-primary/10" />
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Joined</span><span className="text-card-foreground">{format(new Date(customer.joined_at), "MMM d, yyyy")}</span></div>
          <div className="border-t border-primary/10" />
          <div className="flex justify-between text-sm"><span className="text-card-foreground/60">Status</span><span className="text-card-foreground">{customer.status}</span></div>
        </div>
      </ContentCard>
    </div>
  );
}
