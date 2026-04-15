import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReviewer } from "@/lib/api";
import { upsertReviewerPermissions } from "@/hooks/useReviewerPermissions";
import { toast } from "@/hooks/use-toast";

export default function AdminCreateReviewer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [reviewerType, setReviewerType] = useState<"company_assigned" | "hfai_appointed">("company_assigned");
  const [isBackup, setIsBackup] = useState(false);
  const [perms, setPerms] = useState({
    can_manage_rules: false,
    can_manage_systems: false,
    can_approve_deployments: false,
    can_override_decisions: false,
  });
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewerType === "hfai_appointed" && !orgId) {
      toast({ title: "Organization required", description: "HFAI-appointed reviewers must be assigned to an organization.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await createReviewer(form);
      const newUserId = result?.user?.id;

      // If we have an org and user, set permissions
      if (newUserId && orgId) {
        await upsertReviewerPermissions(orgId, newUserId, {
          reviewer_type: reviewerType,
          is_backup_reviewer: isBackup,
          can_review_violations: true,
          ...perms,
        });
      }

      toast({ title: t("adminCreateReviewer.reviewerCreated") });
      navigate("/admin/reviewers");
    } catch (err: any) {
      toast({ title: t("adminCreateReviewer.error"), description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-section">
      <SectionHeader title={t("adminCreateReviewer.title")} description="Create a new reviewer and configure their permissions." />
      <ContentCard icon={UserPlus} title={t("adminCreateReviewer.newReviewer")} className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="border-t border-border/30 pt-4 space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Reviewer Configuration</p>

            <div className="space-y-2">
              <Label>Reviewer Type</Label>
              <Select value={reviewerType} onValueChange={(v) => setReviewerType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_assigned">Company Assigned</SelectItem>
                  <SelectItem value="hfai_appointed">HFAI Appointed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Organization ID</Label>
              <Input placeholder="Paste organization UUID" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Required for permission assignment. Find in Admin → Customers.</p>
            </div>

            {reviewerType === "hfai_appointed" && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Backup Reviewer</Label>
                  <p className="text-xs text-muted-foreground">Designate as Sovereign tier backup</p>
                </div>
                <Switch checked={isBackup} onCheckedChange={setIsBackup} />
              </div>
            )}
          </div>

          <div className="border-t border-border/30 pt-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Permissions</p>

            {[
              { key: "can_manage_rules" as const, label: "Manage Rules", desc: "Create, edit, and disable governance rules" },
              { key: "can_manage_systems" as const, label: "Manage AI Systems", desc: "Modify AI system configurations" },
              { key: "can_approve_deployments" as const, label: "Approve Deployments", desc: "Approve deployment readiness" },
              ...(reviewerType === "hfai_appointed" ? [{ key: "can_override_decisions" as const, label: "Override Decisions", desc: "Override company reviewer decisions" }] : []),
            ].map((p) => (
              <div key={p.key} className="flex items-center justify-between py-1">
                <div>
                  <Label className="text-sm">{p.label}</Label>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch
                  checked={perms[p.key]}
                  onCheckedChange={(v) => setPerms({ ...perms, [p.key]: v })}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("adminCreateReviewer.creating") : t("adminCreateReviewer.createReviewer")}
          </Button>
        </form>
      </ContentCard>
    </div>
  );
}
