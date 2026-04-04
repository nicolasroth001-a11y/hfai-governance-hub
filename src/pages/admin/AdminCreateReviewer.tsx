import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createReviewer } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function AdminCreateReviewer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReviewer(form);
      toast({ title: t("adminCreateReviewer.reviewerCreated") });
      navigate("/admin/reviewers");
    } catch (err: any) {
      toast({ title: t("adminCreateReviewer.error"), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title={t("adminCreateReviewer.title")} description={t("adminCreateReviewer.description")} />
      <ContentCard icon={UserPlus} title={t("adminCreateReviewer.newReviewer")} className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("adminCreateReviewer.reviewerName")}</Label>
            <Input placeholder={t("adminCreateReviewer.namePlaceholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>{t("adminCreateReviewer.email")}</Label>
            <Input type="email" placeholder={t("adminCreateReviewer.emailPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>{t("adminCreateReviewer.tempPassword")}</Label>
            <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? t("adminCreateReviewer.creating") : t("adminCreateReviewer.createReviewer")}</Button>
        </form>
      </ContentCard>
    </div>
  );
}
