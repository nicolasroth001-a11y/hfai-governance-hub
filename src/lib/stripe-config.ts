// Stripe product/price mapping for HFAI tiers

export type TierKey = "free" | "starter" | "pro" | "enterprise" | "sovereign";

export interface TierConfig {
  product_id: string;
  price_id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month";
  trial_days: number;
  features: string[];
  highlighted?: boolean;
}

export const TIERS: Record<TierKey, TierConfig> = {
  free: {
    product_id: "",
    price_id: "",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    trial_days: 0,
    features: [
      "1 AI system",
      "5 governance rules",
      "Basic violation detection",
      "7‑day event history",
      "Community support",
    ],
  },
  starter: {
    product_id: "prod_U6J5wUGrIWUqSz",
    price_id: "price_1T86TdL0paaPta3ZTOMYma2o",
    name: "Starter",
    price: 19,
    currency: "USD",
    interval: "month",
    trial_days: 30,
    features: [
      "Up to 3 AI systems",
      "Governance rules engine",
      "Violation detection & alerts",
      "Basic event logging",
      "Email notifications",
    ],
  },
  pro: {
    product_id: "prod_U83i1kLpe72gKv",
    price_id: "price_1T9nbOL0paaPta3Zp91ftpUo",
    name: "Pro",
    price: 49.99,
    currency: "USD",
    interval: "month",
    trial_days: 30,
    highlighted: true,
    features: [
      "Unlimited AI systems",
      "Everything in Starter",
      "Advanced analytics dashboard",
      "Human review workflows",
      "Full audit trail",
      "Priority email support",
    ],
  },
  enterprise: {
    product_id: "prod_U83jB97VVesTcg",
    price_id: "price_1T9ncPL0paaPta3ZOLIpE2XP",
    name: "Enterprise",
    price: 149.99,
    currency: "USD",
    interval: "month",
    trial_days: 30,
    features: [
      "Everything in Pro",
      "Root cause analysis (AI‑powered)",
      "Remediation action tracking",
      "Violation pattern detection",
      "Custom rule templates",
      "Dedicated priority support",
    ],
  },
  sovereign: {
    product_id: "prod_SOVEREIGN_PLACEHOLDER",
    price_id: "price_SOVEREIGN_PLACEHOLDER",
    name: "Sovereign",
    price: 499,
    currency: "USD",
    interval: "month",
    trial_days: 30,
    highlighted: false,
    features: [
      "Everything in Enterprise",
      "Compliance certificates & attestations",
      "Regulatory precedent intelligence",
      "Regulator‑ready export packs",
      "Conformity drift detection",
      "Multi‑jurisdiction engine (EU, US, UK, CA)",
      "Dedicated compliance advisor",
    ],
  },
} as const;

// Map product IDs to tier keys for subscription checking
export const PRODUCT_TO_TIER: Record<string, TierKey> = Object.fromEntries(
  Object.entries(TIERS).map(([key, tier]) => [tier.product_id, key as TierKey])
);

// Tier hierarchy for feature gating (higher index = more access)
export const TIER_LEVEL: Record<TierKey, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
  sovereign: 4,
};

// Free tier limits
export const FREE_TIER_LIMITS = {
  maxAISystems: 1,
  maxRules: 5,
  eventHistoryDays: 7,
};

// Feature-to-minimum-tier mapping
export const FEATURE_TIER: Record<string, TierKey> = {
  "AI Systems": "free",
  "Rules": "free",
  "Violations": "free",
  "Events": "free",
  "Notifications": "starter",
  "Analytics": "pro",
  "Human Reviews": "pro",
  "Audit Logs": "pro",
  "Root Cause Analysis": "enterprise",
  "Remediation": "enterprise",
  "Pattern Detection": "enterprise",
  "Rule Templates": "enterprise",
  "Compliance Certificates": "sovereign",
  "Precedent Intelligence": "sovereign",
  "Regulator Export Packs": "sovereign",
  "Drift Detection": "sovereign",
  "Multi-Jurisdiction": "sovereign",
};

// Legacy compat
export const HFAI_PRO = TIERS.pro;
