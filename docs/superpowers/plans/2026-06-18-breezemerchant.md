# Product Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Handoff note (read this first)

You're picking this up cold. Read these before starting:
- **Spec (the why):** [`docs/superpowers/specs/2026-06-18-breezemerchant-design.md`](../specs/2026-06-18-breezemerchant-design.md)
- **The authored frameworks (the brain):** [`docs/pov/pm-role-shift-framework.md`](../../pov/pm-role-shift-framework.md)
- **The canonical prototype:** [`prototype/product-builder.html`](../../../prototype/product-builder.html) — a working single-file React app. It is the **source of truth for the domain data (builder model, Valtech excerpt, triggers, scenarios) and the UI markup/logic.** This plan ports that into a real Next.js app and adds the server-side generation the prototype fakes.

**Recommended approach:** `superpowers:subagent-driven-development` (fresh subagent per task + review checkpoint after each).

**Prerequisite — API key:** Tasks 1–7 build and unit-test with **no** API key. Only the live generation route (`lib/generate.ts`) and the Task 8 golden-path demo need a real `ANTHROPIC_API_KEY` in `.env.local`. The deterministic fallback means the app fully works without a key — the key only upgrades the canned frame to a generated one.

**Goal:** An in-the-flow companion where a Valtech PM picks a work moment and gets two grounded options — the traditional Valtech move at their level vs the AI-native Product Builder move — with a client-value verdict, a copyable prompt, skill progression, training scenarios, and move history.

**Architecture:** Single Next.js app. Domain data + logic live in `lib/` (pure, tested). One server-side API route generates the two-option frame with structured output, grounded in both frameworks, with a per-trigger deterministic fallback. The UI is ported from the prototype: an in-memory indicative user, the Trigger→Frame→Move→Track loop, Skills and History views.

**Tech Stack:** Next.js 14 (App Router, TypeScript), React, `@anthropic-ai/sdk`, `zod`, `vitest`. Styling: `valtech.css` + `breezemerchant.css`.

## Global Constraints

- **Model:** `claude-opus-4-8` (exact string; never a date suffix). Thinking: adaptive only (`thinking: {type: "adaptive"}`); never `budget_tokens`. No assistant prefills.
- **API key server-side only** (`process.env.ANTHROPIC_API_KEY`); never in the client bundle. Generation runs in an API route, not the browser.
- **A live demo must never break** — every trigger has deterministic fallback content; the route returns it whenever generation fails or no key is set.
- **Triggers** (exact ids): `brief`, `discovery`, `aifeature`, `stuck`, `update`. Each maps to one Valtech competency (`trad`) and one builder competency id (`build`).
- **Client appetite** (exact values): `conservative`, `pragmatic`, `ambitious`. Drives the client-value verdict.
- **Delivery phase** (exact values): `discovery`, `definition`, `delivery`.
- **Builder model:** competencies `1–9`; Tier 1 = `{1,2,3}` (Foundations, established, not collectible); collectible = `[4,5,6,7,8,9]`. Levels: `Aware, Practising, Proficient, Leading`, advancing every `REPS_PER_LEVEL = 3`.
- **Framework level:** integer `1–5`; set via the header dropdown; selects the Valtech level statement and conditions generation.
- **Verdict:** `do-it` | `skip-it`; `skip-it` only when the AI-native move wouldn't serve the client given appetite + phase, and must carry the honest alternative.
- **Training reps are tagged distinctly** from real client reps in history.
- **Navigation:** the "Product Builder" wordmark is home; the only other destinations are Skills and History. No "Work" tab.
- **Styling:** load `valtech.css` (untouched base) then `breezemerchant.css`; no hardcoded colours in app styles.
- **Port data and UI verbatim from `prototype/product-builder.html`** wherever this plan says "port from the prototype" — do not re-invent content.

---

## File Structure

