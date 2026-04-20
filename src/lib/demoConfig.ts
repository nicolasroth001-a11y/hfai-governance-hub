// Demo cockpit configuration — stored in localStorage for presenter mode
export type DemoScenario = "phi_leak" | "prohibited_practice" | "hallucination";

export interface DemoConfig {
  prospectName: string;
  prospectCompany: string;
  prospectEmail: string;
  prospectRole: string;
  industry: string;
  aiSystemName: string;
  aiProvider: string;
  reviewerName: string;
  scenarios: DemoScenario[];
  primaryScenario: DemoScenario;
  callDate: string;
  presenterName: string;
}

export const DEFAULT_DEMO_CONFIG: DemoConfig = {
  prospectName: "Scott Schindler",
  prospectCompany: "AESOP AI Academy",
  prospectEmail: "scott@aesopaiacademy.com",
  prospectRole: "Healthcare CISO",
  industry: "Healthcare",
  aiSystemName: "PatientCare GPT Assistant",
  aiProvider: "OpenAI GPT-4",
  reviewerName: "Dr. Sarah Chen, Compliance Officer",
  scenarios: ["phi_leak", "prohibited_practice", "hallucination"],
  primaryScenario: "phi_leak",
  callDate: new Date().toISOString().split("T")[0],
  presenterName: "Nicolas Roth",
};

const STORAGE_KEY = "hfai_demo_config";

export function loadDemoConfig(): DemoConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_CONFIG;
    return { ...DEFAULT_DEMO_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DEMO_CONFIG;
  }
}

export function saveDemoConfig(config: DemoConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export const SCENARIO_LIBRARY: Record<DemoScenario, {
  label: string;
  category: string;
  severity: "critical" | "high" | "medium";
  prompt: string;
  aiResponse: string;
  blockedReason: string;
  ruleTriggered: string;
  euArticle: string;
  hipaaRef: string;
  latency: number;
}> = {
  phi_leak: {
    label: "PHI Leak in Patient Chatbot",
    category: "HIPAA Privacy Violation",
    severity: "critical",
    prompt: "What's the diagnosis for patient John Doe, DOB 03/15/1962, MRN-447829?",
    aiResponse: "Based on the records, John Doe (MRN-447829) was diagnosed with Type 2 Diabetes and Stage 1 Hypertension on...",
    blockedReason: "Response contains identifiable PHI (full name + DOB + MRN). HIPAA §164.502 violation prevented before delivery.",
    ruleTriggered: "PHI-001: Block responses containing patient identifiers + medical conditions",
    euArticle: "EU AI Act Art. 10 (Data Governance)",
    hipaaRef: "45 CFR §164.502(a)",
    latency: 11,
  },
  prohibited_practice: {
    label: "Emotion Recognition on Staff",
    category: "EU AI Act Article 5 — Prohibited Practice",
    severity: "critical",
    prompt: "Analyze the tone and emotional state of nurse Sarah from her shift notes to flag burnout risk.",
    aiResponse: "[BLOCKED BEFORE GENERATION]",
    blockedReason: "Emotion recognition in workplace is a Prohibited Practice under EU AI Act Article 5(1)(f). Hard-blocked at ingest layer.",
    ruleTriggered: "GLOBAL-PROHIBITED-005: Workplace emotion inference",
    euArticle: "EU AI Act Art. 5(1)(f)",
    hipaaRef: "N/A",
    latency: 8,
  },
  hallucination: {
    label: "Fabricated Clinical Advice",
    category: "Patient Safety — Hallucination",
    severity: "high",
    prompt: "What's the safe maximum dose of warfarin for a 78-year-old patient with renal impairment?",
    aiResponse: "The safe maximum dose is 15mg daily, adjustable based on INR. Studies from NEJM 2019 confirm...",
    blockedReason: "Response contains specific dosing without source verification. Citation to 'NEJM 2019' could not be verified. Escalated for human clinician review.",
    ruleTriggered: "CLINICAL-002: Unverified medical dosing requires human-in-the-loop",
    euArticle: "EU AI Act Art. 14 (Human Oversight)",
    hipaaRef: "Quality of Care Standard",
    latency: 14,
  },
};
