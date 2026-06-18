# The Product Builder Framework

> Valtech's opinionated point of view on how the Product Manager role is changing —
> and the two frameworks the tool bridges to help PMs navigate it.
>
> This is the **authored asset** at the heart of the Product Builder companion. The LLM
> does not invent these models; it maps a real work moment onto them. Edit this file to
> sharpen the POV — the product gets smarter as this gets sharper.

---

## The two frameworks it bridges

The tool's core move is to show, at a real work moment, two grounded options side by side:

| Column | Source | Role |
|---|---|---|
| **What most PMs do** | Valtech Product Competency Framework 2024 (16 competencies, 4 themes, 5 levels) | The established, competent move — shown at the PM's current level |
| **The AI-native approach** | Product Builder model v0.1 (9 competencies, 3 tiers) | The AI-native evolution of that move — mapped to one builder competency |

The point of view: most PMs reach for AI to do *traditional work faster* (faster decks, faster
PRDs). The Product Builder *redesigns the work*. The tool pushes from the first toward the
second — while filtering the hype that makes the shift hard to navigate, and declining to
recommend the AI-native move when a client wouldn't value it.

---

## Framework 1 — the "today" baseline (Valtech Product Competency Framework 2024)

Where Valtech expects PMs to be **today**: 4 themes, 16 competencies, each with 5 level
statements ("I understand…", "I can…", "I lead…"). The tool shows the relevant competency's
statement at the PM's current level as the traditional move's grounding.

| Theme | Competencies |
|---|---|
| **Vision & strategy** | Vision and proposition design · Product strategy · Defining success metrics |
| **Discovery** | Hypothesis and assumption identification · Using quantitative data · Using qualitative data · Experimentation · Ideation |
| **Execution** | Running effective teams · Roadmapping · Articulating requirements · Prioritisation and managing trade-offs |
| **Consulting** | Engagement delivery · Managing stakeholders · Modelling & coaching best practice · Driving account growth |

The five levels (Valtech scale): a PM self-assesses per competency. In the tool, a single
**framework level (1–5)** stands in for this until a real self-assessment exists — it sets which
level statement the traditional column shows, and conditions the AI-native suggestion.

---

## Framework 2 — the future vector (Product Builder model v0.1)

Nine competencies across three tiers. **Tier 1 (Foundations)** is bedrock AI did not change —
treated as established and tied to the PM's framework level. **Tiers 2 and 3** are the skills the
tool helps PMs *collect*: each is a level (Aware → Practising → Proficient → Leading) earned by
reps of taking the AI-native move.

For each competency: a short name, what it is, and the **tell** — the observable signal that a PM
genuinely has the capability, not just the vocabulary.

### Tier 1 — Foundations (established; not collectible)

1. **Problem & customer insight** — Find real, valuable problems grounded in evidence about users.
   *Tell:* can state the problem and the evidence for it without reaching for a solution.
2. **Strategic prioritisation** — Decide what to do and what to refuse, tied to outcomes.
   *Tell:* can name what they're explicitly *not* doing and why.
3. **Communication & narrative** — Align people on a direction without relying on authority.
   *Tell:* others can retell the direction accurately after one conversation.

### Tier 2 — Shifted practices (collectible)

4. **AI-accelerated discovery** — Compress research with AI while keeping ownership of the signal.
   *Tell:* uses AI to pre-synthesise, then spends human time testing where the synthesis is wrong.
5. **Rapid delivery & orchestration** — Tighter build-measure-learn loops; orchestrate AI tools,
   not only people. *Tell:* ships a learning loop in days, and can say which tool did which step.

### Tier 3 — New capabilities (collectible)

6. **Hands-on prototyping** — Idea to a working, testable artifact without an engineering handoff.
   *Tell:* brings something clickable to the conversation, not a description of it.
7. **AI-native product design** — Design around what models can and cannot reliably do.
   *Tell:* designs the failure path, not just the happy path, for a model-driven feature.
8. **Evaluation & quality** — Define and measure what "good" means for outputs that vary.
   *Tell:* has a written, re-runnable bar for good vs bad output *before* scoping the build.
9. **AI judgment & discernment** — Tell durable shifts from hype; manage the risks AI introduces.
   *Tell:* can say, for a specific situation, when the AI-native move is *not* worth it.

The levels: **Aware → Practising → Proficient → Leading**, advancing every 3 reps (tunable).
A rep is earned by logging the AI-native move as done at a work moment.

---

## How the tool uses these models

At each work moment (trigger), the tool:
1. Maps the trigger to **one Valtech competency** (traditional column) and **one builder
   competency** (AI-native column).
2. Shows the traditional move grounded in the Valtech competency's statement at the PM's level.
3. Shows the AI-native move grounded in the builder competency, with the PM's current skill level.
4. Applies the **client-value verdict** — if the AI-native move wouldn't serve this client given
   their appetite and phase, it says "not worth it" and gives the honest traditional alternative.
   This is the breeze-merchant guardrail (competency 9, AI judgment, applied live).
5. On "done", adds a rep to the builder competency — progress that compounds across weeks.

---

## Editing notes

- The trigger → (Valtech competency, builder competency) mappings are the highest-leverage edits.
  A wrong or thin trigger set is the fastest way for the tool to feel generic.
- "Tells" should be concrete and observable, not abstract — they are what keeps the AI-native
  suggestions specific rather than sloganeering.
- Tier 1 is deliberately *not* collectible: it's the bedrock the PM is already assessed on. If a
  PM's framework level is inaccurate, that assumption is hollow — revisit when self-assessment lands.
- This file is versioned. Treat changes to it as changes to the product's brain.
