import { describe, it, expect } from "vitest";
import { BUILDER, COLLECTIBLE, builderId } from "./builder";
import { VALTECH } from "./valtech";
import { TRIGGERS, triggerById, builderToTrigger } from "./triggers";

describe("domain data integrity", () => {
  it("has 9 builder competencies with tier and tell, collectible = tiers 2-3", () => {
    expect(Object.keys(BUILDER)).toHaveLength(9);
    for (const v of Object.values(BUILDER)) {
      expect([1, 2, 3]).toContain(v.tier);
      expect(v.tell.length).toBeGreaterThan(0);
    }
    expect(COLLECTIBLE).toEqual([4, 5, 6, 7, 8, 9]);
    expect(COLLECTIBLE.every((id) => BUILDER[id].tier !== 1)).toBe(true);
  });

  it("every Valtech competency has a theme and exactly 5 levels", () => {
    for (const v of Object.values(VALTECH)) {
      expect(v.levels).toHaveLength(5);
      expect(v.theme.length).toBeGreaterThan(0);
    }
  });

  it("every trigger maps to a real Valtech competency and a real builder competency", () => {
    for (const t of TRIGGERS) {
      expect(VALTECH[t.trad]).toBeDefined();
      expect(BUILDER[t.build]).toBeDefined();
      expect(t.scenario.length).toBeGreaterThan(0);
    }
  });

  it("builderToTrigger points every collectible skill at a real trigger", () => {
    for (const id of COLLECTIBLE) {
      expect(triggerById(builderToTrigger[id])).toBeDefined();
    }
  });

  it("builderId resolves a short name back to its id", () => {
    expect(builderId(BUILDER[8].short)).toBe(8);
  });
});
