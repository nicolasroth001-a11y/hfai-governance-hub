// Backend runs on port 4000 — see hfai-backend/index.js
const API_BASE = "http://localhost:4000";
const TIMEOUT_MS = 3000;

async function apiRequest<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

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
  return apiRequest<any[]>("/ai-systems");
}

export async function fetchAISystem(id: string) {
  return apiRequest<any>(`/ai-systems/${id}`);
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
  return apiRequest<any[]>("/violations");
}

export async function fetchViolation(id: string) {
  return apiRequest<any>(`/violations/${id}`);
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
  return apiRequest<any[]>("/human-reviews");
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
    // Mock fallback for demo mode
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
  return apiRequest<any[]>("/audit-logs");
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
    // Mock fallback for demo mode
    const eventId = `EVT-DEMO-${Math.floor(Math.random() * 9999)}`;
    const violationId = `VIO-DEMO-${Math.floor(Math.random() * 9999)}`;
    return {
      userEvent: { id: eventId, event_type: payload.event_type, payload: payload.payload, created_at: new Date().toISOString() },
      assistantEvent: null,
      violations: [{ id: violationId, ai_system_id: "SYS-001", rule_id: "RULE-003", description: `Demo violation from: "${payload.payload.substring(0, 50)}"`, severity: "high" }],
    };
  }
}
