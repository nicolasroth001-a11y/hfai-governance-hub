import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgReviewerPermissions, upsertReviewerPermissions, type ReviewerPermissions } from "@/hooks/useReviewerPermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, ShieldCheck, UserPlus, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { ReviewerGuide } from "@/components/ReviewerGuide";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerReviewerSettings() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const { reviewers, loading, refetch } = useOrgReviewerPermissions(orgId ?? undefined);
  const [reviewerProfiles, setReviewerProfiles] = useState<Record<string, { name: string; email: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Create reviewer form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // HFAI Expert request
  const [requestingExpert, setRequestingExpert] = useState(false);

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

  const handleCreateReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-in-house-reviewer", {
        body: { name: newName, email: newEmail, password: newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Reviewer created", description: `${newName} can now sign in at the Sign In page.` });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setShowCreateForm(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error creating reviewer", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRequestExpert = async () => {
    setRequestingExpert(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-hfai-expert");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Request submitted",
        description: data?.message || "HFAI will assign an expert reviewer to your organization shortly.",
      });
    } catch (err: any) {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    } finally {
      setRequestingExpert(false);
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
          title="Reviewer Management"
          description="Add in-house reviewers to your organization and manage their permissions."
        />

        {/* Actions row */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant={showCreateForm ? "secondary" : "default"}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {showCreateForm ? "Cancel" : "Add In-House Reviewer"}
          </Button>
          <Button
            onClick={handleRequestExpert}
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
            disabled={requestingExpert}
          >
            {requestingExpert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Request HFAI Expert
          </Button>
        </div>

        {/* Create reviewer form */}
        {showCreateForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Create In-House Reviewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateReviewer} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reviewer-name">Full Name</Label>
                    <Input
                      id="reviewer-name"
                      placeholder="Jane Smith"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewer-email">Email</Label>
                    <Input
                      id="reviewer-email"
                      type="email"
                      placeholder="jane@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewer-password">Temporary Password</Label>
                  <div className="relative">
                    <Input
                      id="reviewer-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this password securely with the reviewer. They can sign in at the main Sign In page.
                  </p>
                </div>
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Reviewer Account
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reviewer list */}
        {loading ? (
          <ContentCard icon={Users} title="Reviewers">
            <p className="text-sm text-muted-foreground">Loading reviewer permissions...</p>
          </ContentCard>
        ) : reviewers.length === 0 && !showCreateForm ? (
          <ContentCard icon={Users} title="No Reviewers Yet">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You haven't added any reviewers to your organization yet. Add an in-house reviewer above, or request an HFAI Expert.
              </p>
              <div className="rounded-lg border border-border/50 bg-background/40 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> How It Works
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li><strong>Add an in-house reviewer</strong> — Create an account for someone on your team who will review AI violations and manage governance.</li>
                  <li><strong>Configure their permissions</strong> — Choose what they can do: review violations, manage rules, manage AI systems, or approve deployments.</li>
                  <li><strong>They sign in normally</strong> — Your reviewer signs in at the same Sign In page and sees a dedicated reviewer dashboard scoped to your organization's data.</li>
                </ol>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> HFAI Expert Reviewer
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Need expert compliance support? Request an HFAI Expert Reviewer — a dedicated compliance specialist who can help your in-house reviewer navigate complex violations, flag critical risks, and ensure nothing dangerous reaches production. Available as an add-on, included with Sovereign tier.
                </p>
              </div>
            </div>
          </ContentCard>
        ) : (
          <div className="space-y-6">
            {reviewers.map((reviewer) => {
              const rProfile = reviewerProfiles[reviewer.reviewer_id];
              return (
                <ContentCard
                  key={reviewer.id}
                  icon={reviewer.reviewer_type === "hfai_appointed" ? ShieldCheck : Shield}
                  title={rProfile?.name || "Reviewer"}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-muted-foreground">{rProfile?.email || "—"}</span>
                      <Badge variant={reviewer.reviewer_type === "hfai_appointed" ? "default" : "secondary"} className="text-xs">
                        {reviewer.reviewer_type === "hfai_appointed" ? "HFAI Expert" : "In-House"}
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
                        Permissions
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
                              <p className="text-xs text-muted-foreground">Flag and override decisions when compliance risk detected (HFAI Expert only)</p>
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
        {/* Guide sections */}
        <ReviewerGuide />
      </div>
    </SubscriptionGate>
  );
}
