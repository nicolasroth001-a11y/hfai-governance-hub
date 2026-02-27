import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createReviewer } from "@/lib/api";

export default function AdminCreateReviewer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReviewer(form);
      toast({ title: "Reviewer created", description: `${form.name} has been added.` });
      navigate("/admin/reviewers");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title="Create Reviewer" description="Add a new human reviewer to the system" />
      <ContentCard icon={UserPlus} title="New Reviewer" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="jane@hfai.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit">Create Reviewer</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/reviewers")}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </div>
  );
}
