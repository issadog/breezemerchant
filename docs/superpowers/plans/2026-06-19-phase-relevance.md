# Phase Relevance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the delivery-phase selector (discovery / definition / delivery) visibly change the AI-native move's "phase note" in both the offline fallback and the live generated paths.

**Architecture:** Add an authored `phaseLens` (one sentence per phase) to each trigger; add a required `phaseNote` to the generation `Frame` schema; have `fallbackFrame` fill `phaseNote` from `phaseLens[phase]` and the prompt instruct the model to produce it; render it under the AI-native move.

**Tech Stack:** Next.js 14 / TypeScript, zod (v4), vitest, `@anthropic-ai/sdk`.

## Global Constraints

- **Phase values** (exact): `discovery`, `definition`, `delivery`.
- **`FrameSchema` gains a required `phaseNote: string`** — present on every frame (fallback and live).
- **`fallbackFrame` sets `phaseNote = trigger.phaseLens[phase]`** — deterministic per trigger+phase.
- **The always-fallback contract is unchanged:** `generateFrame` returns `fallbackFrame(...)` on any error and never throws for valid input.
- **Phase changes ONLY the `phaseNote` line** — not `steps`, `prompt`, `timebox`, `builder`, or the traditional-column statement (YAGNI; that was the Option-A decision).
- **Model/thinking unchanged:** `claude-opus-4-8`, `thinking: {type:"adaptive"}`.
- Run tests/build with `PATH=/opt/homebrew/bin:$PATH` if `npm` isn't on PATH.

---

## File Structure

- `lib/triggers.ts` — add `phaseLens` to each of the 5 triggers; extend the `Trigger` type. (`lib/data.test.ts` — integrity test.)
- `lib/schema.ts` — add `phaseNote` to `FrameSchema`. (`lib/schema.test.ts` — fixture + reject test.)
- `lib/generate.ts` — `fallbackFrame(t, appetite, phase)`, `buildPrompt` directive, `generateFrame` passes phase. (`lib/generate.test.ts` — updated.)
- `app/components/Work.tsx` + `app/styles/breezemerchant.css` — render the phase note.

---

### Task 1: Add `phaseLens` to triggers

**Files:**
- Modify: `lib/triggers.ts` (extend `Trigger` type; add `phaseLens` to all 5 triggers)
- Test: `lib/data.test.ts` (add a `phaseLens` integrity test)

**Interfaces:**
- Produces: `Trigger.phaseLens: { discovery: string; definition: string; delivery: string }`, populated for every trigger.

- [ ] **Step 1: Add the failing integrity test** to `lib/data.test.ts` (new `describe` or `it`):