- `lib/builder.ts` — Product Builder model (9 competencies, tiers, tells), `TIER_NAME`, `COLLECTIBLE`, `builderId`.
- `lib/valtech.ts` — Valtech competency excerpt: name → `{ theme, levels[5] }`.
- `lib/triggers.ts` — `TRIGGERS` (id, title, sub, `trad`, `build`, fallback content, `scenario`), `triggerById`, `builderToTrigger`, `APPETITE`.
- `lib/skills.ts` — `REPS_PER_LEVEL`, `LEVEL_NAME`, `skillLevel`, `skillProgress`, `skillLabel`, `recommendSkill`.
- `lib/schema.ts` — zod `FrameSchema` (the generated two-option output) + `GenerateInputSchema` + types.
- `lib/generate.ts` — `buildPrompt`, `fallbackFrame`, `generateFrame` (server-side Claude call).
- `lib/user.ts` — `NOMI_SEED` + `User` / `Activity` types.
- `app/api/frame/route.ts` — `POST` → frame JSON (generated or fallback).
- `app/styles/valtech.css`, `app/styles/breezemerchant.css` — copied from repo root.
- `app/layout.tsx`, `app/page.tsx` + `app/components/*` — UI ported from the prototype.

---

### Task 1: Scaffold the Next.js app + Valtech styling

**Files:** `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `.env.local.example`, `.gitignore`, `app/layout.tsx`, `app/page.tsx` (placeholder), `app/styles/*`.

**Interfaces:** Produces a runnable dev server (`npm run dev`) and test runner (`npm test`), with the Valtech stylesheets loaded.

- [ ] **Step 1: `package.json`**

```json
{
  "name": "product-builder",
  "version": "0.1.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "test": "vitest run" },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.70.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: `tsconfig.json`** — standard Next.js App Router config with `"paths": { "@/*": ["./*"] }`, `strict: true`, `jsx: "preserve"`, `moduleResolution: "bundler"`.

- [ ] **Step 3: `next.config.mjs`** — `export default {};`

- [ ] **Step 4: `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["lib/**/*.test.ts"] } });
```

- [ ] **Step 5: `.env.local.example`** → `ANTHROPIC_API_KEY=sk-ant-your-key-here`

- [ ] **Step 6: `.gitignore`** → `node_modules/`, `.next/`, `.env.local`, `next-env.d.ts`, `*.tsbuildinfo`

- [ ] **Step 7: Bring in the Valtech stylesheets**

Run: `mkdir -p app/styles && cp valtech.css breezemerchant.css app/styles/`
Expected: both files in `app/styles/`. (Untouched base + app layer; no separate theme file.)

- [ ] **Step 8: `app/layout.tsx`** — import the two stylesheets, set metadata.

```tsx
import "./styles/valtech.css";
import "./styles/breezemerchant.css";
import type { ReactNode } from "react";
export const metadata = { title: "Product Builder", description: "AI-native moves for Valtech PMs." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
```

- [ ] **Step 9: placeholder `app/page.tsx`** → `export default function Page(){ return <main style={{padding:32}}>Product Builder</main>; }`

- [ ] **Step 10: Install and build** — `npm install && npm run build` → succeeds, no type errors.

- [ ] **Step 11: Commit** — `git add … && git commit -m "chore: scaffold Next.js app with Valtech styling"`

---

### Task 2: Domain data modules

**Files:** Create `lib/builder.ts`, `lib/valtech.ts`, `lib/triggers.ts`. Test: `lib/data.test.ts`.

**Interfaces:**
- Produces `BUILDER` (`Record<number, {tier:1|2|3; short:string; line:string; tell:string}>`), `TIER_NAME`, `COLLECTIBLE = [4,5,6,7,8,9]`, `builderId(label): number`.
- `VALTECH` (`Record<string, {theme:string; levels:[string,string,string,string,string]}>`).
- `TRIGGERS` (array; each `{id,title,sub,trad,build,gloss,builder,why,steps,prompt,timebox,skip,scenario,scenAppetite,scenPhase}`), `triggerById`, `builderToTrigger`, `APPETITE`.

- [ ] **Step 1: Write the failing integrity test**

```ts
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
```

- [ ] **Step 2: Run → fails** (`npm test -- data`): cannot find modules.

- [ ] **Step 3: Implement the three modules**

Port `BUILDER`, `TIER_NAME`, `COLLECTIBLE`, `builderId`, `VALTECH`, `TRIGGERS`, `triggerById`, `builderToTrigger`, `APPETITE` **verbatim from `prototype/product-builder.html`** (top of the script). Add TypeScript types and the `tier` typing. The prototype's `BUILDER` already carries `tier/short/line`; the `tell` field is authored in [`docs/pov/pm-role-shift-framework.md`](../../pov/pm-role-shift-framework.md) — copy each competency's tell across so `BUILDER[id].tell` exists. Triggers already carry `gloss/builder/why/steps/prompt/timebox/skip/scenario/scenAppetite/scenPhase`.

- [ ] **Step 4: Run → passes** (`npm test -- data`).

- [ ] **Step 5: Commit** — `git commit -m "feat: add builder, valtech, and trigger domain data"`

---

### Task 3: Skills maths and recommendation

**Files:** Create `lib/skills.ts`. Test: `lib/skills.test.ts`.

**Interfaces:** `REPS_PER_LEVEL = 3`, `LEVEL_NAME`, `skillLevel(reps): 0..4`, `skillProgress(reps): 0..1`, `skillLabel(reps): string`, `recommendSkill(skills: Record<number,number>): number`.

- [ ] **Step 1: Failing test**

```ts
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
```

- [ ] **Step 2: Run → fails.**

- [ ] **Step 3: Implement** — port `REPS_PER_LEVEL`, `LEVEL_NAME`, `skillLevel`, `skillProgress`, `skillLabel`, `recommendSkill` verbatim from the prototype (the `order = [8,7,9,5,4,6]` tie-break must match).

- [ ] **Step 4: Run → passes.**

- [ ] **Step 5: Commit** — `git commit -m "feat: add skill progression maths and recommendation"`

---

### Task 4: Generation schema

**Files:** Create `lib/schema.ts`. Test: `lib/schema.test.ts`.

**Interfaces:**
- `FrameSchema` (zod) and `type Frame` — the generated two-option output: `{ traditional, builder, competency, verdict: "do-it"|"skip-it", whyClientValues, skip: string|null, steps: string[], prompt, timebox }`.
- `GenerateInputSchema` and `type GenerateInput` — `{ trigger: string; appetite: string; phase: string; situation: string; level: number; training: boolean }`.

- [ ] **Step 1: Failing test**

```ts
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
};

