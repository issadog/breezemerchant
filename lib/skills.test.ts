import { describe, it, expect } from "vitest";
import { skillLevel, skillProgress, skillLabel, recommendSkill, REPS_PER_LEVEL } from "./skills";

describe("skills maths", () => {
  it("levels up every REPS_PER_LEVEL reps and caps at 4", () => {
    expect(skillLevel(0)).toBe(0);
    expect(skillLevel(REPS_PER_LEVEL)).toBe(1);
    expect(skillLevel(REPS_PER_LEVEL * 4)).toBe(4);
    expect(skillLevel(99)).toBe(4);
  });
  it("progress is the fraction toward next level, 1 when maxed", () => {
    expect(skillProgress(0)).toBe(0);
    expect(skillProgress(1)).toBeCloseTo(1 / REPS_PER_LEVEL);
    expect(skillProgress(REPS_PER_LEVEL * 4)).toBe(1);
  });
  it("labels not-started, started, and levelled states", () => {
    expect(skillLabel(0)).toBe("Not started");
    expect(skillLabel(1)).toBe("Started");
    expect(skillLabel(REPS_PER_LEVEL)).toContain("Level 1");
  });
  it("recommends the least-developed collectible skill with tie-breaking", () => {
    const skills = { 4: 4, 5: 2, 6: 7, 7: 0, 8: 0, 9: 3 };
    expect(recommendSkill(skills)).toBe(8); // 7 and 8 both 0; order prefers 8
  });
});
