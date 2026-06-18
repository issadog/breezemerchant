import { z } from "zod";

export const FrameSchema = z.object({
  traditional: z.string().describe("The established Valtech move, glossed for this situation."),
  builder: z.string().describe("The specific, actionable AI-native move. Not a slogan."),
  competency: z.string().describe("The builder competency short-name this move builds."),
  verdict: z.enum(["do-it", "skip-it"]),
  whyClientValues: z.string().describe("Why this is worth doing, grounded in client delivery value."),
  skip: z.string().nullable().describe("If skip-it: the honest traditional alternative. Else null."),
  steps: z.array(z.string()).min(2).max(4),
  prompt: z.string().describe("A copyable prompt with bracketed blanks."),
  timebox: z.string(),
});
export type Frame = z.infer<typeof FrameSchema>;

export const GenerateInputSchema = z.object({
  trigger: z.string(),
  appetite: z.enum(["conservative", "pragmatic", "ambitious"]),
  phase: z.enum(["discovery", "definition", "delivery"]),
  situation: z.string(),
  level: z.number().int().min(1).max(5),
  training: z.boolean(),
});
export type GenerateInput = z.infer<typeof GenerateInputSchema>;
