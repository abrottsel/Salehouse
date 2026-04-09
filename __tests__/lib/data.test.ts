import { describe, it, expect } from "vitest";
import { villages, reviews, steps } from "@/lib/data";

describe("Villages data", () => {
  it("should have at least 5 villages", () => {
    expect(villages.length).toBeGreaterThanOrEqual(5);
  });

  it("each village should have required fields", () => {
    villages.forEach((village) => {
      expect(village.id).toBeDefined();
      expect(village.name).toBeTruthy();
      expect(village.slug).toBeTruthy();
      expect(village.direction).toBeTruthy();
      expect(village.distance).toBeGreaterThan(0);
      expect(village.readiness).toBeGreaterThanOrEqual(0);
      expect(village.readiness).toBeLessThanOrEqual(100);
      expect(village.priceFrom).toBeGreaterThan(0);
      expect(village.features.length).toBeGreaterThan(0);
    });
  });

  it("each village should have unique slug", () => {
    const slugs = villages.map((v) => v.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("prices should be realistic (100k-5m per sotka)", () => {
    villages.forEach((v) => {
      expect(v.priceFrom).toBeGreaterThanOrEqual(100000);
      expect(v.priceFrom).toBeLessThanOrEqual(5000000);
    });
  });
});

describe("Reviews data", () => {
  it("should have at least 3 reviews", () => {
    expect(reviews.length).toBeGreaterThanOrEqual(3);
  });

  it("ratings should be 1-5", () => {
    reviews.forEach((r) => {
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
    });
  });
});

describe("Steps data", () => {
  it("should have 6 steps", () => {
    expect(steps.length).toBe(6);
  });

  it("steps should be numbered sequentially", () => {
    steps.forEach((step, i) => {
      expect(step.number).toBe(i + 1);
    });
  });
});
