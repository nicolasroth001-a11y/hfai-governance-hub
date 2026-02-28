export const mockDashboardStats = {
  totalViolations: 142,
  openViolations: 23,
  totalRules: 48,
  resolvedToday: 7,
};

export const mockViolations = [
  { id: "VIO-001", description: "AI generated response without human approval in sensitive context", severity: "critical", rule_id: "RULE-003", detected_at: "2026-02-24T10:23:00Z", status: "open", assigned_reviewer: "reviewer@hfai.com" },
  { id: "VIO-002", description: "Model output exceeded confidence threshold without flagging", severity: "high", rule_id: "RULE-007", detected_at: "2026-02-24T09:15:00Z", status: "open", assigned_reviewer: "reviewer@hfai.com" },
  { id: "VIO-003", description: "PII detected in AI response payload", severity: "critical", rule_id: "RULE-001", detected_at: "2026-02-23T16:42:00Z", status: "resolved", assigned_reviewer: "reviewer2@hfai.com" },
  { id: "VIO-004", description: "Bias indicator triggered in hiring recommendation", severity: "high", rule_id: "RULE-012", detected_at: "2026-02-23T14:30:00Z", status: "open", assigned_reviewer: "reviewer@hfai.com" },
  { id: "VIO-005", description: "Automated decision made without required human review", severity: "medium", rule_id: "RULE-003", detected_at: "2026-02-23T11:20:00Z", status: "resolved", assigned_reviewer: "reviewer2@hfai.com" },
  { id: "VIO-006", description: "Model hallucination detected in financial advice context", severity: "critical", rule_id: "RULE-015", detected_at: "2026-02-22T18:05:00Z", status: "under_review", assigned_reviewer: "reviewer@hfai.com" },
  { id: "VIO-007", description: "Consent not obtained before data processing", severity: "medium", rule_id: "RULE-002", detected_at: "2026-02-22T09:33:00Z", status: "resolved", assigned_reviewer: "reviewer@hfai.com" },
  { id: "VIO-008", description: "Explainability score below minimum threshold", severity: "low", rule_id: "RULE-009", detected_at: "2026-02-21T15:12:00Z", status: "open", assigned_reviewer: "reviewer2@hfai.com" },
];

export const mockViolationDetail = {
  id: "VIO-001",
  description: "AI generated response without human approval in sensitive context",
  severity: "critical",
  rule_id: "RULE-003",
  detected_at: "2026-02-24T10:23:00Z",
  status: "open",
  assigned_reviewer: "reviewer@hfai.com",
  rule: {
    id: "RULE-003",
    name: "Human-in-the-Loop Required",
    description: "All AI-generated decisions in sensitive categories must receive human approval before execution.",
    category: "Oversight",
    severity_default: "critical",
    created_at: "2025-11-01T00:00:00Z",
  },
  ai_event: {
    model: "gpt-4-turbo",
    prompt_tokens: 1243,
    completion_tokens: 567,
    latency_ms: 2340,
    confidence_score: 0.72,
    context: "Customer support - account closure request",
  },
  conversation: [
    { role: "user", content: "I want to close my account and get a full refund for the remaining subscription period." },
    { role: "assistant", content: "I understand you'd like to close your account. I can process that for you right away. Based on your remaining 4 months, I'll issue a refund of $196.00 to your original payment method. Your account will be deactivated immediately." },
    { role: "system", content: "⚠️ VIOLATION: Response committed to financial action without human approval." },
  ],
  audit_logs: [
    { id: "LOG-001", timestamp: "2026-02-24T10:23:00Z", action: "violation_detected", actor: "system", details: "Automated detection triggered by rule RULE-003" },
    { id: "LOG-002", timestamp: "2026-02-24T10:23:01Z", action: "notification_sent", actor: "system", details: "Alert sent to governance team" },
    { id: "LOG-003", timestamp: "2026-02-24T10:45:00Z", action: "violation_viewed", actor: "admin@hfai.com", details: "Violation opened for review" },
  ],
};

