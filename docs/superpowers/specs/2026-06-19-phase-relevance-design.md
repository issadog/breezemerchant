# Phase Relevance — Design Spec

**Date:** 2026-06-19
**Status:** Approved for planning
**Context:** Enhancement to the shipped Product Builder app (on `main`).

---

## 1. Problem

The "Where are you in delivery?" selector (discovery / definition / delivery) has no visible
effect on the output. The deterministic fallback (`fallbackFrame`) — which is what runs without
an `ANTHROPIC_API_KEY`, i.e. the common case and what the demo shows — is keyed only on trigger +
appetite, ignoring phase. The live prompt mentions the phase but does not instruct the model to
tailor to it. Result: switching phase changes nothing.

## 2. Goal

Make the delivery phase visibly shape the AI-native move, in **both** the offline (fallback) and
live (generated) paths, without rewriting the whole move per phase.

Chosen approach (Option A — "phase lens"): keep one core builder move per trigger and add a short,
authored **phase-specific adjustment** for each phase, surfaced as a distinct line on the result.
(Option B — full per-phase rewrites of move/steps — was considered and declined as too heavy and
prone to forced copy.)

## 3. Design

### Data — `lib/triggers.ts`
Each trigger gains:
```ts
phaseLens: { discovery: string; definition: string; delivery: string }
```
Each value is one concrete sentence on how this trigger's AI-native move shifts in that phase
(e.g. for "Scoping an AI feature": discovery → "define what good vs bad model output looks like
before committing to the feature"; definition → "make that eval set the acceptance criteria";
delivery → "wire the eval set into CI and re-run it on every model change"). All 5 triggers ×
3 phases authored. The `Trigger` type is extended accordingly.

### Schema — `lib/schema.ts`
`FrameSchema` gains a required `phaseNote: z.string()` — the phase-specific adjustment for the
chosen phase. It lives on the shared schema, so the live model produces it too. `type Frame`
updates by inference.

### Generation — `lib/generate.ts`
- `fallbackFrame(t, appetite, phase)` — signature gains `phase`; sets `phaseNote = t.phaseLens[phase]`.
- `generateFrame` passes `input.phase` to `fallbackFrame`.
- `buildPrompt` — add an instruction to tailor the move to the delivery phase and to produce a
  `phaseNote` describing how the move shifts in this phase. The phase is already in the user
  message; the system prompt gains the tailoring directive.
- The always-fallback contract is unchanged.

### UI — `app/components/Work.tsx`
In the result view, render `phaseNote` as a short line under the AI-native move (e.g. labelled
"In the {phase} phase: …"), shown only when the verdict is `do-it` (where the move is displayed).

### Training scenarios
Unchanged. They preset a sensible phase; the lens now makes that phase visibly matter, and
changing the phase afterward re-tailors the note.

## 4. Out of scope (YAGNI)
- Phase does **not** change the core `steps`, `prompt`, `timebox`, or the traditional-column
  statement (that's the level dropdown's job). Only the adjustment line changes per phase.
- No new phases; the three existing values stand.

## 5. Testing
- **Data integrity:** every trigger has a `phaseLens` with non-empty `discovery`/`definition`/`delivery`.
- **Schema:** `FrameSchema` requires `phaseNote`; a frame missing it fails to parse.
- **Generation:** `fallbackFrame(t, appetite, phase).phaseNote === t.phaseLens[phase]`; `buildPrompt`'s
  system text contains the phase-tailoring instruction and the user text contains the phase.
- **Manual:** in the running app, switching the phase changes the rendered "In the {phase} phase:" line.

## 6. Risks
- Authored lens quality: each lens must be concrete and genuinely phase-specific, not filler.
  Some trigger+phase combos are less natural (e.g. "a new brief landed" in delivery = a mid-flight
  change request) — author them plausibly.
- Adding a required field to `FrameSchema` means the live model must emit it; the prompt must ask
  for it explicitly, and the fallback covers the offline path regardless.
