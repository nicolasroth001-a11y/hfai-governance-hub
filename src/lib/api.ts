import { supabase } from "@/integrations/supabase/client";

// ─── AI Systems ────────────────────────────────────────
export async function fetchAISystems() {
  const { data, error } = await supabase.from("ai_systems").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchAISystems:", error); return []; }
  return data ?? [];
}

export async function fetchAISystem(id: string) {
  const { data, error } = await supabase.from("ai_systems").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createAISystem(payload: {
  name: string;
  description?: string;
  model_type?: string;
  provider?: string;
  version?: string;
  risk_level?: string;
  org_id: string;
}) {
  const { data, error } = await supabase.from("ai_systems").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAISystem(id: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("ai_systems").update(payload).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAISystem(id: string) {
  const { error } = await supabase.from("ai_systems").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Violations ────────────────────────────────────────
export async function fetchViolations() {
  const { data, error } = await supabase.from("violations").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchViolations:", error); return []; }
  return data ?? [];
}

export async function fetchViolation(id: string) {
  const { data, error } = await supabase.from("violations").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createViolation(payload: {
  ai_system_id: string;
  rule_id: string;
  description: string;
  severity: string;
  org_id: string;
  ai_event_id?: string;
}) {
  const { data, error } = await supabase.from("violations").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateViolation(id: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("violations").update(payload).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteViolation(id: string) {
  const { error } = await supabase.from("violations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Human Reviews ─────────────────────────────────────
export async function fetchReviews() {
  const { data, error } = await supabase.from("human_reviews").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchReviews:", error); return []; }
  return data ?? [];
}

export async function fetchReview(id: string) {
  const { data, error } = await supabase.from("human_reviews").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function submitReview(payload: {
  violation_id: string;
  reviewer_name: string;
  decision: string;
  comments?: string;
  reviewer_id?: string;
}) {
  const { data, error } = await supabase.from("human_reviews").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateReview(id: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("human_reviews").update(payload).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Audit Logs ────────────────────────────────────────
export async function fetchAuditLogs() {
  const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchAuditLogs:", error); return []; }
  return data ?? [];
}

export async function createAuditLog(payload: {
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  user_id?: string;
  org_id?: string;
}) {
  const { data, error } = await supabase.from("audit_logs").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── AI Events ─────────────────────────────────────────
export async function fetchAIEvents(filters?: { ai_system_id?: string; event_type?: string }) {
  let query = supabase.from("ai_events").select("*").order("created_at", { ascending: false });
  if (filters?.ai_system_id) query = query.eq("ai_system_id", filters.ai_system_id);
  if (filters?.event_type) query = query.eq("event_type", filters.event_type);
  const { data, error } = await query;
  if (error) { console.error("fetchAIEvents:", error); return []; }
  return data ?? [];
}

export async function fetchAIEvent(id: string) {
  const { data, error } = await supabase.from("ai_events").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchViolationsBySystem(systemId: string) {
  const { data, error } = await supabase.from("violations").select("*").eq("ai_system_id", systemId).order("created_at", { ascending: false });
  if (error) { console.error("fetchViolationsBySystem:", error); return []; }
  return data ?? [];
}

export async function fetchReviewsByViolations(violationIds: string[]) {
  if (violationIds.length === 0) return [];
  const { data, error } = await supabase.from("human_reviews").select("*").in("violation_id", violationIds).order("created_at", { ascending: false });
  if (error) { console.error("fetchReviewsByViolations:", error); return []; }
  return data ?? [];
}

export async function sendAIEvent(payload: { event_type: string; payload: string; org_id: string }) {
  const { data, error } = await supabase.from("ai_events").insert({
    event_type: payload.event_type,
    payload: payload.payload,
    org_id: payload.org_id,
  }).select().single();
  if (error) throw new Error(error.message);
  return { userEvent: data, assistantEvent: null, violations: [] };
}

// ─── Rules ─────────────────────────────────────────────
export async function fetchRules() {
  const { data, error } = await supabase.from("rules").select("*").order("created_at", { ascending: false });
  if (error) { console.error("fetchRules:", error); return []; }
  return data ?? [];
}

export async function fetchRule(id: string) {
  const { data, error } = await supabase.from("rules").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createRule(payload: {
  name: string;
  description?: string;
  category?: string;
  severity?: string;
  condition?: string;
  enabled?: boolean;
  org_id?: string;
}) {
  const { data, error } = await supabase.from("rules").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateRule(id: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("rules").update(payload).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRule(id: string) {
  const { error } = await supabase.from("rules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Admin: Organizations ──────────────────────────────
export async function fetchAdminOrganizations() {
  const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOrganization(payload: { name: string; contact_email?: string }) {
  const { data, error } = await supabase.from("organizations").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOrganization(id: string) {
  const { error } = await supabase.from("organizations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Admin: Profiles/Users ─────────────────────────────
export async function fetchAdminUsers() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAdminReviewers() {
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "reviewer").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Admin: Stats (computed client-side) ───────────────
export async function fetchAdminStats() {
  const [violations, reviews, orgs] = await Promise.all([
    supabase.from("violations").select("id, status", { count: "exact" }),
    supabase.from("human_reviews").select("id", { count: "exact" }),
    supabase.from("organizations").select("id", { count: "exact" }),
  ]);
  return {
    totalViolations: violations.count ?? 0,
    openViolations: (violations.data ?? []).filter((v) => v.status === "open").length,
    totalReviews: reviews.count ?? 0,
    totalOrganizations: orgs.count ?? 0,
  };
}

// ─── Admin: Reviewer management via edge function ──────
export async function createReviewer(payload: { email: string; name: string; password: string }) {
  const { data, error } = await supabase.functions.invoke("create-reviewer", {
    body: payload,
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function deleteReviewer(id: string) {
  const { data, error } = await supabase.functions.invoke("delete-reviewer", {
    body: { id },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}
