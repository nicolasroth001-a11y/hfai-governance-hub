import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReviewerPermissions {
  id: string;
  org_id: string;
  reviewer_id: string;
  reviewer_type: "company_assigned" | "hfai_appointed";
  is_backup_reviewer: boolean;
  can_review_violations: boolean;
  can_manage_rules: boolean;
  can_manage_systems: boolean;
  can_approve_deployments: boolean;
  can_override_decisions: boolean;
  created_at: string;
  updated_at: string | null;
}

export function useReviewerPermissions(reviewerId?: string) {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState<ReviewerPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const targetId = reviewerId || profile?.id;

  const fetchPermissions = useCallback(async () => {
    if (!targetId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("reviewer_permissions" as any)
        .select("*")
        .eq("reviewer_id", targetId)
        .maybeSingle();
      if (error) throw error;
      setPermissions(data as any);
    } catch (err) {
      console.error("fetchReviewerPermissions:", err);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const can = useCallback(
    (permission: keyof Omit<ReviewerPermissions, "id" | "org_id" | "reviewer_id" | "reviewer_type" | "is_backup_reviewer" | "created_at" | "updated_at">) => {
      if (!permissions) return false;
      return Boolean(permissions[permission]);
    },
    [permissions]
  );

  const isBackup = permissions?.is_backup_reviewer ?? false;
  const isHFAI = permissions?.reviewer_type === "hfai_appointed";

  return { permissions, loading, can, isBackup, isHFAI, refetch: fetchPermissions };
}

export function useOrgReviewerPermissions(orgId?: string) {
  const [reviewers, setReviewers] = useState<ReviewerPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("reviewer_permissions" as any)
        .select("*")
        .eq("org_id", orgId);
      if (error) throw error;
      setReviewers((data ?? []) as any);
    } catch (err) {
      console.error("fetchOrgReviewerPermissions:", err);
      setReviewers([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { reviewers, loading, refetch: fetch };
}

export async function upsertReviewerPermissions(
  orgId: string,
  reviewerId: string,
  perms: Partial<Omit<ReviewerPermissions, "id" | "org_id" | "reviewer_id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("reviewer_permissions" as any)
    .upsert(
      { org_id: orgId, reviewer_id: reviewerId, ...perms, updated_at: new Date().toISOString() },
      { onConflict: "org_id,reviewer_id" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchReviewerOverrides(violationId: string) {
  const { data, error } = await supabase
    .from("reviewer_overrides" as any)
    .select("*")
    .eq("violation_id", violationId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchReviewerOverrides:", error); return []; }
  return data ?? [];
}

export async function createReviewerOverride(payload: {
  org_id: string;
  violation_id: string;
  original_review_id: string;
  override_reviewer_id: string;
  original_decision: string;
  override_decision: string;
  override_reason: string;
}) {
  const { data, error } = await supabase
    .from("reviewer_overrides" as any)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
