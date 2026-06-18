# Product Builder — Design Spec

**Date:** 2026-06-18 (rev. for the in-flow companion pivot)
**Status:** Approved for planning
**Context:** Valtech hackathon — a demoable, self-contained build for today.
**Supersedes:** the earlier "pre-engagement briefing" framing. The product is now an
in-the-flow-of-work companion (see the [PRD](../../../prototype/) and `prototype/product-builder.html`).

---

## 1. What it is

**Product Builder** is a working tool for Valtech PMs. A PM opens it at a real work moment — a
brief lands, discovery kicks off, an AI feature needs scoping, they hit a wall, a client update is
due — and the tool shows **two grounded options side by side**:

- **What most PMs do** — drawn from the Valtech Product Competency Framework 2024, shown at the
  PM's current level.
- **The AI-native approach** — drawn from the Product Builder model.

It hands over the steps and a ready-to-use prompt to do the AI-native option now, and only
recommends it when a client would value it. Each AI-native move a PM takes builds the matching
skill, and that progress accumulates across weeks of real work.

The product exists to move PMs from *using AI to do traditional work faster* toward *redesigning
how they work*, while filtering out the hype that makes that shift hard to navigate.

### Why this is not just chatting with Claude
The central design constraint. The tool earns its place by holding three things raw chat doesn't:
- **A point of view** — it knows the traditional move vs the AI-native move for a situation and
  pushes toward the second; it can decline the flashy option when a client wouldn't value it.
- **A trigger, not a summons** — it meets the PM at a work moment and surfaces the move they
  wouldn't have thought to ask for.
- **Memory that compounds** — it tracks which skills the PM is building and which they avoid, and
  tilts recommendations at the gap. The shift becomes visible over time.

Every feature is checked against this: a screen that could be replaced by a blank prompt is cut.

---

## 2. The authored model (the product's brain)

Two frameworks, both captured in [`docs/pov/pm-role-shift-framework.md`](../../pov/pm-role-shift-framework.md):
1. **Valtech Product Competency Framework 2024** — 16 competencies, 4 themes, 5 levels. Drives the
   "what most PMs do" column at the PM's level.
2. **Product Builder model v0.1** — 9 competencies, 3 tiers. Tier 1 (Foundations) is established
   and tied to framework level; Tiers 2–3 (Shifted practices, New capabilities) are the six
   collectible skills. Drives the "AI-native approach" column. Levels: Aware → Practising →
   Proficient → Leading.

The framework file is loaded at request time, so editing it changes behaviour with no code change.

---

## 3. Core experience — Trigger, Frame, Move, Track

The loop, each visit:
1. **Trigger** — the home screen is a set of real work moments, not a chat box. The PM picks one.
2. **Frame** — a short context capture (client appetite, delivery phase, the situation), then the
   two-option frame.
3. **Move** — for the AI-native option, a short workflow, a ready-to-use prompt, and a timebox —
   making the new move the low-effort option in the moment.
4. **Track** — the PM logs what they did. Taking the AI-native move adds a rep to the matching
   skill. The Skills view shows progress and recommends what to build next.

---

## 4. Inputs

- **Trigger** (required) — one of a fixed set of work moments: new brief, kicking off discovery,
  scoping an AI feature, stuck on a problem, prepping a client update. Each maps to one Valtech
  competency and one builder competency.
- **Client appetite** (required) — conservative / pragmatic / ambitious. The lever that drives the
  client-value verdict.
- **Delivery phase** (required) — discovery / definition / delivery.
- **Situation** (optional, lightweight→heavyweight) — a free-text line, *or* an uploaded document
  (RFP, SOW, problem description). Text files are read client-side; PDF/Word are parsed
  server-side in the real build. The situation sharpens the two options.
- **Framework level (1–5)** — set from a dropdown under the username; stands in for a real
  self-assessment. Re-levels the traditional column and conditions the AI-native suggestion.

---

## 5. Output — the two-option frame

- **Header** — the trigger; a training tag when in practice mode.
- **Client-value verdict** — "do it" or "not worth it for this client". When the move wouldn't
  serve the client given appetite + phase, it says so and gives the honest traditional alternative.
  This is the anti-hype guardrail and a core differentiator; it must be visible and must change
  with appetite.
- **What most PMs do** — the relevant Valtech competency, its theme, and the behaviour statement at
  the PM's level (with the ability to view other levels).
