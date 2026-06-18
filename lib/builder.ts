export type BuilderCompetency = {
  tier: 1 | 2 | 3;
  short: string;
  line: string;
  tell: string;
};

export const BUILDER: Record<number, BuilderCompetency> = {
  1: {
    tier: 1,
    short: "Problem & customer insight",
    line: "Find real, valuable problems grounded in evidence about users.",
    tell: "can state the problem and the evidence for it without reaching for a solution.",
  },
  2: {
    tier: 1,
    short: "Strategic prioritisation",
    line: "Decide what to do and what to refuse, tied to outcomes.",
    tell: "can name what they're explicitly not doing and why.",
  },
  3: {
    tier: 1,
    short: "Communication & narrative",
    line: "Align people on a direction without relying on authority.",
    tell: "others can retell the direction accurately after one conversation.",
  },
  4: {
    tier: 2,
    short: "AI-accelerated discovery",
    line: "Compress research with AI while keeping ownership of the signal.",
    tell: "uses AI to pre-synthesise, then spends human time testing where the synthesis is wrong.",
  },
  5: {
    tier: 2,
    short: "Rapid delivery & orchestration",
    line: "Tighter build-measure-learn loops; orchestrate AI tools, not only people.",
    tell: "ships a learning loop in days, and can say which tool did which step.",
  },
  6: {
    tier: 3,
    short: "Hands-on prototyping",
    line: "Idea to a working, testable artifact without an engineering handoff.",
    tell: "brings something clickable to the conversation, not a description of it.",
  },
  7: {
    tier: 3,
    short: "AI-native product design",
    line: "Design around what models can and cannot reliably do.",
    tell: "designs the failure path, not just the happy path, for a model-driven feature.",
  },
  8: {
    tier: 3,
    short: "Evaluation & quality",
    line: "Define and measure what 'good' means for outputs that vary.",
    tell: "has a written, re-runnable bar for good vs bad output before scoping the build.",
  },
  9: {
    tier: 3,
    short: "AI judgment & discernment",
    line: "Tell durable shifts from hype; manage the risks AI introduces.",
    tell: "can say, for a specific situation, when the AI-native move is not worth it.",
  },
};

export const TIER_NAME: Record<1 | 2 | 3, string> = {
  1: "Foundations",
  2: "Shifted practices",
  3: "New capabilities",
};

export const COLLECTIBLE: number[] = [4, 5, 6, 7, 8, 9];

export function builderId(label: string): number {
  const e = Object.entries(BUILDER).find(
    ([, v]) => v.short.toLowerCase() === String(label).toLowerCase()
  );
  return e ? Number(e[0]) : 9;
}
