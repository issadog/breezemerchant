import { describe, it, expect } from "vitest";
import { buildPrompt, fallbackFrame } from "./generate";
import { triggerById } from "./triggers";
import { VALTECH } from "./valtech";
import { BUILDER } from "./builder";

const t = triggerById("brief")!;

describe("buildPrompt", () => {
  it("grounds the prompt in both frameworks at the PM's level and flags training", () => {
    const { system, user } = buildPrompt(
      { trigger: "brief", appetite: "ambitious", phase: "discovery", situation: "vague AI ask", level: 2, training: true },
      t, VALTECH[t.trad], BUILDER[t.build],
    );
    expect(system).toContain("Valtech");
    expect(system).toContain("skip-it");
    expect(user).toContain("ambitious");
    expect(user).toContain(VALTECH[t.trad].levels[1]); // level 2 statement
    expect(user).toContain(BUILDER[t.build].short);
    expect(user).toContain("training");
  });
});

describe("fallbackFrame", () => {
  it("returns do-it for a pragmatic client", () => {
    const f = fallbackFrame(t, "pragmatic");
    expect(f.verdict).toBe("do-it");
    expect(f.competency).toBe(BUILDER[t.build].short);
    expect(f.steps.length).toBeGreaterThanOrEqual(2);
  });
  it("returns skip-it for a conservative client when the trigger has a skip", () => {
    const f = fallbackFrame(t, "conservative");
    expect(f.verdict).toBe("skip-it");
    expect(f.skip).toBeTruthy();
  });
});