export const mockRules = [
  { id: "RULE-001", name: "PII Protection", description: "AI responses must not contain personally identifiable information.", category: "Privacy", severity_default: "critical", status: "active", violations_count: 12 },
  { id: "RULE-002", name: "Consent Verification", description: "Data processing requires verified user consent.", category: "Privacy", status: "active", severity_default: "medium", violations_count: 5 },
  { id: "RULE-003", name: "Human-in-the-Loop Required", description: "Sensitive AI decisions require human approval.", category: "Oversight", severity_default: "critical", status: "active", violations_count: 18 },
  { id: "RULE-007", name: "Confidence Threshold", description: "Flag outputs below confidence threshold.", category: "Quality", severity_default: "high", status: "active", violations_count: 9 },
  { id: "RULE-009", name: "Explainability Minimum", description: "All decisions must meet explainability score.", category: "Transparency", severity_default: "low", status: "active", violations_count: 3 },
  { id: "RULE-012", name: "Bias Detection", description: "Monitor for bias in recommendations.", category: "Fairness", severity_default: "high", status: "active", violations_count: 7 },
  { id: "RULE-015", name: "Hallucination Guard", description: "Detect and flag hallucinated content.", category: "Quality", severity_default: "critical", status: "active", violations_count: 4 },
];

export const mockAuditLogs = [
  { id: "LOG-001", timestamp: "2026-02-24T10:23:00Z", action: "violation_detected", actor: "system", entity_type: "violation", entity_id: "VIO-001", details: "Automated detection triggered" },
  { id: "LOG-002", timestamp: "2026-02-24T10:23:01Z", action: "notification_sent", actor: "system", entity_type: "violation", entity_id: "VIO-001", details: "Alert sent to governance team" },
  { id: "LOG-003", timestamp: "2026-02-24T09:15:00Z", action: "violation_detected", actor: "system", entity_type: "violation", entity_id: "VIO-002", details: "Confidence threshold breach" },
  { id: "LOG-004", timestamp: "2026-02-23T17:00:00Z", action: "violation_resolved", actor: "admin@hfai.com", entity_type: "violation", entity_id: "VIO-003", details: "Marked as resolved after review" },
  { id: "LOG-005", timestamp: "2026-02-23T16:42:00Z", action: "violation_detected", actor: "system", entity_type: "violation", entity_id: "VIO-003", details: "PII detected in response" },
  { id: "LOG-006", timestamp: "2026-02-23T12:00:00Z", action: "rule_updated", actor: "admin@hfai.com", entity_type: "rule", entity_id: "RULE-003", details: "Updated severity threshold" },
  { id: "LOG-007", timestamp: "2026-02-22T09:00:00Z", action: "rule_created", actor: "admin@hfai.com", entity_type: "rule", entity_id: "RULE-015", details: "New hallucination guard rule" },
  { id: "LOG-008", timestamp: "2026-02-21T14:30:00Z", action: "violation_approved", actor: "reviewer@hfai.com", entity_type: "violation", entity_id: "VIO-005", details: "Approved after human review" },
];

export const mockRecentActivity = [
  { id: "1", type: "violation", message: "New critical violation detected", timestamp: "2026-02-24T10:23:00Z" },
  { id: "2", type: "violation", message: "Confidence threshold breach flagged", timestamp: "2026-02-24T09:15:00Z" },
  { id: "3", type: "resolution", message: "VIO-003 resolved by admin", timestamp: "2026-02-23T17:00:00Z" },
  { id: "4", type: "rule", message: "Rule RULE-003 severity updated", timestamp: "2026-02-23T12:00:00Z" },
  { id: "5", type: "rule", message: "New rule RULE-015 created", timestamp: "2026-02-22T09:00:00Z" },
];

