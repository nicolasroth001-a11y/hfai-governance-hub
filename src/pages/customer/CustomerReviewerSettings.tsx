import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgReviewerPermissions, upsertReviewerPermissions, type ReviewerPermissions } from "@/hooks/useReviewerPermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, ShieldCheck } from "lucide-react";

export default function CustomerReviewerSettings() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const { reviewers, loading, refetch } = useOrgReviewerPermissions(orgId ?? undefined);
  const [reviewerProfiles, setReviewerProfiles] = useState<Record<string, { name: string; email: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Fetch reviewer profile info
  useEffect(() => {
    if (reviewers.length === 0) return;
    const ids = reviewers.map((r) => r.reviewer_id);
    supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", ids)
      .then(({ data }) => {
        const map: Record<string, { name: string; email: string }> = {};
        for (const p of data ?? []) map[p.id] = { name: p.name, email: p.email };
        setReviewerProfiles(map);
      });
  }, [reviewers]);

  const togglePermission = async (
    reviewer: ReviewerPermissions,
    key: "can_manage_rules" | "can_manage_systems" | "can_approve_deployments"
  ) => {
    if (!orgId) return;
    setSaving(reviewer.reviewer_id);
    try {
      await upsertReviewerPermissions(orgId, reviewer.reviewer_id, {
        [key]: !reviewer[key],
      });
      toast({ title: "Permission updated" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const permissionToggles = [
    { key: "can_manage_rules" as const, label: "Manage Rules", description: "Create, edit, and disable governance rules" },
    { key: "can_manage_systems" as const, label: "Manage AI Systems", description: "Modify AI system configurations" },
    { key: "can_approve_deployments" as const, label: "Approve Deployments", description: "Approve deployment readiness checklists" },
  ];

  return (
    <SubscriptionGate feature="Reviewer Settings">
      <div className="space-y-section">
        <SectionHeader
          title="Reviewer Permissions"
          description="Configure what your assigned reviewers can do within your organization."
        />

        {loading ? (
          <ContentCard icon={Users} title="Reviewers">
            <p className="text-sm text-muted-foreground">Loading reviewer permissions...</p>
          </ContentCard>
        ) : reviewers.length === 0 ? (
          <ContentCard icon={Users} title="No Reviewers Assigned">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No reviewers have been assigned to your organization yet. Here's how reviewer assignment works:
              </p>
              <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> How Reviewers Get Assigned
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li><strong>HFAI Admin creates a reviewer account</strong> — Your HFAI administrator provisions a reviewer through the Admin portal.</li>
                  <li><strong>Reviewer is linked to your organization</strong> — The admin assigns the reviewer to your org during creation.</li>
                  <li><strong>You configure their permissions here</strong> — Once assigned, you control what they can do: manage rules, manage AI systems, or approve deployments.</li>
                </ol>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Sovereign Tier: HFAI Backup Reviewer
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  On the Sovereign plan, HFAI appoints a dedicated backup reviewer with override authority. This reviewer can override company reviewer decisions when compliance risk is detected — all overrides are logged with mandatory justification in a tamper-evident audit trail.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Need a reviewer assigned? Contact your HFAI administrator or reach out to <span className="text-primary font-medium">support@hfa-i.org</span>.
              </p>
            </div>
          </ContentCard>
        ) : (
          <div className="space-y-6">
            {reviewers.map((reviewer) => {
              const rProfile = reviewerProfiles[reviewer.reviewer_id];
              return (
                <ContentCard
                  key={reviewer.id}
                  icon={reviewer.is_backup_reviewer ? ShieldCheck : Shield}
                  title={rProfile?.name || "Reviewer"}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-muted-foreground">{rProfile?.email || "—"}</span>
                      <Badge variant={reviewer.reviewer_type === "hfai_appointed" ? "default" : "secondary"} className="text-xs">
                        {reviewer.reviewer_type === "hfai_appointed" ? "HFAI Appointed" : "Company Assigned"}
                      </Badge>
                      {reviewer.is_backup_reviewer && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          Backup Reviewer
                        </Badge>
                      )}
                      {reviewer.can_override_decisions && (
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">
                          Override Authority
                        </Badge>
                      )}
                    </div>

                    <div className="border-t border-border/30 pt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                        Configurable Permissions
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-1">
                          <div>
                            <Label className="text-sm font-medium">Review Violations</Label>
                            <p className="text-xs text-muted-foreground">Review and make decisions on violations</p>
                          </div>
                          <Switch checked disabled />
                        </div>

                        {permissionToggles.map((perm) => (
                          <div key={perm.key} className="flex items-center justify-between py-1">
                            <div>
                              <Label className="text-sm font-medium">{perm.label}</Label>
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            </div>
                            <Switch
                              checked={reviewer[perm.key]}
                              disabled={saving === reviewer.reviewer_id || reviewer.reviewer_type === "hfai_appointed"}
                              onCheckedChange={() => togglePermission(reviewer, perm.key)}
                            />
                          </div>
                        ))}

                        {reviewer.can_override_decisions && (
                          <div className="flex items-center justify-between py-1 opacity-60">
                            <div>
                              <Label className="text-sm font-medium">Override Decisions</Label>
                              <p className="text-xs text-muted-foreground">Override company reviewer decisions (HFAI only)</p>
                            </div>
                            <Switch checked disabled />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ContentCard>
              );
            })}
          </div>
        )}
      </div>
    </SubscriptionGate>
  );
}
