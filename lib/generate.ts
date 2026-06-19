import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { Frame, FrameSchema, GenerateInput } from "./schema";
import { triggerById, Trigger } from "./triggers";
import { VALTECH, ValtechCompetency } from "./valtech";
import { BUILDER, BuilderCompetency, COLLECTIBLE } from "./builder";

export function buildPrompt(
  input: GenerateInput, t: Trigger, v: ValtechCompetency, b: BuilderCompetency,
): { system: string; user: string } {
  const system = [
    "You are a working tool for product managers at Valtech, a digital product consultancy delivering client work.",
    "Given a work trigger, the client's appetite for new ways of working, and the PM's situation, produce two grounded options.",
    "The 'traditional' option is the established move from Valtech's competency framework for the relevant competency at the PM's level (provided). The 'builder' option is the AI-native move from the Product Builder model for the provided competency.",
    "Be practical and specific. No buzzwords, no selling, no talk of looking modern. Ground the value in client delivery.",
    "If the builder move would not serve THIS client given their appetite, set verdict to 'skip-it' and give the honest alternative (the reliable traditional move).",
    `The competency field must be one of: ${COLLECTIBLE.map((i) => BUILDER[i].short).join(", ")}.`,
    "Tailor the move to the delivery phase (discovery, definition, or delivery): the same trigger calls for a different emphasis at each phase.",
    "Set `phaseNote` to one concrete sentence on how this move shifts in the given delivery phase.",
  ].join("\n");
  const user = [
    `Trigger: ${t.title}`,
    `Mode: ${input.training ? "training scenario (off-client practice)" : "real client work"}`,
    `Client appetite: ${input.appetite}`,
    `Delivery phase: ${input.phase}`,
    `Situation: ${input.situation || "(not specified)"}`,
    `Relevant Valtech competency: ${t.trad} (${v.theme}). At level ${input.level}: ${v.levels[input.level - 1]}`,
    `Target builder skill: ${b.short}. ${b.line}`,
    "Produce the two-option frame.",
  ].join("\n");
  return { system, user };
}

export function fallbackFrame(
  t: Trigger,
  appetite: string,
  phase: "discovery" | "definition" | "delivery",
): Frame {
  const skip = appetite === "conservative" && t.skip;
  return {
    traditional: t.gloss,
    builder: t.builder,
    competency: BUILDER[t.build].short,
    verdict: skip ? "skip-it" : "do-it",
    whyClientValues: t.why,
    skip: t.skip ?? null,
    steps: t.steps,
    prompt: t.prompt,
    timebox: t.timebox,
    phaseNote: t.phaseLens[phase],
  };
}

export async function generateFrame(input: GenerateInput): Promise<Frame> {
  const t = triggerById(input.trigger);
  if (!t) throw new Error("unknown-trigger");
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("no-key");
    const client = new Anthropic();
    const { system, user } = buildPrompt(input, t, VALTECH[t.trad], BUILDER[t.build]);
    const res = await client.beta.messages.parse({
      model: "claude-opus-4-8" as string,
      max_tokens: 16000,
      thinking: { type: "adaptive" } as any,
      output_format: betaZodOutputFormat(FrameSchema),
      system,
      messages: [{ role: "user", content: user }],
      betas: ["output-128k-2025-02-19"],
    });
    if (!res.parsed_output) throw new Error("no-output");
    return res.parsed_output as Frame;
  } catch {
    return fallbackFrame(t, input.appetite, input.phase);
  }
}