describe("schema", () => {
  it("validates a well-formed frame and a skip-it frame", () => {
    expect(() => FrameSchema.parse(frame)).not.toThrow();
    expect(() => FrameSchema.parse({ ...frame, verdict: "skip-it", skip: "Do the one-pager first." })).not.toThrow();
  });
  it("rejects an unknown verdict", () => {
    expect(() => FrameSchema.parse({ ...frame, verdict: "maybe" })).toThrow();
  });
  it("validates generate input and rejects a bad appetite or non-1-5 level", () => {
    const ok = { trigger: "brief", appetite: "pragmatic", phase: "discovery", situation: "", level: 3, training: false };
    expect(() => GenerateInputSchema.parse(ok)).not.toThrow();
    expect(() => GenerateInputSchema.parse({ ...ok, appetite: "keen" })).toThrow();
    expect(() => GenerateInputSchema.parse({ ...ok, level: 6 })).toThrow();
  });
});
```

- [ ] **Step 2: Run → fails.**

- [ ] **Step 3: Implement**

```ts
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
```

- [ ] **Step 4: Run → passes.**

- [ ] **Step 5: Commit** — `git commit -m "feat: add generation schema and input types"`

---

### Task 5: Generation + deterministic fallback

**Files:** Create `lib/generate.ts`. Test: `lib/generate.test.ts`.

**Interfaces:**
- `buildPrompt(input, trigger, valtech, builder): { system: string; user: string }` — pure.
- `fallbackFrame(trigger, appetite): Frame` — deterministic, from trigger content; `skip-it` only when `appetite === "conservative"` and the trigger has a `skip`.
- `generateFrame(input): Promise<Frame>` — structured Claude call; returns `fallbackFrame` on any error.

- [ ] **Step 1: Failing test (pure functions only; network not invoked)**

```ts
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
```

- [ ] **Step 2: Run → fails.**

- [ ] **Step 3: Implement**

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
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

export function fallbackFrame(t: Trigger, appetite: string): Frame {
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
  };
}

export async function generateFrame(input: GenerateInput): Promise<Frame> {
  const t = triggerById(input.trigger);
  if (!t) throw new Error("unknown-trigger");
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("no-key");
    const client = new Anthropic();
    const { system, user } = buildPrompt(input, t, VALTECH[t.trad], BUILDER[t.build]);
    const res = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: zodOutputFormat(FrameSchema) },
      system,
      messages: [{ role: "user", content: user }],
    });
    if (!res.parsed_output) throw new Error("no-output");
    return res.parsed_output;
  } catch {
    return fallbackFrame(t, input.appetite);
  }
}
```

