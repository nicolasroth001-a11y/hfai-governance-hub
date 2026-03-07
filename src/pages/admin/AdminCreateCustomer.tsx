import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function AdminCreateCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", contact_email: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createOrganization({ name: form.name, contact_email: form.contact_email });
      toast({ title: "Customer created" });
      navigate("/admin/customers");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title="Create Customer" description="Register a new customer organization" />
      <ContentCard icon={Building2} title="New Customer" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input placeholder="Acme Corp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input type="email" placeholder="admin@acme.com" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create Customer"}</Button>
        </form>
      </ContentCard>
    </div>
  );
}
