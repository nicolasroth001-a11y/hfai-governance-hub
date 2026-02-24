const API_BASE = "/api/v1";

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchViolations(params?: { severity?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.severity) query.set("severity", params.severity);
  if (params?.status) query.set("status", params.status);
  const res = await fetch(`${API_BASE}/violations?${query}`);
  if (!res.ok) throw new Error("Failed to fetch violations");
  return res.json();
}

export async function fetchViolation(id: string) {
  const res = await fetch(`${API_BASE}/violations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch violation");
  return res.json();
}

export async function reviewViolation(id: string, action: "approve" | "reject", notes?: string) {
  const res = await fetch(`${API_BASE}/violations/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, notes }),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

export async function fetchRules() {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error("Failed to fetch rules");
  return res.json();
}

export async function fetchRule(id: string) {
  const res = await fetch(`${API_BASE}/rules/${id}`);
  if (!res.ok) throw new Error("Failed to fetch rule");
  return res.json();
}

export async function fetchAuditLogs(params?: { action?: string; entity_type?: string }) {
  const query = new URLSearchParams();
  if (params?.action) query.set("action", params.action);
  if (params?.entity_type) query.set("entity_type", params.entity_type);
  const res = await fetch(`${API_BASE}/audit-logs?${query}`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export async function fetchRecentActivity() {
  const res = await fetch(`${API_BASE}/dashboard/activity`);
  if (!res.ok) throw new Error("Failed to fetch recent activity");
  return res.json();
}
