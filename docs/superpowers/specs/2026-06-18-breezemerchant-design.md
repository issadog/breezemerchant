# breezemerchant — Design Spec

**Date:** 2026-06-18
**Status:** Approved for planning
**Context:** Valtech hackathon — a demoable, self-contained build for today.

---

## 1. What it is

**breezemerchant** is an internal Valtech web app that helps Product Managers work out
**where to focus their upskilling** — in both mindset and concrete skills — to evolve toward
the **"Product Builder" / AI-PM**. The name is a deliberate wink at the LinkedIn hype-peddlers
("breeze merchants") the product is the antidote to: it cuts signal from noise.

The heart of the product is **"where do I upskill, grounded in real context."** The most vivid
way to make context concrete is a **pre-engagement scenario**: a Valtech PM about to work with
a client feeds in that client's real context, and breezemerchant reflects back how the PM role
is shifting *for that specific situation* — what's genuinely changed vs. hype, and the specific
moves to make.

### Core value
A **personalized next step**, grounded in real live context — not generic LinkedIn advice.

### Why it is not "just prompt Claude yourself"
The defensible asset is an **authored, opinionated model** of how the PM role is changing,
versioned in the repo at [`docs/pov/pm-role-shift-framework.md`](../../pov/pm-role-shift-framework.md).
The LLM does not invent this model — it maps live client context onto it. The user cannot
replicate the output by prompting a chatbot because they do not possess:
- the framework of which dimensions are actually shifting,
- the signal taxonomy of real-vs-hype tells, and
- the Valtech competency baseline the output is anchored against.

The prompt is plumbing. The framework is the product.

---

## 2. The authored model (the product's brain)

Two halves, both captured in [`docs/pov/pm-role-shift-framework.md`](../../pov/pm-role-shift-framework.md):

1. **The "today" baseline** — Valtech's existing Product Competency Framework (4 themes,
   16 competencies): where PMs are expected to be *now*.
   - Vision & strategy · Discovery · Execution · Consulting
2. **The future vector** — five role-shift dimensions toward Product Builder / AI-PM:
   1. Discovery → Sensing
   2. Spec → Build
   3. Roadmaps → Bets
   4. Managing teams → Orchestrating systems
   5. Hype-resistance (meta-dimension)

Each shift dimension defines: old-PM vs Product-Builder poles, which competency theme(s) it
anchors to, **maturity tells** (real signals to hunt for in client text), and **hype tells**
(breeze-merchant markers).

The framework is loaded from the markdown file **at request time**, so editing the file changes
the product's behaviour with no code change.

---

## 3. Inputs

Structured inputs only — no free-form chat.

1. **Client context URL** — a job posting, careers page, or public ways-of-working write-up.
   Fetched live, server-side.
2. **Engagement type** — select (e.g. greenfield build / legacy modernization / advisory).
3. **Project phase** — select (e.g. Discovery / Delivery / Scaling).

Engagement type and phase **modulate which dimensions are relevant** and how each move is
framed (e.g. "Spec → Build" in Discovery means *prototype to learn*; in Delivery it means
*ship working artifacts, not docs*).

---

## 4. Output — the briefing

A structured briefing, rendered from strict JSON. **Not a chat.**

- **Header** — client name, engagement type, phase, and a one-line read
  (e.g. *"Genuine AI maturity in delivery, hype in discovery — here's where to focus."*).
- **Per relevant shift dimension** — only the **2–3 dimensions that matter** for this
  engagement + phase, ranked by relevance (focus over completeness):
  - **The signal** — what this client's real text says (quoted), placed on the dimension.
  - **Hype to discount** — the breeze-merchant version, and why it doesn't apply here.
  - **Your baseline** — the relevant Valtech competency ("today" expectation).
  - **Your moves** — one **mindset shift** + one **concrete skill** to practise, specific
    to this phase.
- **Footer — the breezemerchant read** — the meta hype-resistance summary: where this client
  is real vs. noise, so the PM walks in clear-eyed.

Same shape every time, because it fills a defined template.

---

## 5. Architecture

Single deployable web app, minimal moving parts.

**Stack:** Next.js (React UI + API routes in one repo). Keeps the Claude API key server-side;
lowest-friction to scaffold and run in a day.

**Components / flow:**
1. **Input form** (client component) — URL field + two selects. Validates, posts to the API.
2. **Fetch + extract** (API route) — fetches the URL server-side, strips to readable text
   (Readability/cheerio). Guards: timeout, size cap, graceful failure on JS-only/blocked pages.
3. **Analysis** (API route) — one structured Claude call. Inputs: extracted text + engagement
   type + phase + the POV framework (loaded from the markdown file). Output: **strict JSON**
   matching the briefing schema. Schema-validated; one retry on malformed JSON.
4. **Briefing view** (client component) — renders the JSON into the Section 4 layout.

**Out of scope today (YAGNI):** auth, saved history, multi-page crawl, real client-intel
database integration. The live URL fetch carries the "real" wow.

---

## 6. Error handling

The demo-killers to guard against:
- **Fetch fails / blocked / JS-only page** → clear message and a **first-class paste-the-text
  fallback** textarea (the single biggest live-demo risk).
- **Page text too thin** to analyze → say so; do not hallucinate a briefing.
- **Claude returns malformed JSON** → one retry, then a graceful error.
- **Slow fetch/analysis** → honest loading state ("Reading the page… Mapping to the framework…").

---

## 7. Testing

Scaled to a hackathon — confidence without ceremony:
- **Schema validation** on the analysis output — the contract between API and UI (the one
  thing worth a real test).
- **Extraction smoke test** — a couple of saved sample HTML pages → assert clean text out.
- **One golden-path manual script** — a known, pre-tested job-posting URL for the demo, plus
  the paste fallback.

Deliberately **not** doing today: exhaustive UI unit tests or full Claude mocking — manual
verification covers a one-day build.

---

## 8. Open decisions deferred to planning

- Exact option lists for engagement type and phase selects.
- The precise JSON briefing schema (field names, dimension ranking representation).
- Extraction library choice (Readability vs cheerio vs a simple combination).
