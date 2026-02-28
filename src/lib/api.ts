// Backend runs on port 4000 — see hfai-backend/index.js
const API_BASE = "http://localhost:4000";
const TIMEOUT_MS = 3000;

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("hfai_token");
}

async function apiRequest<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ─── AI Systems (/ai-systems) ────────────────────────
export async function fetchAISystems() {
  try {
    return await apiRequest<any[]>("/ai-systems");
  } catch {
    return [];
  }
}

export async function fetchAISystem(id: string) {
  try {
    return await apiRequest<any>(`/ai-systems/${id}`);
  } catch {
    const { mockAISystem } = await import("./mock-data");
    return mockAISystem;
  }
}

export async function createAISystem(payload: {
  name: string;
  description?: string;
  model_type?: string;
  provider?: string;
  version?: string;
  risk_level?: string;
}) {
  return apiRequest<any>("/ai-systems", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAISystem(id: string, payload: Record<string, unknown>) {
  return apiRequest<any>(`/ai-systems/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAISystem(id: string) {
  return apiRequest<any>(`/ai-systems/${id}`, { method: "DELETE" });
}

// ─── Violations (/violations) ────────────────────────
export async function fetchViolations() {
  try {
    return await apiRequest<any[]>("/violations");
  } catch {
    const { mockViolations } = await import("./mock-data");
    return mockViolations;
  }
}

export async function fetchViolation(id: string) {
  try {
    return await apiRequest<any>(`/violations/${id}`);
  } catch {
    const { mockViolations } = await import("./mock-data");
    return mockViolations.find((v) => v.id === id) || mockViolations[0];
  }
}

export async function createViolation(payload: {
  ai_system_id: string;
  rule_id: string;
  description: string;
  severity: string;
  ai_event_id?: string;
}) {
  return apiRequest<any>("/violations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateViolation(id: string, payload: Record<string, unknown>) {
  return apiRequest<any>(`/violations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteViolation(id: string) {
  return apiRequest<any>(`/violations/${id}`, { method: "DELETE" });
}

// ─── Human Reviews (/human-reviews) ─────────────────
export async function fetchReviews() {
  try {
    return await apiRequest<any[]>("/human-reviews");
  } catch {
    return [];
  }
}

export async function fetchReview(id: string) {
  return apiRequest<any>(`/human-reviews/${id}`);
}

export async function submitReview(payload: {
  violation_id: string;
  reviewer_name: string;
  decision: string;
  comments?: string;
}) {
  try {
    return await apiRequest<any>("/human-reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id: `REV-DEMO-${Date.now()}`,
      ...payload,
      reviewed_at: new Date().toISOString(),
      success: true,
    };
  }
}

export async function updateReview(id: string, payload: Record<string, unknown>) {
  return apiRequest<any>(`/human-reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ─── Audit Logs (/audit-logs) ───────────────────────
export async function fetchAuditLogs() {
  try {
    return await apiRequest<any[]>("/audit-logs");
  } catch {
    const { mockAuditLogs } = await import("./mock-data");
    return mockAuditLogs;
  }
}

export async function createAuditLog(payload: {
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
}) {
  return apiRequest<any>("/audit-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── AI Events (/ai-events) ─────────────────────────
export async function fetchAIEvents() {
  return apiRequest<any[]>("/ai-events");
}

export async function sendAIEvent(payload: { event_type: string; payload: string }, apiKey: string) {
  try {
    return await apiRequest<any>("/ai-events", {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: JSON.stringify(payload),
    });
  } catch {
    const eventId = `EVT-DEMO-${Math.floor(Math.random() * 9999)}`;
    const violationId = `VIO-DEMO-${Math.floor(Math.random() * 9999)}`;
    return {
      userEvent: { id: eventId, event_type: payload.event_type, payload: payload.payload, created_at: new Date().toISOString() },
      assistantEvent: null,
      violations: [{ id: violationId, ai_system_id: "SYS-001", rule_id: "RULE-003", description: `Demo violation from: "${payload.payload.substring(0, 50)}"`, severity: "high" }],
    };
  }
}

// ─── Rules (/rules) ─────────────────────────────────
export async function fetchRules() {
  try {
    return await apiRequest<any[]>("/rules");
  } catch {
    const { mockRules } = await import("./mock-data");
    return mockRules;
  }
}

export async function fetchRule(id: string) {
  try {
    return await apiRequest<any>(`/rules/${id}`);
  } catch {
    const { mockRules } = await import("./mock-data");
    return mockRules.find((r) => r.id === id) || mockRules[0];
  }
}

export async function createRule(payload: {
  name: string;
  description?: string;
  category?: string;
  severity?: string;
  condition?: string;
  enabled?: boolean;
}) {
  try {
    return await apiRequest<any>("/rules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return { id: `RULE-DEMO-${Date.now()}`, ...payload, created_at: new Date().toISOString(), success: true };
  }
}

export async function updateRule(id: string, payload: Record<string, unknown>) {
  try {
    return await apiRequest<any>(`/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch {
    return { id, ...payload, updated_at: new Date().toISOString(), success: true };
  }
}

export async function deleteRule(id: string) {
  try {
    return await apiRequest<any>(`/rules/${id}`, { method: "DELETE" });
  } catch {
    return { message: "Rule deleted (demo)" };
  }
}

// ─── Admin API (/admin) ─────────────────────────────
export async function fetchAdminStats() {
  return apiRequest<any>("/admin/stats");
}

export async function fetchAdminReviewers() {
  return apiRequest<any[]>("/admin/reviewers");
}

export async function createReviewer(payload: { email: string; name: string; password: string }) {
  return apiRequest<any>("/admin/reviewers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteReviewer(id: string) {
  return apiRequest<any>(`/admin/reviewers/${id}`, { method: "DELETE" });
}

export async function fetchAdminOrganizations() {
  return apiRequest<any[]>("/admin/organizations");
}

export async function createOrganization(payload: { name: string; contact_email?: string }) {
  return apiRequest<any>("/admin/organizations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteOrganization(id: string) {
  return apiRequest<any>(`/admin/organizations/${id}`, { method: "DELETE" });
}

export async function fetchAdminUsers() {
  return apiRequest<any[]>("/admin/users");
}
