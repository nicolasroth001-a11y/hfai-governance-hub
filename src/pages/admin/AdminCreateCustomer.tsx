import { SectionHeader } from "@/components/SectionHeader";
import { DemoDisabled } from "@/components/DemoDisabled";
import { ContentCard } from "@/components/ContentCard";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCreateCustomer() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Create Customer" description="Register a new customer organization" />
      <DemoDisabled>
        <ContentCard icon={Building2} title="New Customer" className="max-w-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input disabled placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input disabled placeholder="admin@acme.com" />
            </div>
            <Button disabled className="w-full">Create Customer</Button>
          </div>
        </ContentCard>
      </DemoDisabled>
    </div>
  );
}