- **The AI-native approach** — the relevant builder competency, its tier, the PM's current skill
  level, and a specific, actionable move (not a slogan).
- **Why it's worth doing for the client** — grounded in delivery value, never in looking modern.
- **The Move** (on "do it") — a 2–4 step workflow, a copyable prompt with bracketed blanks, and a
  timebox.

---

## 6. Features

- **Work-moment triggers (R1)** — fixed set on the home screen; each maps to one Valtech + one
  builder competency.
- **Context capture (R2)** — appetite, phase, situation (typed or uploaded document).
- **Two-option frame (R3)** + **client-value verdict (R4)** + **the Move (R5)** — as above.
- **Logging an outcome (R6)** — log done / skipped. "Done" on an AI-native move adds a rep and
  appends to history. (Open risk: a rep is logged on intent, not verified outcome.)
- **Skills progression (R7)** — each collectible builder competency has a level and rep count;
  advances every 3 reps. The Skills view groups by tier, shows Foundations as established, and
  recommends the next skill (least-developed) and the trigger that builds it — the return hook.
- **Training scenarios** — "generate a training scenario" produces a realistic, made-up situation
  targeting the PM's weakest skill, so they can rehearse off-client. Practice reps are tagged
  distinctly from real client work (a partial answer to the rep-on-intent risk).
- **Move history** — every logged move is recorded with the advice as it was at the time (both
  options, the verdict, steps, prompt). A dedicated History view shows expandable entries,
  distinguishing practice from client moves.
- **Navigation** — the **Product Builder** wordmark is home (the work moments). The only other
  destinations are **Skills** and **History**. No redundant "Work" tab.
- **User model (R8)** — for the hackathon, one in-memory indicative user (Nomi) with a framework
  level, skill reps, and history; state resets on reload. Real accounts/persistence are P1.

---

## 7. Architecture

Single deployable web app.

**Stack:** Next.js (App Router, TypeScript) + React. Generation (R9) runs through a **server-side**
API route that holds the Anthropic key and is grounded in the relevant Valtech competency (at the
PM's level) and the target builder competency. A **deterministic fallback library** covers every
trigger so a live demo never breaks when the model is unreachable.

**Styling:** the Valtech design system — `valtech.css` (tokens + embedded brand fonts, untouched)
loaded first, then `breezemerchant.css` (app component layer built from `--vt-*` tokens). Light
"paper" theme, coral accent.

**State (hackathon):** in-memory indicative user; no auth or persistence. Document upload reads
text files client-side; binary parsing is deferred to the server-side path.

**Out of scope today (YAGNI):** auth, cross-device persistence, manager/practice-lead dashboards,
evidence-verified reps, a general-purpose chatbot.

---

## 8. Error handling

- **Model unreachable** → fall back to the deterministic per-trigger library; surface a quiet
  "offline mode" note. A live demo must never break (R9).
- **Malformed model output** → validate; on failure use the fallback for that trigger.
- **Unsupported upload (PDF/Word) in the prototype** → accept, show the filename, and prompt for a
  one-line gist; real parsing is server-side.
- **Slow generation** → honest loading state ("Putting together the two options…").

---

## 9. Testing

Scaled to a hackathon:
- **Framework + trigger data integrity** — every trigger maps to a valid Valtech competency and a
  valid builder competency; every builder skill has a tier and a tell. (Real test.)
- **Skill maths** — level/progress/label functions (level every N reps, caps, labels). (Real test.)
- **Recommendation** — least-developed collectible skill with correct tie-breaking. (Real test.)
- **Generation output schema** — the structured frame/move validates against the schema; fallback
  for malformed. (Real test, with the model mocked.)
- **Golden-path manual script** — one trigger end-to-end, the verdict flipping with appetite, a
  training scenario, an upload, and a move appearing in History.

---

## 10. Open questions (from the PRD)

- **Rep on intent, not evidence** — the most important open question. Should a rep require evidence
  (a link, an artifact, a short proof)? Training-vs-client tagging is a partial step.
- **Trigger taxonomy** — the starter set is a guess; validate against real Valtech delivery flow.
- **Content quality** — the AI-native move must be specific without being wrong for half of
  situations; test against several real briefs.
- **Coarse client signal** — three-way appetite may be too blunt to drive a credible verdict.
- **Foundations as established** — assumes the PM's framework level is accurate.
- **Gamification gaming** — rings/levels can encourage rep-farming; the recommendation engine and
  any evidence check must counter this.
