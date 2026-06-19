import { describe, it, expect } from "vitest";
import { FrameSchema, GenerateInputSchema } from "./schema";

const frame = {
  traditional: "Read the brief, write a one-pager.",
  builder: "Prototype the riskiest assumption before kickoff.",
  competency: "Hands-on prototyping",
  verdict: "do-it",
  whyClientValues: "Surfaces risk earlier and cheaper.",
  skip: null,
  steps: ["a", "b", "c"],
  prompt: "Here is a brief: [paste]…",
  timebox: "Half a day",
  phaseNote: "In the delivery phase: wire the eval set into CI.",
};

describe("schema", () => {
  it("validates a well-formed frame and a skip-it frame", () => {
    expect(() => FrameSchema.parse(frame)).not.toThrow();
    expect(() => FrameSchema.parse({ ...frame, verdict: "skip-it", skip: "Do the one-pager first." })).not.toThrow();
  });
  it("rejects an unknown verdict", () => {
    expect(() => FrameSchema.parse({ ...frame, verdict: "maybe" })).toThrow();
  });
  it("rejects a frame missing phaseNote", () => {
    const { phaseNote, ...withoutNote } = frame; // `frame` = the valid fixture
    expect(() => FrameSchema.parse(withoutNote)).toThrow();
  });
  it("validates generate input and rejects a bad appetite or non-1-5 level", () => {
    const ok = { trigger: "brief", appetite: "pragmatic", phase: "discovery", situation: "", level: 3, training: false };
    expect(() => GenerateInputSchema.parse(ok)).not.toThrow();
    expect(() => GenerateInputSchema.parse({ ...ok, appetite: "keen" })).toThrow();
    expect(() => GenerateInputSchema.parse({ ...ok, level: 6 })).toThrow();
  });
});
