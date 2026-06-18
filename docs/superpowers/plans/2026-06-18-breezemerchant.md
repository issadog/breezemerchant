# breezemerchant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Handoff note (read this first)

You're picking this up cold — the design conversation lived in another session, so the
"why" is in the spec, not in your head. Skim the companion docs before starting:

- **Spec (the why):** [`docs/superpowers/specs/2026-06-18-breezemerchant-design.md`](../specs/2026-06-18-breezemerchant-design.md)
- **The authored POV framework (the product's brain):** [`docs/pov/pm-role-shift-framework.md`](../../pov/pm-role-shift-framework.md)

**Recommended approach:** kick this off with `superpowers:subagent-driven-development`
(fresh subagent per task + a review checkpoint after each one). It catches any
misread of the spec at the task it happens rather than letting it compound — which
matters most when you didn't write the plan.

**Prerequisite — API key:** Tasks 1–7 build and unit-test with **no** API key.
Only the live Claude call (`lib/analyze.ts`) and the Task 8 golden-path demo need a
real `ANTHROPIC_API_KEY` in `.env.local` (copy `.env.local.example`). Don't get
blocked at the finish line — have a key ready before Task 8.

**Goal:** A Valtech-internal web app where a PM enters a live client-context URL plus engagement type and project phase, and gets a structured briefing — grounded in an authored PM role-shift framework — on where to focus their mindset and skills to show up as a Product Builder at that client.

**Architecture:** Single Next.js (App Router) app. One client form posts to one API route. The route fetches the URL server-side, extracts readable text, then makes one structured Claude call that maps the real signals onto the authored POV framework (loaded from a markdown file at request time). The validated JSON briefing renders into a focused, sectioned view. No chat; structured in, structured out.

**Tech Stack:** Next.js 14 (App Router, TypeScript), `@anthropic-ai/sdk`, `@mozilla/readability` + `jsdom` for extraction, `zod` for the briefing schema, `vitest` for tests.

## Global Constraints

- **Model:** `claude-opus-4-8` (exact string; never append a date suffix).
- **Thinking:** adaptive only — `thinking: {type: "adaptive"}`. Never use `budget_tokens` (400 on Opus 4.8).
- **No assistant prefills** (400 on Opus 4.8). Use structured outputs to shape the response.
- **API key** must stay server-side. Read from `process.env.ANTHROPIC_API_KEY`; never expose to the client bundle.
- **Engagement types** (exact option values): `greenfield` ("Greenfield build"), `modernization` ("Legacy modernization"), `advisory` ("Advisory").
- **Project phases** (exact option values): `discovery` ("Discovery"), `delivery` ("Delivery"), `scaling` ("Scaling").
- **Client posture** (exact option values): `conservative` ("Conservative"), `pragmatic` ("Pragmatic"), `forward` ("Forward-thinking"). Strategic dial — how hard to push the builder/AI-PM agenda.
- **Competency themes** (the four Valtech themes, exact keys): `vision` ("Vision & strategy"), `discovery` ("Discovery"), `execution` ("Execution"), `consulting` ("Consulting").
- **Competency levels** (exact option values, per theme): `developing` ("Developing"), `proficient` ("Proficient"), `advanced` ("Advanced"). Developmental dial — how much to stretch the PM.
- **POV framework file:** `docs/pov/pm-role-shift-framework.md` (already exists). Loaded at request time; editing it changes behavior with no code change.
- **The briefing surfaces only the 2–3 most relevant shift dimensions** for the chosen engagement + phase — focus over completeness.
- **Each dimension anchors to exactly one competency theme** (`vision` | `discovery` | `execution` | `consulting`); its skill move is tuned to the PM's rating on that theme.
- Each recommended move has two parts: a **mindset shift** and a **concrete skill**.
- **Consulting is cross-cutting:** when the PM's `consulting` rating is `advanced`, every move gains a coaching layer ("coach the client team"); when `developing`, it flips to "do it yourself first."
- **Styling:** load `valtech.css` (repo root — design tokens + embedded fonts, untouched) then `breezemerchant.css` (app component layer, built only from `--vt-*` tokens). Light "paper" theme, coral accent. No hardcoded colours in app styles.

---

### Task 1: Scaffold the Next.js app

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `.env.local.example`, `.gitignore`
- Create: `app/layout.tsx`, `app/page.tsx` (placeholder), `app/globals.css`

**Interfaces:**
- Produces: a runnable Next.js dev server (`npm run dev`) and a working test runner (`npm test`).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "breezemerchant",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.70.0",
    "@mozilla/readability": "^0.5.0",
    "jsdom": "^25.0.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/jsdom": "^21.1.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Create `.env.local.example`**

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
.next/
.env.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Bring the Valtech stylesheets into the app**

`valtech.css` and `breezemerchant.css` already live at the repo root. Copy them into the app's
styles folder so Next.js can import them (Next global CSS must be imported from within the app):

Run: `mkdir -p app/styles && cp valtech.css breezemerchant.css app/styles/`
Expected: both files present in `app/styles/`.

(`valtech.css` is the untouched design-system base — tokens + embedded fonts. `breezemerchant.css`
is the app layer built from `--vt-*` tokens. Do not add a separate theme file; these two are the styling.)

- [ ] **Step 8: Create `app/layout.tsx`**

```tsx
import "./styles/valtech.css";
import "./styles/breezemerchant.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "breezemerchant",
  description: "Cut the hype. Show up as a Product Builder.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Create placeholder `app/page.tsx`**

```tsx
export default function Page() {
  return <main style={{ padding: 32 }}>breezemerchant</main>;
}
```

- [ ] **Step 10: Install and verify the dev server boots**

Run: `npm install && npm run build`
Expected: build completes with no type errors; `.next/` produced.

- [ ] **Step 11: Commit**

```bash
git add package.json tsconfig.json next.config.mjs vitest.config.ts .env.local.example .gitignore app/
git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: Briefing schema and shared types

**Files:**
- Create: `lib/schema.ts`
- Test: `lib/schema.test.ts`

**Interfaces:**
- Produces:
  - `ENGAGEMENT_TYPES`, `PHASES`, `POSTURES`, `COMPETENCY_LEVELS`, `COMPETENCY_THEMES`: each `readonly {value: string; label: string}[]`
  - `BriefingSchema` (zod) and `type Briefing = z.infer<typeof BriefingSchema>` — dimensions carry `anchorTheme`, `howToPlay`, and a nullable `coachingNote`
  - `AnalyzeInputSchema` (zod) with fields `{ text, engagement, phase, posture, competency }` where `competency` is `{ vision, discovery, execution, consulting }` of level values; and `type AnalyzeInput`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import {
  BriefingSchema,
  AnalyzeInputSchema,
  ENGAGEMENT_TYPES,
  PHASES,
  POSTURES,
  COMPETENCY_LEVELS,
  COMPETENCY_THEMES,
} from "./schema";

const validCompetency = {
  vision: "proficient",
  discovery: "developing",
  execution: "advanced",
  consulting: "proficient",
};

describe("schema", () => {
  it("exposes the fixed option lists", () => {
    expect(ENGAGEMENT_TYPES.map((o) => o.value)).toEqual(["greenfield", "modernization", "advisory"]);
    expect(PHASES.map((o) => o.value)).toEqual(["discovery", "delivery", "scaling"]);
    expect(POSTURES.map((o) => o.value)).toEqual(["conservative", "pragmatic", "forward"]);
    expect(COMPETENCY_LEVELS.map((o) => o.value)).toEqual(["developing", "proficient", "advanced"]);
    expect(COMPETENCY_THEMES.map((o) => o.value)).toEqual(["vision", "discovery", "execution", "consulting"]);
  });

  it("validates a well-formed briefing", () => {
    const briefing = {
      clientName: "Acme",
      oneLineRead: "Real delivery maturity, discovery is hype.",
      dimensions: [
        {
          name: "Discovery → Sensing",
          anchorTheme: "discovery",
          signal: "They mention weekly user interviews.",
          hypeToDiscount: "Generic 'data-driven' claims.",
          howToPlay: "Anchor the AI assist to a number they trust.",
          baselineCompetency: "Using qualitative data",
          mindsetMove: "Treat discovery as continuous.",
          skillMove: "Set up an AI-assisted signal digest.",
          coachingNote: "Hand the digest method to their team to own.",
        },
      ],
      breezemerchantRead: "Mostly real; watch the discovery theatre.",
    };
    expect(() => BriefingSchema.parse(briefing)).not.toThrow();
  });

  it("allows a null coachingNote and rejects an unknown anchorTheme", () => {
    const base = {
      name: "Spec → Build",
      anchorTheme: "execution",
      signal: "s",
      hypeToDiscount: "h",
      howToPlay: "p",
      baselineCompetency: "Articulating requirements",
      mindsetMove: "m",
      skillMove: "k",
      coachingNote: null,
    };
    const ok = { clientName: "A", oneLineRead: "x", dimensions: [base], breezemerchantRead: "y" };
    expect(() => BriefingSchema.parse(ok)).not.toThrow();
    expect(() =>
      BriefingSchema.parse({ ...ok, dimensions: [{ ...base, anchorTheme: "marketing" }] }),
    ).toThrow();
  });

  it("rejects a briefing with zero dimensions", () => {
    expect(() =>
      BriefingSchema.parse({ clientName: "Acme", oneLineRead: "x", dimensions: [], breezemerchantRead: "y" }),
    ).toThrow();
  });

  it("validates analyze input and rejects empty text or bad competency", () => {
    expect(() =>
      AnalyzeInputSchema.parse({
        text: "hello world",
        engagement: "greenfield",
        phase: "discovery",
        posture: "pragmatic",
        competency: validCompetency,
      }),
    ).not.toThrow();
    expect(() =>
      AnalyzeInputSchema.parse({
        text: "",
        engagement: "greenfield",
        phase: "discovery",
        posture: "pragmatic",
        competency: validCompetency,
      }),
    ).toThrow();
    expect(() =>
      AnalyzeInputSchema.parse({
        text: "ok",
        engagement: "greenfield",
        phase: "discovery",
        posture: "pragmatic",
        competency: { ...validCompetency, vision: "expert" },
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- schema`
Expected: FAIL — cannot find module `./schema`.

- [ ] **Step 3: Write the implementation**

```ts
import { z } from "zod";

export const ENGAGEMENT_TYPES = [
  { value: "greenfield", label: "Greenfield build" },
  { value: "modernization", label: "Legacy modernization" },
  { value: "advisory", label: "Advisory" },
] as const;

export const PHASES = [
  { value: "discovery", label: "Discovery" },
  { value: "delivery", label: "Delivery" },
  { value: "scaling", label: "Scaling" },
] as const;

export const POSTURES = [
  { value: "conservative", label: "Conservative" },
  { value: "pragmatic", label: "Pragmatic" },
  { value: "forward", label: "Forward-thinking" },
] as const;

export const COMPETENCY_LEVELS = [
  { value: "developing", label: "Developing" },
  { value: "proficient", label: "Proficient" },
  { value: "advanced", label: "Advanced" },
] as const;

export const COMPETENCY_THEMES = [
  { value: "vision", label: "Vision & strategy" },
  { value: "discovery", label: "Discovery" },
  { value: "execution", label: "Execution" },
  { value: "consulting", label: "Consulting" },
] as const;

const values = (opts: readonly { value: string }[]) =>
  opts.map((o) => o.value) as [string, ...string[]];

const engagementValues = values(ENGAGEMENT_TYPES);
const phaseValues = values(PHASES);
const postureValues = values(POSTURES);
const levelEnum = z.enum(values(COMPETENCY_LEVELS));
const themeEnum = z.enum(values(COMPETENCY_THEMES));

export const CompetencySchema = z.object({
  vision: levelEnum,
  discovery: levelEnum,
  execution: levelEnum,
  consulting: levelEnum,
});

export const DimensionSchema = z.object({
  name: z.string().describe("The shift dimension name, e.g. 'Discovery → Sensing'."),
  anchorTheme: themeEnum.describe("The single Valtech competency theme this dimension evolves from."),
  signal: z
    .string()
    .describe("What this client's real text signals on this dimension; quote where possible."),
  hypeToDiscount: z
    .string()
    .describe("The breeze-merchant version of this dimension, and why it does not apply here."),
  howToPlay: z
    .string()
    .describe("Guidance tuned to the client's posture — how hard to push the builder agenda here."),
  baselineCompetency: z
    .string()
    .describe("The relevant Valtech 'today' competency this evolves from."),
  mindsetMove: z.string().describe("One mindset shift for this PM in this phase."),
  skillMove: z
    .string()
    .describe("One concrete skill to practise, tuned to the PM's level on this dimension's anchor theme."),
  coachingNote: z
    .string()
    .nullable()
    .describe(
      "Coaching layer: present (a 'coach the client team' action) when the PM's consulting level is advanced; null otherwise.",
    ),
});

export const BriefingSchema = z.object({
  clientName: z.string().describe("Best-guess client/company name from the context."),
  oneLineRead: z.string().describe("A single sharp sentence summarising the read."),
  dimensions: z
    .array(DimensionSchema)
    .min(1)
    .max(3)
    .describe("Only the 2-3 dimensions that matter most for this engagement and phase."),
  breezemerchantRead: z
    .string()
    .describe("Meta hype-resistance summary: where this client is real vs noise, tuned to posture."),
});

export type Briefing = z.infer<typeof BriefingSchema>;
export type Competency = z.infer<typeof CompetencySchema>;

export const AnalyzeInputSchema = z.object({
  text: z.string().min(1),
  engagement: z.enum(engagementValues),
  phase: z.enum(phaseValues),
  posture: z.enum(postureValues),
  competency: CompetencySchema,
});

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- schema`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/schema.ts lib/schema.test.ts
git commit -m "feat: add briefing schema and shared input types"
```

---

### Task 3: URL fetch and text extraction

**Files:**
- Create: `lib/extract.ts`
- Test: `lib/extract.test.ts`
- Test fixture: `lib/__fixtures__/job-posting.html`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `extractReadableText(html: string, url: string): string` — pure function; strips a full HTML document to readable text. Throws `Error` with message `"too-thin"` if the result is under 200 characters.
  - `fetchUrlText(url: string): Promise<string>` — fetches the URL (10s timeout, 2MB cap) and returns `extractReadableText(...)`. Throws `Error` with message `"fetch-failed"` on any network/HTTP failure.

- [ ] **Step 1: Create the test fixture `lib/__fixtures__/job-posting.html`**

```html
<!doctype html>
<html>
  <head><title>Senior Product Manager — Acme</title></head>
  <body>
    <nav>Home About Careers</nav>
    <article>
      <h1>Senior Product Manager</h1>
      <p>Acme is hiring a Senior Product Manager to lead continuous discovery
      across our platform. You will run weekly user interviews, work closely with
      data, and prototype ideas with our design and engineering teams. We value
      experimentation and killing work fast. Experience with agentic workflows and
      AI-assisted delivery is a strong plus.</p>
      <p>You will own outcomes, not output, and help us move fast on signal.</p>
    </article>
    <footer>Copyright Acme</footer>
  </body>
</html>
```

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { extractReadableText } from "./extract";

const fixture = readFileSync(join(__dirname, "__fixtures__/job-posting.html"), "utf8");

describe("extractReadableText", () => {
  it("pulls the article body and drops nav/footer chrome", () => {
    const text = extractReadableText(fixture, "https://example.com/jobs/123");
    expect(text).toContain("continuous discovery");
    expect(text).toContain("agentic workflows");
    expect(text).not.toContain("Home About Careers");
  });

  it("throws 'too-thin' when there is almost no text", () => {
    expect(() => extractReadableText("<html><body><p>hi</p></body></html>", "https://x.com")).toThrow(
      "too-thin",
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- extract`
Expected: FAIL — cannot find module `./extract`.

- [ ] **Step 4: Write the implementation**

```ts
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const MIN_CHARS = 200;
const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 10_000;

export function extractReadableText(html: string, url: string): string {
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  const text = (article?.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text.length < MIN_CHARS) {
    throw new Error("too-thin");
  }
  return text;
}

export async function fetchUrlText(url: string): Promise<string> {
  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "breezemerchant/0.1 (+internal Valtech tool)" },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new Error("too-large");
    html = new TextDecoder().decode(buf);
  } catch {
    throw new Error("fetch-failed");
  }
  return extractReadableText(html, url);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- extract`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/extract.ts lib/extract.test.ts lib/__fixtures__/job-posting.html
git commit -m "feat: add URL fetch and readable-text extraction"
```

---

### Task 4: POV framework loader

**Files:**
- Create: `lib/pov.ts`
- Test: `lib/pov.test.ts`

**Interfaces:**
- Consumes: the existing file `docs/pov/pm-role-shift-framework.md`.
- Produces: `loadPovFramework(): string` — reads the framework markdown from disk and returns its contents. Throws if the file is missing.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { loadPovFramework } from "./pov";

describe("loadPovFramework", () => {
  it("loads the authored framework and includes the shift dimensions", () => {
    const pov = loadPovFramework();
    expect(pov).toContain("Discovery → Sensing");
    expect(pov).toContain("Hype-resistance");
    expect(pov.length).toBeGreaterThan(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- pov`
Expected: FAIL — cannot find module `./pov`.

- [ ] **Step 3: Write the implementation**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

const POV_PATH = join(process.cwd(), "docs/pov/pm-role-shift-framework.md");

export function loadPovFramework(): string {
  return readFileSync(POV_PATH, "utf8");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- pov`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add lib/pov.ts lib/pov.test.ts
git commit -m "feat: load the authored POV framework at request time"
```

---

### Task 5: Analysis module (the Claude call)

**Files:**
- Create: `lib/analyze.ts`
- Test: `lib/analyze.test.ts`

**Interfaces:**
- Consumes: `AnalyzeInput`, `Briefing`, `BriefingSchema` from `lib/schema.ts`; `loadPovFramework` from `lib/pov.ts`; `ENGAGEMENT_TYPES`, `PHASES` from `lib/schema.ts`.
- Produces:
  - `buildPrompt(input: AnalyzeInput, pov: string): { system: string; user: string }` — pure function assembling the prompt. Testable without the network.
  - `analyze(input: AnalyzeInput): Promise<Briefing>` — makes the structured Claude call and returns a validated `Briefing`.

**Notes on the Claude call (from the claude-api skill):**
- Use `@anthropic-ai/sdk` with `client.messages.parse({ ..., output_config: { format: zodOutputFormat(BriefingSchema) } })`. Structured outputs guarantee the response matches the schema, so no manual JSON parsing or escaping handling is needed.
- Model `claude-opus-4-8`; `thinking: { type: "adaptive" }`; `output_config.effort: "medium"` for a reasonable demo latency/quality balance.
- `response.parsed_output` is the validated object (may be `null` only on refusal/`max_tokens`); guard it.

- [ ] **Step 1: Write the failing test (prompt assembly — pure, no network)**

```ts
import { describe, it, expect } from "vitest";
import { buildPrompt } from "./analyze";

const input = {
  text: "We run weekly agent-evals against our PDLC.",
  engagement: "modernization" as const,
  phase: "delivery" as const,
  posture: "forward" as const,
  competency: {
    vision: "proficient" as const,
    discovery: "developing" as const,
    execution: "advanced" as const,
    consulting: "advanced" as const,
  },
};

describe("buildPrompt", () => {
  it("embeds the POV and the conditioning rules in the system prompt", () => {
    const { system } = buildPrompt(input, "POV-FRAMEWORK-CONTENTS");
    expect(system).toContain("POV-FRAMEWORK-CONTENTS");
    expect(system).toContain("2-3");
    expect(system).toContain("anchorTheme");
    expect(system).toContain("howToPlay");
    expect(system).toContain("coachingNote");
  });

  it("embeds the labelled inputs and per-theme levels in the user message", () => {
    const { user } = buildPrompt(input, "POV");
    expect(user).toContain("Legacy modernization");
    expect(user).toContain("Delivery");
    expect(user).toContain("Forward-thinking");
    expect(user).toContain("weekly agent-evals");
    expect(user).toContain("Discovery: Developing");
    expect(user).toContain("Execution: Advanced");
    expect(user).toContain("Consulting: Advanced");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- analyze`
Expected: FAIL — cannot find module `./analyze`.

- [ ] **Step 3: Write the implementation**

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  AnalyzeInput,
  Briefing,
  BriefingSchema,
  ENGAGEMENT_TYPES,
  PHASES,
  POSTURES,
  COMPETENCY_LEVELS,
  COMPETENCY_THEMES,
} from "./schema";
import { loadPovFramework } from "./pov";

function labelFor(options: readonly { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function buildPrompt(input: AnalyzeInput, pov: string): { system: string; user: string } {
  const engagementLabel = labelFor(ENGAGEMENT_TYPES, input.engagement);
  const phaseLabel = labelFor(PHASES, input.phase);
  const postureLabel = labelFor(POSTURES, input.posture);
  const levelLabel = (v: string) => labelFor(COMPETENCY_LEVELS, v);

  const competencyLines = COMPETENCY_THEMES.map(
    (t) => `- ${t.label}: ${levelLabel(input.competency[t.value as keyof AnalyzeInput["competency"]])}`,
  ).join("\n");

  const system = [
    "You are breezemerchant — Valtech's internal antidote to PM hype ('breeze merchants').",
    "You help a Product Manager work out where to focus their mindset and skills to show up",
    "as a 'Product Builder' / AI-PM at a specific client. You are sharp, specific, and allergic",
    "to LinkedIn-style platitudes.",
    "",
    "Below is Valtech's authored POV framework. It has two halves: a 'today' competency baseline",
    "(four themes: Vision & strategy, Discovery, Execution, Consulting) and a set of future-vector",
    "shift dimensions. Map the client's REAL signals onto this model. Do not invent the framework.",
    "",
    "=== POV FRAMEWORK ===",
    pov,
    "=== END POV FRAMEWORK ===",
    "",
    "Rules for the briefing:",
    "- Surface ONLY the 2-3 shift dimensions that matter most for the given engagement type and phase.",
    "- For each dimension set `anchorTheme` to the single competency theme it most evolves from",
    "  (vision | discovery | execution | consulting).",
    "- `signal`: quote or paraphrase the client's real text. `hypeToDiscount`: the breeze-merchant",
    "  version and why it doesn't apply here. `baselineCompetency`: the relevant 'today' competency.",
    "- `howToPlay`: tune to the client's POSTURE. Conservative → push quietly, let results not labels",
    "  make the case, avoid over-evangelising AI. Pragmatic → pair every bold move with a number or",
    "  guardrail. Forward-thinking → lead with the boldest version; under-reaching is the risk.",
    "- `mindsetMove` + `skillMove`: framed for the PHASE. Tune the skill move's DEPTH to the PM's level",
    "  on THIS dimension's anchorTheme — developing → scaffold the habit (smaller first step, more",
    "  support); proficient → apply the practice directly; advanced → stretch toward leading/owning it.",
    "- `coachingNote`: if the PM's CONSULTING level is 'advanced', add a concrete 'coach the client team'",
    "  action for this dimension (modelling & coaching is the Consulting competency). If 'developing',",
    "  set it to a short 'build this in yourself before you coach it' note. If 'proficient', use null.",
    "- `breezemerchantRead`: a short, honest meta-summary of where this client is real vs noise,",
    "  with its closing stance tuned to the posture.",
    "- Be concrete. No platitudes.",
  ].join("\n");

  const user = [
    `Engagement type: ${engagementLabel}`,
    `Project phase: ${phaseLabel}`,
    `Client posture toward builders / AI-PMs: ${postureLabel}`,
    "",
    "The PM's current Valtech competency levels:",
    competencyLines,
    "",
    "Client context (extracted from a live page, or pasted):",
    '"""',
    input.text,
    '"""',
    "",
    "Produce the briefing.",
  ].join("\n");

  return { system, user };
}

export async function analyze(input: AnalyzeInput): Promise<Briefing> {
  const pov = loadPovFramework();
  const { system, user } = buildPrompt(input, pov);
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: zodOutputFormat(BriefingSchema) },
    system,
    messages: [{ role: "user", content: user }],
  });

  if (!response.parsed_output) {
    throw new Error("analysis-failed");
  }
  return response.parsed_output;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- analyze`
Expected: PASS (1 test). (Only `buildPrompt` is unit-tested; `analyze` is covered by the golden-path manual run in Task 8.)

- [ ] **Step 5: Commit**

```bash
git add lib/analyze.ts lib/analyze.test.ts
git commit -m "feat: add structured Claude analysis mapping context onto the POV"
```

---

### Task 6: API route

**Files:**
- Create: `app/api/analyze/route.ts`

**Interfaces:**
- Consumes: `fetchUrlText` from `lib/extract.ts`; `analyze` from `lib/analyze.ts`; `AnalyzeInputSchema` from `lib/schema.ts`.
- Produces: `POST /api/analyze` accepting JSON `{ url?: string; text?: string; engagement: string; phase: string }`. Returns `{ briefing }` on success or `{ error: "fetch-failed" | "too-thin" | "bad-input" | "analysis-failed" }` with the appropriate status.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server";
import { fetchUrlText } from "@/lib/extract";
import { analyze } from "@/lib/analyze";
import { AnalyzeInputSchema, ENGAGEMENT_TYPES, PHASES } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const engagementValues = ENGAGEMENT_TYPES.map((o) => o.value);
const phaseValues = PHASES.map((o) => o.value);

export async function POST(req: Request) {
  let body: {
    url?: string;
    text?: string;
    engagement?: string;
    phase?: string;
    posture?: string;
    competency?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-input" }, { status: 400 });
  }

  const { url, text, engagement, phase, posture, competency } = body;
  if (
    !engagement ||
    !phase ||
    !engagementValues.includes(engagement) ||
    !phaseValues.includes(phase)
  ) {
    return NextResponse.json({ error: "bad-input" }, { status: 400 });
  }

  // Resolve the client text: prefer pasted text; otherwise fetch the URL.
  let clientText: string;
  try {
    if (text && text.trim().length > 0) {
      clientText = text.trim();
      if (clientText.length < 200) {
        return NextResponse.json({ error: "too-thin" }, { status: 422 });
      }
    } else if (url && url.trim().length > 0) {
      clientText = await fetchUrlText(url.trim());
    } else {
      return NextResponse.json({ error: "bad-input" }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch-failed";
    const status = msg === "too-thin" ? 422 : 502;
    return NextResponse.json({ error: msg === "too-thin" ? "too-thin" : "fetch-failed" }, { status });
  }

  const parsed = AnalyzeInputSchema.safeParse({
    text: clientText,
    engagement,
    phase,
    posture,
    competency,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "bad-input" }, { status: 400 });
  }

  try {
    const briefing = await analyze(parsed.data);
    return NextResponse.json({ briefing });
  } catch {
    return NextResponse.json({ error: "analysis-failed" }, { status: 502 });
  }
}
```

- [ ] **Step 2: Verify it type-checks and builds**

Run: `npm run build`
Expected: build succeeds; `/api/analyze` appears in the route list.

- [ ] **Step 3: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: add /api/analyze route with fetch + paste fallback"
```

---

### Task 7: Input form and briefing view

**Files:**
- Create: `app/page.tsx` (replace the placeholder)
- Create: `app/components/InputForm.tsx`
- Create: `app/components/Briefing.tsx`
- Create: `app/components/types.ts`

**Interfaces:**
- Consumes: `Briefing` type from `lib/schema.ts`; `ENGAGEMENT_TYPES`, `PHASES`, `POSTURES`, `COMPETENCY_LEVELS`, `COMPETENCY_THEMES`, `Competency` from `lib/schema.ts`; `POST /api/analyze`.
- Produces: a single-screen flow — form → loading → briefing, with an inline error state and a paste-the-text fallback.

**Canonical layout & styling:** [`prototype/discovery-briefing.html`](../../../prototype/discovery-briefing.html)
is the reference for markup and classes — it already uses `valtech.css` + `breezemerchant.css`
(loaded in Task 1). Port its `bm-*` class structure into these React components rather than
inventing new styles. The code blocks below are functional scaffolding (state, fields, fetch,
render); use the prototype's classes for the actual look. The form must collect **five** inputs:
URL (+ paste fallback), engagement, phase, posture, and the four competency levels. The briefing
view must render each dimension's `anchorTheme`, `signal`, `hypeToDiscount`, `howToPlay`,
`baselineCompetency`, `mindsetMove`, `skillMove`, and `coachingNote` (when non-null), plus the
header (`clientName`, `oneLineRead`) and footer (`breezemerchantRead`).

> ⚠️ The inline `var(--panel)`, `var(--line)`, `var(--ink)`, `var(--accent)`, `var(--bg)`,
> `var(--muted)` in the scaffolding below are leftovers from an earlier theme and are **not
> defined** by the Valtech stylesheets. Replace them with `bm-*` classes from the prototype
> (or, as a quick map: `--panel`→`--vt-white`, `--line`→`--vt-rule`, `--ink`→`--vt-fg`,
> `--accent`→`--vt-accent`, `--bg`→`--vt-paper`, `--muted`→`--vt-fg-soft`).

- [ ] **Step 1: Create `app/components/types.ts`**

```ts
import type { Briefing } from "@/lib/schema";

export type AnalyzeResponse = { briefing: Briefing } | { error: string };
```

- [ ] **Step 2: Create `app/components/Briefing.tsx`**

```tsx
import type { Briefing } from "@/lib/schema";

export function BriefingView({ briefing }: { briefing: Briefing }) {
  return (
    <section style={{ display: "grid", gap: 20 }}>
      <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        <h2 style={{ margin: "0 0 6px" }}>{briefing.clientName}</h2>
        <p style={{ margin: 0, color: "var(--accent)", fontStyle: "italic" }}>{briefing.oneLineRead}</p>
      </header>

      {briefing.dimensions.map((d, i) => (
        <article
          key={i}
          style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}
        >
          <h3 style={{ marginTop: 0 }}>{d.name}</h3>
          <Field label={`Anchors to ${d.anchorTheme}`} value={d.signal} />
          <Field label="Hype to discount" value={d.hypeToDiscount} />
          <Field label="How to play it" value={d.howToPlay} />
          <Field label="Your baseline (today)" value={d.baselineCompetency} />
          <Field label="Mindset move" value={d.mindsetMove} />
          <Field label="Skill move" value={d.skillMove} />
          {d.coachingNote && <Field label="Coaching layer" value={d.coachingNote} />}
        </article>
      ))}

      <footer style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        <h4 style={{ margin: "0 0 6px" }}>The breezemerchant read</h4>
        <p style={{ margin: 0, color: "var(--muted)" }}>{briefing.breezemerchantRead}</p>
      </footer>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ margin: "8px 0" }}>
      <span style={{ color: "var(--muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </span>
      <br />
      {value}
    </p>
  );
}
```

- [ ] **Step 3: Create `app/components/InputForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  ENGAGEMENT_TYPES,
  PHASES,
  POSTURES,
  COMPETENCY_LEVELS,
  COMPETENCY_THEMES,
} from "@/lib/schema";
import type { AnalyzeResponse } from "./types";
import type { Briefing, Competency } from "@/lib/schema";

const ERROR_COPY: Record<string, string> = {
  "fetch-failed": "Couldn't read that page — paste the text in below instead.",
  "too-thin": "There wasn't enough text to work with. Paste a fuller description below.",
  "bad-input": "Please provide a URL (or pasted text) plus an engagement type and phase.",
  "analysis-failed": "The analysis didn't complete. Try again in a moment.",
};

export function InputForm({ onBriefing }: { onBriefing: (b: Briefing) => void }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [engagement, setEngagement] = useState(ENGAGEMENT_TYPES[0].value);
  const [phase, setPhase] = useState(PHASES[0].value);
  const [posture, setPosture] = useState(POSTURES[1].value); // default: pragmatic
  const [competency, setCompetency] = useState<Competency>({
    vision: "proficient",
    discovery: "proficient",
    execution: "proficient",
    consulting: "proficient",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, text, engagement, phase, posture, competency }),
      });
      const data: AnalyzeResponse = await res.json();
      if ("briefing" in data) {
        onBriefing(data.briefing);
      } else {
        setError(ERROR_COPY[data.error] ?? "Something went wrong.");
        if (data.error === "fetch-failed" || data.error === "too-thin") setShowPaste(true);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = { background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px", width: "100%" } as const;

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span>Client context URL</span>
        <input
          style={field}
          type="url"
          placeholder="https://… a job posting, careers page, or ways-of-working write-up"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Engagement type</span>
          <select style={field} value={engagement} onChange={(e) => setEngagement(e.target.value)}>
            {ENGAGEMENT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Project phase</span>
          <select style={field} value={phase} onChange={(e) => setPhase(e.target.value)}>
            {PHASES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Client posture toward builders / AI-PMs</span>
        <select style={field} value={posture} onChange={(e) => setPosture(e.target.value)}>
          {POSTURES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <fieldset style={{ border: "0.5px solid var(--vt-rule)", borderRadius: 0, padding: 12, margin: 0 }}>
        <legend style={{ fontSize: 13 }}>Your level (vs. the Valtech competency themes)</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {COMPETENCY_THEMES.map((t) => (
            <label key={t.value} style={{ display: "grid", gap: 6 }}>
              <span>{t.label}</span>
              <select
                style={field}
                value={competency[t.value as keyof Competency]}
                onChange={(e) =>
                  setCompetency((c) => ({ ...c, [t.value]: e.target.value as Competency[keyof Competency] }))
                }
              >
                {COMPETENCY_LEVELS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </fieldset>

      {(showPaste || text) && (
        <label style={{ display: "grid", gap: 6 }}>
          <span>Or paste the client text</span>
          <textarea
            style={{ ...field, minHeight: 140, resize: "vertical" }}
            placeholder="Paste a job posting or ways-of-working notes here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      )}

      {!showPaste && !text && (
        <button type="button" onClick={() => setShowPaste(true)} style={{ background: "none", border: "none", color: "var(--muted)", textAlign: "left", cursor: "pointer", padding: 0 }}>
          …or paste the text instead
        </button>
      )}

      {error && <p style={{ color: "var(--accent)", margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{ background: "var(--accent)", color: "#1a1208", border: "none", borderRadius: 8, padding: "12px 16px", fontWeight: 600, cursor: loading ? "default" : "pointer" }}
      >
        {loading ? "Reading the page… mapping to the framework…" : "Get the briefing"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { InputForm } from "./components/InputForm";
import { BriefingView } from "./components/Briefing";
import type { Briefing } from "@/lib/schema";

export default function Page() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", display: "grid", gap: 28 }}>
      <header>
        <h1 style={{ margin: "0 0 6px" }}>breezemerchant</h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Cut the hype. Work out where to focus to show up as a Product Builder at your next client.
        </p>
      </header>

      {briefing ? (
        <>
          <BriefingView briefing={briefing} />
          <button
            onClick={() => setBriefing(null)}
            style={{ background: "none", border: "1px solid var(--line)", color: "var(--ink)", borderRadius: 8, padding: "10px 14px", cursor: "pointer", justifySelf: "start" }}
          >
            Start over
          </button>
        </>
      ) : (
        <InputForm onBriefing={setBriefing} />
      )}
    </main>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/components/
git commit -m "feat: add input form and briefing view with paste fallback"
```

---

### Task 8: Golden-path manual verification

**Files:**
- Create: `docs/superpowers/plans/manual-verification.md` (a short demo script)

**Interfaces:**
- Consumes: the running app and a real `ANTHROPIC_API_KEY` in `.env.local`.

- [ ] **Step 1: Set up the environment**

Run: `cp .env.local.example .env.local` and edit it to add a real `ANTHROPIC_API_KEY`.
Expected: `.env.local` exists and is gitignored.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: server on `http://localhost:3000`.

- [ ] **Step 3: Run the golden path (live fetch)**

In the browser: paste a known, pre-tested public job-posting URL, choose an engagement type, phase, client posture, and your four competency levels, then submit.
Expected: a loading state, then a briefing with a client name, a one-line read, 2–3 dimensions (each with anchor theme / signal / hype / how-to-play / baseline / mindset move / skill move, plus a coaching layer when Consulting is Advanced), and a breezemerchant read. Re-run with the posture and competency levels changed and confirm the moves visibly adapt.

- [ ] **Step 4: Run the paste fallback**

Click "…or paste the text instead", paste a job description, submit.
Expected: a briefing renders from the pasted text without any fetch.

- [ ] **Step 5: Verify the error path**

Submit a deliberately bad URL (e.g. `https://example.com/does-not-exist-404`) with the paste box empty.
Expected: the inline message "Couldn't read that page — paste the text in below instead." and the paste textarea appears.

- [ ] **Step 6: Write the demo script to `docs/superpowers/plans/manual-verification.md`**

Capture: the exact demo URL that worked, the engagement type + phase used, and a one-line note on the expected briefing shape. This is the script to run live at the hackathon.

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/plans/manual-verification.md
git commit -m "docs: add golden-path manual verification script"
```

---

## Self-Review

**Spec coverage:**
- §1 What it is / §3 Inputs (URL + engagement + phase + posture + per-theme competency, paste fallback) → Tasks 2, 6, 7.
- §2 Authored model → Task 4 (POV loader); the file already exists and includes the four-theme competency baseline.
- §4 Output briefing (header, 2–3 dimensions with anchor theme + how-to-play + coaching layer, mindset + skill, footer read) → Task 2 (schema) + Task 5 (prompt) + Task 7 (view).
- §5 Architecture (Next.js, server-side key, one structured call, Valtech styling via valtech.css + breezemerchant.css) → Tasks 1, 5, 6.
- §6 Error handling (fetch fail → paste fallback, too-thin, analysis failure, loading state) → Tasks 3, 6, 7.
- §7 Testing (schema validation, extraction smoke test, golden-path manual) → Tasks 2, 3, 8.
- §8 Deferred decisions now resolved: all option lists incl. posture + competency levels (Global Constraints + Task 2); per-theme competency granularity; Valtech styling; briefing schema (Task 2); extraction library `@mozilla/readability` + `jsdom` (Task 3).

**Conditioning logic (posture + competency):** posture drives `howToPlay` and the closing read (Task 5 system rules); each dimension's `anchorTheme` selects which competency rating tunes its `skillMove` depth; `consulting` drives the `coachingNote` overlay. All conditioning lives in the prompt (Task 5) — the schema (Task 2) just carries the fields, and the view (Task 7) renders them.

**Placeholder scan:** No TBDs. Every code step shows complete code; every command shows expected output.

**Type consistency:** `Briefing` / `BriefingSchema` / `AnalyzeInput` / `AnalyzeInputSchema` defined in Task 2 and consumed by name in Tasks 5, 6, 7. `buildPrompt` / `analyze` signatures in Task 5 match their use in Task 6. `fetchUrlText` / `extractReadableText` in Task 3 match Task 6's import. Error strings (`fetch-failed`, `too-thin`, `bad-input`, `analysis-failed`) are consistent between Task 6 (route) and Task 7 (`ERROR_COPY`).