```ts
import { TRIGGERS } from "./triggers"; // (already imported at top — reuse existing import)

it("every trigger has a phaseLens with non-empty discovery/definition/delivery", () => {
  for (const t of TRIGGERS) {
    expect(t.phaseLens).toBeDefined();
    for (const phase of ["discovery", "definition", "delivery"] as const) {
      expect(typeof t.phaseLens[phase]).toBe("string");
      expect(t.phaseLens[phase].length).toBeGreaterThan(0);
    }
  }
});
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `npm test -- data`
Expected: FAIL (`t.phaseLens` is undefined).

- [ ] **Step 3: Extend the `Trigger` type** in `lib/triggers.ts` — add this field to the `Trigger` type:

```ts
phaseLens: { discovery: string; definition: string; delivery: string };
```

- [ ] **Step 4: Add `phaseLens` to each trigger object** with this exact authored content:

`brief` ("A new brief landed"):
```ts
phaseLens: {
  discovery: "You're at the very start — prototype the assumption that most shapes whether this is even the right brief, and bring it as a question that reframes the kickoff.",
  definition: "The brief is agreed — prototype the assumption that most affects scope, so the definition you write is grounded in something you've already seen work or fail.",
  delivery: "A brief landing mid-delivery is usually a change request — prototype its impact against the existing build before you let it expand scope.",
},
```

`discovery` ("Kicking off discovery"):
```ts
phaseLens: {
  discovery: "This is the heart of the phase — pre-synthesise everything you already have so your first interviews test the weak spots instead of re-covering known ground.",
  definition: "Discovery is winding down — use the synthesis to pressure-test the problem statement you're about to commit to, surfacing any theme the evidence doesn't actually support.",
  delivery: "In delivery, run the synthesis over live signals (support tickets, usage) to catch whether what you're building is drifting from the real need.",
},
```

`aifeature` ("Scoping an AI feature"):
```ts
phaseLens: {
  discovery: "Before committing to the feature, define what good vs bad model output looks like — the eval bar is your cheapest way to learn whether this is even feasible.",
  definition: "Make the eval set the acceptance criteria — scope the feature around the quality bar, not around a list of stories.",
  delivery: "Wire the eval set into the delivery loop and re-run it on every model or prompt change, so quality is monitored, not assumed.",
},
```

`stuck` ("Stuck on a problem"):
```ts
phaseLens: {
  discovery: "Early on, use the reframes to question whether you're even solving the right problem before you invest in any one direction.",
  definition: "Use the reframes to stress-test the approach you're about to lock in — keep only the framing that survives your real constraints.",
  delivery: "Mid-delivery you can't restart — use the reframes to find the smallest change that unblocks you without derailing the plan.",
},
```

`update` ("Prepping a client update"):
```ts
phaseLens: {
  discovery: "Early updates set expectations — let AI draft the status and spend your time framing what you're still trying to learn and why that's the right use of the phase.",
  definition: "Use the saved time to make the one scoping recommendation the client needs to approve so delivery can start cleanly.",
  delivery: "Draft the status from your delivery data and spend the saved time on the decision the client must make now — especially any risk you've been sitting on.",
},
```

- [ ] **Step 5: Run the test, confirm pass**

Run: `npm test -- data`
Expected: PASS (all integrity tests, including the new one).

- [ ] **Step 6: Commit**

```bash
git add lib/triggers.ts lib/data.test.ts
git commit -m "feat: add per-phase phaseLens to triggers"
```

---

### Task 2: Add `phaseNote` to the schema and wire phase into generation

These land together: adding a required `FrameSchema.phaseNote` makes `lib/generate.ts` (whose return type is `Frame`) fail to type-check until `fallbackFrame` sets the field, so the schema change and its only producer must ship in one task to keep the suite green.

**Files:**
- Modify: `lib/schema.ts` (add `phaseNote` to `FrameSchema`)
- Modify: `lib/generate.ts` (`buildPrompt`, `fallbackFrame`, `generateFrame`)
- Test: `lib/schema.test.ts` (fixture + reject test) and `lib/generate.test.ts` (phase arg + assertions)

**Interfaces:**
- Consumes: `Trigger.phaseLens` (Task 1).
- Produces: `FrameSchema` with required `phaseNote: string` (so `Frame` gains `phaseNote`); `fallbackFrame(t: Trigger, appetite: string, phase: "discovery"|"definition"|"delivery"): Frame`.

- [ ] **Step 1: Update the schema test** in `lib/schema.test.ts`. Add `phaseNote` to the existing valid `frame` fixture, and add a reject test:

```ts
// add to the existing valid `frame` fixture object:
phaseNote: "In the delivery phase: wire the eval set into CI.",
```
```ts
it("rejects a frame missing phaseNote", () => {
  const { phaseNote, ...withoutNote } = frame; // `frame` = the valid fixture
  expect(() => FrameSchema.parse(withoutNote)).toThrow();
});
```

- [ ] **Step 2: Update the generate test** in `lib/generate.test.ts`.
  - Every existing `fallbackFrame(t, "pragmatic")` / `fallbackFrame(t, "conservative")` call gains a phase arg, e.g. `fallbackFrame(t, "pragmatic", "discovery")`.
  - Add a `phaseNote` assertion and a `buildPrompt` phase assertion:

```ts
it("fallbackFrame sets phaseNote from the trigger's phaseLens for the chosen phase", () => {
  const f = fallbackFrame(t, "pragmatic", "delivery");
  expect(f.phaseNote).toBe(t.phaseLens.delivery);
});

it("buildPrompt instructs phase tailoring and includes the phase", () => {
  const { system, user } = buildPrompt(
    { trigger: "brief", appetite: "pragmatic", phase: "definition", situation: "", level: 3, training: false },
    t, VALTECH[t.trad], BUILDER[t.build],
  );
  expect(system.toLowerCase()).toContain("phase");
  expect(system).toContain("phaseNote");
  expect(user).toContain("definition");
});
```
(Keep the existing `buildPrompt` and `fallbackFrame` do-it/skip-it tests, adding the phase arg to the `fallbackFrame` calls.)

- [ ] **Step 3: Run both, confirm failure**

Run: `npm test -- schema generate`
Expected: FAIL — schema reject test fails (field not in schema yet) and generate `phaseNote`/arity assertions fail.

- [ ] **Step 4: Add the field** to `FrameSchema` in `lib/schema.ts` (after `builder`):

```ts
  phaseNote: z.string().describe("How the AI-native move shifts in the chosen delivery phase."),