(Add `Trigger`, `ValtechCompetency`, `BuilderCompetency` type exports to their modules in Task 2/3 if not already present.)

- [ ] **Step 4: Run → passes.**

- [ ] **Step 5: Commit** — `git commit -m "feat: add grounded generation with deterministic fallback"`

---

### Task 6: API route

**Files:** Create `app/api/frame/route.ts`.

**Interfaces:** `POST /api/frame` accepting `GenerateInput` JSON → `{ frame: Frame }`. Validates with `GenerateInputSchema`; returns `400 {error:"bad-input"}` on validation failure. `generateFrame` never throws (it falls back), so success always returns a frame.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server";
import { GenerateInputSchema } from "@/lib/schema";
import { generateFrame } from "@/lib/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad-input" }, { status: 400 }); }
  const parsed = GenerateInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad-input" }, { status: 400 });
  const frame = await generateFrame(parsed.data);
  return NextResponse.json({ frame });
}
```

- [ ] **Step 2: Build** — `npm run build` → `/api/frame` in the route list.

- [ ] **Step 3: Commit** — `git commit -m "feat: add /api/frame generation route"`

---

### Task 7: UI — port the prototype to Next.js

**Files:** Replace `app/page.tsx`; create `app/components/{App,Work,Skills,History,PromptBox,Ring}.tsx` (or a structure of your choosing). Mark client components with `"use client"`.

**Canonical reference:** [`prototype/product-builder.html`](../../../prototype/product-builder.html). Port its component tree, state, and **all `bm`/Valtech class names + the `Style` rules into `breezemerchant.css`** (move the prototype's remapped CSS into the stylesheet rather than an inline `<style>`). The prototype is the source of truth for markup and behaviour. The only behavioural change from the prototype: the result view fetches from **`POST /api/frame`** instead of calling the model in the browser.

**Interfaces:** Consumes `BUILDER`, `VALTECH`, `TRIGGERS`, `triggerById`, `builderToTrigger`, `APPETITE`, `skillLabel`/`skillLevel`/`skillProgress`/`recommendSkill`/`REPS_PER_LEVEL` from `lib/`; `NOMI_SEED` from `lib/user.ts`; `Frame` from `lib/schema.ts`; `POST /api/frame`.

- [ ] **Step 1: Create `lib/user.ts`** — port `NOMI_SEED` + `User`/`Activity` types from the prototype. An `Activity` carries `{ build, trigger, taken, training, when, ctx?, shownLevel?, result?: Frame & {competency} }`.

- [ ] **Step 2: Port the App shell** (`app/page.tsx` + `App`) — in-memory user state (`useState`), `tab` ∈ `work|skills|history`, `homeNonce`, `launch`. Header: **wordmark = home** (`goHome` sets tab `work` + bumps `homeNonce`); username + **framework-level dropdown** (`setLevel`); nav buttons **Skills** and **History** only.

- [ ] **Step 3: Port the Work view** — home (triggers + "Generate a training scenario" + recommended-next), setup (appetite, phase, situation textarea, **document upload** reading text files client-side), gen (spinner), result (the two-option fork with level pips, why, steps, `PromptBox`, log/skip). Replace the prototype's `callClaude` flow with a `fetch("/api/frame", { method: "POST", body: JSON.stringify({ trigger, appetite, phase, situation, level, training }) })`; on network failure, call a client copy of the canned content is unnecessary — the route already falls back, so just surface an error toast if the request itself fails.

- [ ] **Step 4: Port Skills** — profile stats, build-next (real) + practise (training) cards, skill grid by tier with `Ring`, Foundations chips, "see full history" link.

- [ ] **Step 5: Port History** — expandable entries (`<details>`) showing the captured `result` (both options, verdict, steps, prompt) and a `practice` tag for training moves; graceful fallback for entries with no captured advice.

- [ ] **Step 6: Move the prototype's CSS into `breezemerchant.css`** — append the `bm`/component rules (re-mapped to `--vt-*` tokens) so the components are styled by the shared stylesheet, not an inline block.

- [ ] **Step 7: Build** — `npm run build` → succeeds, no type errors.

- [ ] **Step 8: Commit** — `git commit -m "feat: port the Product Builder UI to Next.js"`

---

### Task 8: Golden-path manual verification

**Files:** Create `docs/superpowers/plans/manual-verification.md`.

- [ ] **Step 1: Env** — `cp .env.local.example .env.local`, add a real `ANTHROPIC_API_KEY` (optional — the app works without it via fallback).
- [ ] **Step 2: `npm run dev`** → `http://localhost:3000`.
- [ ] **Step 3: Trigger→Frame→Move→Track** — pick "A new brief landed", set appetite + phase + a one-line situation, generate, confirm the two options render with the traditional statement at your level and an actionable AI-native move; log as done.
- [ ] **Step 4: Verdict flips** — re-run with appetite **conservative** and confirm a **skip-it** verdict with the honest alternative; with **pragmatic/ambitious** confirm **do-it**.
- [ ] **Step 5: Level re-levels** — change the header framework level and confirm the traditional column's statement changes.
- [ ] **Step 6: Training** — "Generate a training scenario", confirm a realistic scenario pre-fills, take the move, confirm a **practice** rep lands in Skills + History.
- [ ] **Step 7: Upload** — attach a `.txt`/`.md` brief in setup, confirm it loads into the situation.
- [ ] **Step 8: History** — open History, confirm the logged moves show with the advice as it was, practice tagged distinctly.
- [ ] **Step 9: Nav** — click the **Product Builder** wordmark from any screen and confirm it returns home.
- [ ] **Step 10: Write the demo script** to `manual-verification.md` (the exact trigger/appetite used for the live demo). Commit.

