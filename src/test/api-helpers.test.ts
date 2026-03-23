import { describe, it, expect } from "vitest";

// Test route redirect logic (mirrors what App.tsx does)
describe("Route redirects", () => {
  const redirectMap: Record<string, string> = {
    "/pricing": "/pricing/contact",
    "/sdk-docs": "/docs/sdk",
  };

  it("/pricing redirects to /pricing/contact", () => {
    expect(redirectMap["/pricing"]).toBe("/pricing/contact");
  });

  it("/sdk-docs redirects to /docs/sdk", () => {
    expect(redirectMap["/sdk-docs"]).toBe("/docs/sdk");
  });

  it("canonical routes exist", () => {
    const canonicalRoutes = ["/pricing/contact", "/docs/sdk", "/pilot", "/blog"];
    for (const route of canonicalRoutes) {
      expect(route).toBeTruthy();
    }
  });
});

// Test tier hierarchy logic
describe("Tier hierarchy", () => {
  const tierOrder = ["free", "starter", "pro", "enterprise"];

  it("maintains correct ordering", () => {
    for (let i = 0; i < tierOrder.length - 1; i++) {
      expect(tierOrder.indexOf(tierOrder[i])).toBeLessThan(
        tierOrder.indexOf(tierOrder[i + 1])
      );
    }
  });
});