```

- [ ] **Step 5: Update `fallbackFrame`** in `lib/generate.ts` — add the `phase` parameter and set `phaseNote`:

```ts
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
```

- [ ] **Step 6: Update `generateFrame`'s catch** to pass the phase:

```ts
  } catch {
    return fallbackFrame(t, input.appetite, input.phase);
  }
```

- [ ] **Step 7: Add the phase directive to `buildPrompt`'s `system` array** — append these two lines:

```ts
    "Tailor the move to the delivery phase (discovery, definition, or delivery): the same trigger calls for a different emphasis at each phase.",
    "Set `phaseNote` to one concrete sentence on how this move shifts in the given delivery phase.",
```

- [ ] **Step 8: Run the tests, confirm pass**

Run: `npm test` (full suite)
Expected: PASS (schema reject throws; fallback `phaseNote` correct; buildPrompt asserts pass; no other regressions).

- [ ] **Step 9: Commit**

```bash
git add lib/schema.ts lib/schema.test.ts lib/generate.ts lib/generate.test.ts
git commit -m "feat: add phaseNote to schema and tailor generation to delivery phase"
```

---

### Task 3: Render the phase note in the UI

**Files:**
- Modify: `app/components/Work.tsx` (result view — render `phaseNote` under the AI-native move, do-it only)
- Modify: `app/styles/breezemerchant.css` (add a `.phase-note` rule)

**Interfaces:**
- Consumes: `Frame.phaseNote` (Task 2), `ctx.phase` (already in component state).

- [ ] **Step 1: Locate the result view's AI-native column** in `app/components/Work.tsx` — the block with class `path builder` that renders `result.builder` and the `skill-now` line. Immediately after that column's `.src` block (still inside `.path.builder`), add the phase note, shown only when not skipped:

```tsx
{!skip && (
  <p className="phase-note">In the {ctx.phase} phase: {result.phaseNote}</p>
)}
```
(Use the existing `skip` boolean and `ctx.phase` already in scope in the result view. `result.phaseNote` is now a field on the frame.)

- [ ] **Step 2: Add the CSS** to `app/styles/breezemerchant.css`:

```css
.phase-note { margin: 10px 0 0; font-size: 13px; color: var(--builder); border-left: 2px solid var(--builder); padding-left: 10px; }
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: build succeeds, no type errors (`result.phaseNote` resolves because `Frame` has it).

- [ ] **Step 4: Manual check (record, don't block)**

Run: `npm run dev`, open a trigger, set verdict to do-it (pragmatic), and toggle the **Where are you in delivery?** selector across discovery / definition / delivery. Confirm the "In the {phase} phase: …" line changes each time.

- [ ] **Step 5: Commit**

```bash
git add app/components/Work.tsx app/styles/breezemerchant.css
git commit -m "feat: render per-phase note under the AI-native move"
```

---

## Self-Review

**Spec coverage:**
- §3 Data (`phaseLens` per trigger) → Task 1.
- §3 Schema (`phaseNote` required) + Generation (`fallbackFrame` phase param, `generateFrame` passthrough, `buildPrompt` directive) → Task 2 (merged so there's no broken intermediate type state).
- §3 UI (render `phaseNote`, do-it only) → Task 3.
- §3 Training scenarios unchanged → no task needed (they set phase; the lens applies via the same path).
- §5 Testing (data integrity, schema reject, fallback phaseNote, buildPrompt phase, manual toggle) → Tasks 1, 2, 3.
- §4 Out of scope (no change to steps/prompt/timebox/traditional) → respected; no task touches them.

**Placeholder scan:** None. Every `phaseLens` value and every code change is shown in full.

**Type consistency:** `phaseLens` shape (Task 1) matches `fallbackFrame`'s `phase` indexing `t.phaseLens[phase]` (Task 2). `phaseNote` is added to `FrameSchema` and consumed by `fallbackFrame` (both Task 2) and `Work.tsx` (Task 3) — same name throughout. `fallbackFrame`'s new 3-arg signature is updated at its only two call sites in the same task: `generateFrame` and `lib/generate.test.ts` (Task 2). The required `phaseNote` and its producer ship together in Task 2, so the suite is green at every task boundary.
