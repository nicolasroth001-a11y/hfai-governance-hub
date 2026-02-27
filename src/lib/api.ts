const API_BASE = "http://localhost:3000";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("hfai_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiRequest<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────
export async function login(email: string, password: string, role: "customer" | "reviewer" | "admin") {
  const data = await apiRequest<{ token: string; user: unknown }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  localStorage.setItem("hfai_token", data.token);
  return data;
}

export async function signup(payload: { company_name: string; email: string; password: string }) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  localStorage.removeItem("hfai_token");
}

// ─── Dashboard ───────────────────────────────────────
export async function fetchDashboardStats() {
  return apiRequest("/violations").then((violations: any) => {
    const arr = Array.isArray(violations) ? violations : [];
    return {
      totalViolations: arr.length,
      openViolations: arr.filter((v: any) => v.status === "open").length,
      totalRules: 0,
      resolvedToday: arr.filter((v: any) => v.status === "resolved").length,
    };
  });
}

export async function fetchAdminStats() {
  return apiRequest("/violations").then((violations: any) => {
    const arr = Array.isArray(violations) ? violations : [];
    return {
      totalViolations: arr.length,
      awaitingReview: arr.filter((v: any) => v.status === "open" || v.status === "under_review").length,
      totalCustomers: 0,
      totalReviewers: 0,
      totalRules: 0,
    };
  });
}

export async function fetchRecentActivity() {
  return apiRequest<any[]>("/audit-logs");
}

// ─── Violations ──────────────────────────────────────
export async function fetchViolations(params?: { severity?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.severity) query.set("severity", params.severity);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return apiRequest<any[]>(`/violations${qs ? `?${qs}` : ""}`);
}

export async function fetchViolation(id: string) {
  return apiRequest(`/violations/${id}`);
}

export async function updateViolation(id: string, payload: Record<string, unknown>) {
  return apiRequest(`/violations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ─── Human Reviews (approve / reject / notes) ───────
export async function submitReview(payload: {
  violation_id: string;
  reviewer_name: string;
  decision: "approve" | "reject";
  comments?: string;
}) {
  return apiRequest("/human-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchReviews() {
  return apiRequest<any[]>("/human-reviews");
}

// ─── Rules ───────────────────────────────────────────
export async function fetchRules() {
  // No dedicated rules route in backend yet — return empty
  return apiRequest<any[]>("/violations").then(() => []).catch(() => []);
}

export async function fetchRule(id: string) {
  return {} as any;
}

export async function enableRuleTemplate(name: string) {
  return apiRequest("/customer/rule-templates", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// ─── AI Systems ──────────────────────────────────────
export async function fetchAISystems() {
  return apiRequest<any[]>("/ai-systems");
}

export async function createAISystem(payload: {
  name: string;
  description?: string;
  model_type?: string;
  provider?: string;
  version?: string;
  risk_level?: string;
}) {
  return apiRequest("/ai-systems", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── AI Events ───────────────────────────────────────
export async function fetchAIEvents() {
  return apiRequest<any[]>("/ai-events");
}

export async function sendAIEvent(payload: { event_type: string; payload: string }, apiKey: string) {
  return apiRequest("/ai-events", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: JSON.stringify(payload),
  });
}

// ─── Audit Logs ──────────────────────────────────────
export async function fetchAuditLogs(params?: { action?: string; entity_type?: string }) {
  const query = new URLSearchParams();
  if (params?.action) query.set("action", params.action);
  if (params?.entity_type) query.set("entity_type", params.entity_type);
  const qs = query.toString();
  return apiRequest<any[]>(`/audit-logs${qs ? `?${qs}` : ""}`);
}

// ─── API Keys ────────────────────────────────────────
export async function regenerateApiKey(customerId?: string) {
  const path = customerId ? `/customer/api-key/${customerId}/regenerate` : "/customer/api-key/regenerate";
  return apiRequest(path, { method: "POST" });
}

// ─── Admin: Customers & Reviewers ────────────────────
export async function createCustomer(payload: { company_name: string; admin_email: string; password: string }) {
  return apiRequest("/admin/create-customer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createReviewer(payload: { name: string; email: string; password: string }) {
  return apiRequest("/admin/create-reviewer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