// Reviewer mock data
export const mockReviewers = [
  { id: "REV-001", name: "Sarah Chen", email: "reviewer@hfai.com", role: "Senior Reviewer", assigned_violations: 4, reviewed_total: 87, status: "active" },
  { id: "REV-002", name: "Marcus Johnson", email: "reviewer2@hfai.com", role: "Reviewer", assigned_violations: 2, reviewed_total: 34, status: "active" },
  { id: "REV-003", name: "Emily Park", email: "reviewer3@hfai.com", role: "Lead Reviewer", assigned_violations: 0, reviewed_total: 142, status: "active" },
  { id: "REV-004", name: "David Kim", email: "reviewer4@hfai.com", role: "Reviewer", assigned_violations: 1, reviewed_total: 19, status: "inactive" },
];

// Customer mock data
export const mockCustomers = [
  { id: "CUST-001", name: "Acme Corp", email: "admin@acme.com", plan: "Enterprise", ai_models: 12, violations_total: 45, status: "active", joined_at: "2025-06-15T00:00:00Z" },
  { id: "CUST-002", name: "TechFlow Inc", email: "ops@techflow.io", plan: "Business", ai_models: 5, violations_total: 18, status: "active", joined_at: "2025-08-22T00:00:00Z" },
  { id: "CUST-003", name: "DataBridge LLC", email: "hello@databridge.com", plan: "Enterprise", ai_models: 8, violations_total: 32, status: "active", joined_at: "2025-09-10T00:00:00Z" },
  { id: "CUST-004", name: "NovaMind AI", email: "contact@novamind.ai", plan: "Starter", ai_models: 2, violations_total: 7, status: "suspended", joined_at: "2025-11-01T00:00:00Z" },
];

// Admin stats
export const mockAdminStats = {
  totalViolations: 142,
  awaitingReview: 23,
  totalCustomers: 4,
  totalReviewers: 4,
  totalRules: 48,
};

// Reviewer stats
export const mockReviewerStats = {
  assignedViolations: 4,
  reviewedThisWeek: 12,
  pendingReview: 3,
  avgReviewTime: "14 min",
};

// Mock AI System for demo fallback
export const mockAISystem = {
  id: "SYS-001",
  name: "Demo AI Assistant",
  description: "A sample AI system used for demonstration purposes. Monitored by HFAI for policy compliance.",
  model_type: "LLM",
  provider: "OpenAI",
  version: "v4.0",
  risk_level: "High",
};

// Mock audit trail entries per violation for demo fallback
export const mockAuditTrailByViolation: Record<string, Array<{ id: string; created_at: string; action: string; entity_type: string; entity_id: string; details: string }>> = {
  "VIO-001": [
    { id: "AUD-001", created_at: "2026-02-24T10:23:00Z", action: "violation_detected", entity_type: "violation", entity_id: "VIO-001", details: "Automated detection triggered by rule RULE-003" },
    { id: "AUD-002", created_at: "2026-02-24T10:23:01Z", action: "notification_sent", entity_type: "violation", entity_id: "VIO-001", details: "Alert sent to governance team" },
    { id: "AUD-003", created_at: "2026-02-24T10:45:00Z", action: "violation_viewed", entity_type: "violation", entity_id: "VIO-001", details: "Violation opened for review by admin@hfai.com" },
  ],
  "VIO-002": [
    { id: "AUD-004", created_at: "2026-02-24T09:15:00Z", action: "violation_detected", entity_type: "violation", entity_id: "VIO-002", details: "Confidence threshold breach detected" },
    { id: "AUD-005", created_at: "2026-02-24T09:20:00Z", action: "notification_sent", entity_type: "violation", entity_id: "VIO-002", details: "Alert sent to assigned reviewer" },
  ],
  "VIO-003": [
    { id: "AUD-006", created_at: "2026-02-23T16:42:00Z", action: "violation_detected", entity_type: "violation", entity_id: "VIO-003", details: "PII detected in AI response payload" },
    { id: "AUD-007", created_at: "2026-02-23T16:50:00Z", action: "violation_reviewed", entity_type: "violation", entity_id: "VIO-003", details: "Reviewed by Sarah Chen" },
    { id: "AUD-008", created_at: "2026-02-23T17:00:00Z", action: "violation_resolved", entity_type: "violation", entity_id: "VIO-003", details: "Marked as resolved after review" },
  ],
};
