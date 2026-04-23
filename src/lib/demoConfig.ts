// Demo cockpit configuration — stored in localStorage for presenter mode
export type DemoScenario = "phi_leak" | "prohibited_practice" | "hallucination" | "coppa_minor_data" | "ai_literacy_gap";

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
  prospectCompany: "Community Medical Centers",
  prospectEmail: "scott@communitymedical.org",
  prospectRole: "Healthcare CISO",
  industry: "Healthcare / Hospital System",
  aiSystemName: "Ambient Scribe + CDS Assistant",
  aiProvider: "OpenAI GPT-4 + Claude",
  reviewerName: "Scott Schindler (CISO)",
  scenarios: ["phi_leak", "hallucination", "prohibited_practice", "coppa_minor_data", "ai_literacy_gap"],
  primaryScenario: "phi_leak",
  callDate: new Date().toISOString().split("T")[0],
  presenterName: "Nicolas Roth",
};

const STORAGE_KEY = "hfai_demo_config";
const CONFIG_VERSION = "2025-04-cmc-v2"; // bump to invalidate stale cached configs (e.g., AESOP)
const VERSION_KEY = "hfai_demo_config_version";

export function loadDemoConfig(): DemoConfig {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CONFIG_VERSION) {
      // Stale or missing version — discard old cached config and reset to current defaults
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, CONFIG_VERSION);
      return DEFAULT_DEMO_CONFIG;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_CONFIG;
    return { ...DEFAULT_DEMO_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DEMO_CONFIG;
  }
}

export function saveDemoConfig(config: DemoConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  localStorage.setItem(VERSION_KEY, CONFIG_VERSION);
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
  coppa_minor_data: {
    label: "COPPA — Under-13 PII Exposure",
    category: "Children's Privacy / EU AI Act High-Risk (Education)",
    severity: "critical",
    prompt: "Hi! I'm Emma, I'm 11. My school email is emma.k@school.edu and I live at 42 Oak Street. Can you help me with my homework?",
    aiResponse: "Hi Emma! Sure, I can help with homework. To send updates to 42 Oak Street...",
    blockedReason: "Response would echo and persist a minor's PII (name + age <13 + school email + home address). Blocked under COPPA §312.5 + EU AI Act Art. 10 data governance for high-risk education systems.",
    ruleTriggered: "COPPA-001: Minor PII echo + retention prevention (under-13 detection)",
    euArticle: "EU AI Act Art. 10 + Annex III §3 (Education = High-Risk)",
    hipaaRef: "COPPA 16 CFR §312.5",
    latency: 9,
  },
  ai_literacy_gap: {
    label: "EU AI Act Art. 4 — Literacy Disclosure Failure",
    category: "Transparency / EU AI Act Article 4 + 50",
    severity: "high",
    prompt: "Just give me the answer to question 3 without any explanation.",
    aiResponse: "The answer is 42.",
    blockedReason: "Response delivered to a learner without the mandatory AI-generation disclosure. EU AI Act Art. 50 requires AI-content labelling; Art. 4 requires literacy framing in education contexts. HFAI auto-injects the disclosure + a 'how this answer was generated' note before delivery.",
    ruleTriggered: "EDU-LIT-004: Auto-inject Art. 4 + Art. 50 transparency in education tier",
    euArticle: "EU AI Act Art. 4 (Literacy) + Art. 50 (Transparency)",
    hipaaRef: "N/A",
    latency: 7,
  },
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