---

## Self-Review

**Spec coverage:**
- §3 Trigger/Frame/Move/Track → Tasks 2 (triggers), 5–6 (frame generation), 7 (UI loop), 3 (track/skills).
- §4 Inputs (trigger, appetite, phase, situation+upload, framework level) → Tasks 2, 5, 7.
- §5 Two-option frame + client-value verdict → Tasks 4 (schema), 5 (generation + fallback verdict), 7 (view).
- §6 Features: triggers (2), context capture + upload (7), two-option frame + verdict + move (5,7), logging (7), skills progression (3,7), training scenarios (2 data, 5 prompt flag, 7 UI), move history (7), navigation (7), user model (lib/user.ts).
- §7 Architecture (Next.js, server-side key, structured generation, fallback, Valtech styling) → Tasks 1, 5, 6, 7.
- §8 Error handling (fallback on unreachable/malformed, upload note, loading) → Tasks 5, 6, 7.
- §9 Testing (data integrity, skill maths, recommendation, schema, generation/fallback, golden path) → Tasks 2, 3, 4, 5, 8.

**Port fidelity:** the prototype is the source of truth for domain data, the `order` tie-break in `recommendSkill`, trigger/scenario content, and UI markup/classes. The plan's net-new code over the prototype is: TypeScript types, the zod schemas, the server-side `generateFrame` + route, and moving CSS into `breezemerchant.css`.

**Type consistency:** `Frame` / `GenerateInput` (Task 4) are consumed by `generate.ts` (5), the route (6), and the UI (7). `Trigger` / `ValtechCompetency` / `BuilderCompetency` types are exported from Task 2/3 modules and consumed by `buildPrompt` (5). The `Activity.result` type reuses `Frame`.

**No placeholders:** data and UI steps point at the committed prototype for verbatim content rather than restating ~200 lines; all net-new logic (schema, generate, route, tests) is shown in full.
