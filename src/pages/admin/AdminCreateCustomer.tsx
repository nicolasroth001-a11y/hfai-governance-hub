import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createCustomer } from "@/lib/api";

export default function AdminCreateCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ company_name: "", admin_email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(form);
      toast({ title: "Customer created", description: `${form.company_name} has been added.` });
      navigate("/admin/customers");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title="Create Customer" description="Register a new customer organization" />
      <ContentCard icon={Building2} title="New Customer" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input placeholder="Acme Corp" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input type="email" placeholder="admin@company.com" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit">Create Customer</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/customers")}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </div>
  );
}
