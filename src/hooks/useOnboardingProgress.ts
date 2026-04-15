import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

const ONBOARDING_STEPS = ["connect", "first_event", "create_rule", "assign_reviewer", "review_violation", "configure_notifications"];

const STEP_LABELS: Record<string, string> = {
  connect: "Connect AI Provider",
  first_event: "Send First Event",
  create_rule: "Create a Rule",
  assign_reviewer: "Set Up Reviewer",
  review_violation: "Review a Violation",
  configure_notifications: "Configure Notifications",
};

export function useOnboardingProgress() {
  const { profile } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>(
    ONBOARDING_STEPS.map((id) => ({ id, label: STEP_LABELS[id], completed: false }))
  );
  const [loading, setLoading] = useState(true);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  const orgId = profile?.org_id;

  const fetchProgress = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("org_id", orgId)
        .maybeSingle();

      if (data) {
        const completedSteps = (data as any).steps_completed || [];
        setSteps(ONBOARDING_STEPS.map((id) => ({
          id,
          label: STEP_LABELS[id],
          completed: completedSteps.includes(id),
        })));
        setCompletedAt((data as any).completed_at);
      }
    } catch (err) {
      console.error("useOnboardingProgress:", err);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const completeStep = useCallback(async (stepId: string) => {
    if (!orgId) return;

    // Upsert progress
    const currentCompleted = steps.filter((s) => s.completed).map((s) => s.id);
    if (currentCompleted.includes(stepId)) return;

    const newCompleted = [...currentCompleted, stepId];
    const allDone = newCompleted.length === ONBOARDING_STEPS.length;

    const { error } = await supabase
      .from("onboarding_progress")
      .upsert({
        org_id: orgId,
        steps_completed: newCompleted,
        current_step: allDone ? "done" : ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(stepId) + 1] || "done",
        completed_at: allDone ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "org_id" });

    if (!error) {
      setSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, completed: true } : s));
      if (allDone) setCompletedAt(new Date().toISOString());
    }
  }, [orgId, steps]);

  const skipAll = useCallback(async () => {
    if (!orgId) return;
    const { error } = await supabase
      .from("onboarding_progress")
      .upsert({
        org_id: orgId,
        steps_completed: ONBOARDING_STEPS,
        current_step: "done",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "org_id" });
    if (!error) {
      setSteps(ONBOARDING_STEPS.map((id) => ({ id, label: STEP_LABELS[id], completed: true })));
      setCompletedAt(new Date().toISOString());
    }
  }, [orgId]);

  const progress = steps.filter((s) => s.completed).length / steps.length;

  return { steps, progress, completedAt, loading, completeStep, skipAll, refetch: fetchProgress };
}
