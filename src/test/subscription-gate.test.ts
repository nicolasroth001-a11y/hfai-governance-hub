import { describe, it, expect } from "vitest";
import { TIER_LEVEL, FEATURE_TIER } from "@/lib/stripe-config";

// Test the gating logic used by SubscriptionGate without rendering React
function canAccess(feature: string, currentTier: string | null): boolean {
  const requiredTier = FEATURE_TIER[feature] ?? "starter";
  const requiredLevel = TIER_LEVEL[requiredTier as keyof typeof TIER_LEVEL];
  const currentLevel = TIER_LEVEL[(currentTier ?? "free") as keyof typeof TIER_LEVEL];
  return requiredTier === "free" || currentLevel >= requiredLevel;
}

describe("SubscriptionGate logic", () => {
  it("free (unsubscribed) users cannot access core paid features", () => {
    expect(canAccess("AI Systems", "free")).toBe(false);
    expect(canAccess("Rules", "free")).toBe(false);
    expect(canAccess("Violations", "free")).toBe(false);
    expect(canAccess("Notifications", "free")).toBe(false);
    expect(canAccess("Analytics", "free")).toBe(false);
    expect(canAccess("Root Cause Analysis", "free")).toBe(false);
  });

  it("starter users can access starter features but not pro", () => {
    expect(canAccess("AI Systems", "starter")).toBe(true);
    expect(canAccess("Rules", "starter")).toBe(true);
    expect(canAccess("Violations", "starter")).toBe(true);
    expect(canAccess("Notifications", "starter")).toBe(true);
    expect(canAccess("Analytics", "starter")).toBe(false);
    expect(canAccess("Root Cause Analysis", "starter")).toBe(false);
  });

  it("pro users can access pro and lower features", () => {
    expect(canAccess("Notifications", "pro")).toBe(true);
    expect(canAccess("Analytics", "pro")).toBe(true);
    expect(canAccess("Human Reviews", "pro")).toBe(true);
    expect(canAccess("Root Cause Analysis", "pro")).toBe(false);
  });

  it("enterprise users can access everything", () => {
    expect(canAccess("Root Cause Analysis", "enterprise")).toBe(true);
    expect(canAccess("Pattern Detection", "enterprise")).toBe(true);
    expect(canAccess("Analytics", "enterprise")).toBe(true);
    expect(canAccess("AI Systems", "enterprise")).toBe(true);
  });

  it("null tier defaults to free (unsubscribed)", () => {
    expect(canAccess("AI Systems", null)).toBe(false);
    expect(canAccess("Analytics", null)).toBe(false);
  });

  it("unknown features default to starter requirement", () => {
    expect(canAccess("Some Future Feature", "free")).toBe(false);
    expect(canAccess("Some Future Feature", "starter")).toBe(true);
  });
});
