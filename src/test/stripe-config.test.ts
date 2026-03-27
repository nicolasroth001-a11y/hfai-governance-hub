import { describe, it, expect } from "vitest";
import { TIERS, PRODUCT_TO_TIER, TIER_LEVEL, FEATURE_TIER, FREE_TIER_LIMITS } from "@/lib/stripe-config";
import type { TierKey } from "@/lib/stripe-config";

describe("stripe-config", () => {
  describe("TIERS", () => {
    it("defines all four tiers", () => {
      expect(Object.keys(TIERS)).toEqual(["free", "starter", "pro", "enterprise"]);
    });

    it("free tier has price 0 and no trial", () => {
      expect(TIERS.free.price).toBe(0);
      expect(TIERS.free.trial_days).toBe(0);
    });

    it("paid tiers have 30-day trials", () => {
      expect(TIERS.starter.trial_days).toBe(30);
      expect(TIERS.pro.trial_days).toBe(30);
      expect(TIERS.enterprise.trial_days).toBe(30);
    });

    it("paid tiers have valid Stripe product and price IDs", () => {
      for (const key of ["starter", "pro", "enterprise"] as TierKey[]) {
        expect(TIERS[key].product_id).toMatch(/^prod_/);
        expect(TIERS[key].price_id).toMatch(/^price_/);
      }
    });

    it("pro tier is highlighted", () => {
      expect(TIERS.pro.highlighted).toBe(true);
      expect(TIERS.starter.highlighted).toBeUndefined();
    });

    it("each tier has at least 3 features", () => {
      for (const key of Object.keys(TIERS) as TierKey[]) {
        expect(TIERS[key].features.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("PRODUCT_TO_TIER", () => {
    it("maps product IDs back to tier keys", () => {
      expect(PRODUCT_TO_TIER["prod_U6J5wUGrIWUqSz"]).toBe("starter");
      expect(PRODUCT_TO_TIER["prod_U83i1kLpe72gKv"]).toBe("pro");
      expect(PRODUCT_TO_TIER["prod_U83jB97VVesTcg"]).toBe("enterprise");
    });
  });

  describe("TIER_LEVEL", () => {
    it("has ascending hierarchy", () => {
      expect(TIER_LEVEL.free).toBeLessThan(TIER_LEVEL.starter);
      expect(TIER_LEVEL.starter).toBeLessThan(TIER_LEVEL.pro);
      expect(TIER_LEVEL.pro).toBeLessThan(TIER_LEVEL.enterprise);
    });
  });

  describe("FEATURE_TIER", () => {
    it("gates RCA to enterprise", () => {
      expect(FEATURE_TIER["Root Cause Analysis"]).toBe("enterprise");
    });

    it("gates Analytics to pro", () => {
      expect(FEATURE_TIER["Analytics"]).toBe("pro");
    });

    it("allows AI Systems for free", () => {
      expect(FEATURE_TIER["AI Systems"]).toBe("free");
    });
  });

  describe("FREE_TIER_LIMITS", () => {
    it("limits free tier appropriately", () => {
      expect(FREE_TIER_LIMITS.maxAISystems).toBe(1);
      expect(FREE_TIER_LIMITS.maxRules).toBe(5);
      expect(FREE_TIER_LIMITS.eventHistoryDays).toBe(7);
    });
  });
});
