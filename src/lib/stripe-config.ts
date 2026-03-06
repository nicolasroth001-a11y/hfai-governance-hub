// Stripe product/price mapping for HFAI
export const HFAI_PRO = {
  product_id: "prod_U6J5wUGrIWUqSz",
  price_id: "price_1T86TdL0paaPta3ZTOMYma2o",
  name: "HFAI Pro",
  price: 19,
  currency: "USD",
  interval: "month" as const,
  trial_days: 7,
  features: [
    "Unlimited AI systems",
    "Unlimited rules & violations",
    "Advanced analytics dashboard",
    "Human review workflows",
    "Full audit trail",
    "Priority support",
  ],
} as const;
