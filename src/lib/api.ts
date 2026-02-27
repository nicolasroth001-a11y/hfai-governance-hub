// Backend runs on port 4000 — see hfai-backend/index.js
const API_BASE = "http://localhost:4000";

async function apiRequest<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── AI Systems (/ai-systems) ────────────────────────
// GET /ai-systems → returns array of { id, name, description, model_type, provider, version, risk_level, api_key_hash, created_at }
export async function fetchAISystems() {
  return apiRequest<any[]>("/ai-systems");
}

// GET /ai-systems/:id
export async function fetchAISystem(id: string) {
  return apiRequest<any>(`/ai-systems/${id}`);
}

// POST /ai-systems → body: { name, description, model_type, provider, version, risk_level }
// returns: { id, name, ..., api_key } (api_key shown once)
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

// PUT /ai-systems/:id
export async function updateAISystem(id: string, payload: Record<string, unknown>) {
  return apiRequest<any>(`/ai-systems/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE /ai-systems/:id
export async function deleteAISystem(id: string) {
  return apiRequest<any>(`/ai-systems/${id}`, { method: "DELETE" });
}

// ─── Violations (/violations) ────────────────────────
// GET /violations → returns array of { id, ai_system_id, rule_id, description, severity, ai_event_id, detected_at, status, ... }
export async function fetchViolations() {
  return apiRequest<any[]>("/violations");
}

// GET /violations/:id
export async function fetchViolation(id: string) {
  return apiRequest<any>(`/violations/${id}`);
}

// POST /violations → body: { ai_system_id, rule_id, description, severity, ai_event_id }
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

// PUT /violations/:id → body: { ai_system_id, rule_id, description, severity, ai_event_id }
export async function updateViolation(id: string, payload: Record<string, unknown>) {
  return apiRequest<any>(`/violations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE /violations/:id
export async function deleteViolation(id: string) {
  return apiRequest<any>(`/violations/${id}`, { method: "DELETE" });
}

// ─── Human Reviews (/human-reviews) ─────────────────
// GET /human-reviews → returns array of { id, violation_id, reviewer_name, decision, comments, reviewed_at, ... }
export async function fetchReviews() {
  return apiRequest<any[]>("/human-reviews");
}

// GET /human-reviews/:id
export async function fetchReview(id: string) {
  return apiRequest<any>(`/human-reviews/${id}`);
}

// POST /human-reviews → body: { violation_id, reviewer_name, decision, comments }
export async function submitReview(payload: {
  violation_id: string;
  reviewer_name: string;
  decision: string;
  comments?: string;
}) {
  return apiRequest<any>("/human-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUT /human-reviews/:id
export async function updateReview(id: string, payload: Record<string, unknown>) {
  return apiRequest<any>(`/human-reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ─── Audit Logs (/audit-logs) ───────────────────────
// GET /audit-logs → returns array of { id, action, entity_type, entity_id, details, created_at }
export async function fetchAuditLogs() {
  return apiRequest<any[]>("/audit-logs");
}

// POST /audit-logs → body: { action, entity_type, entity_id, details }
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
// GET /ai-events → returns array of { id, ai_system_id, event_type, payload, created_at }
export async function fetchAIEvents() {
  return apiRequest<any[]>("/ai-events");
}

// POST /ai-events → requires x-api-key header; body: { event_type, payload }
// returns: { userEvent, assistantEvent }
export async function sendAIEvent(payload: { event_type: string; payload: string }, apiKey: string) {
  return apiRequest<any>("/ai-events", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: JSON.stringify(payload),
  });
}
