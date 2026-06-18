# Product Builder — Manual Verification & Demo Script

## Setup

```bash
npm install
cp .env.local.example .env.local   # optional — add a real ANTHROPIC_API_KEY for live generation
npm run dev                         # http://localhost:3000
```

The app works **with no API key** — generation falls back to the deterministic per-trigger
library, so a live demo never breaks. A key upgrades the canned frame to a model-generated one.

## Automated smoke test (backend, no key required) — PASSING

Verified against `npm run start` on the production build:

| Check | Result |
|---|---|
| `GET /` | HTTP 200 |
| `POST /api/frame` — brief + **conservative** | `verdict: skip-it`, competency "Hands-on prototyping", 3 steps, honest alternative present |
| `POST /api/frame` — brief + **pragmatic** | `verdict: do-it` (verdict flips with appetite — the anti-hype guardrail works) |
| `POST /api/frame` — invalid appetite `"keen"` | `400 {"error":"bad-input"}` (schema validation works) |

Reproduce:
```bash
npm run start &
curl -s -X POST localhost:3000/api/frame -H 'content-type: application/json' \
  -d '{"trigger":"brief","appetite":"conservative","phase":"discovery","situation":"","level":3,"training":false}'
# → verdict "skip-it"; swap appetite to "pragmatic" → "do-it"
```

## Golden-path UI walkthrough (human, in a browser)

1. **Trigger → Frame → Move → Track.** Pick "A new brief landed"; set appetite + phase + a one-line situation; "Show the two options". Confirm both columns render: the Valtech statement at your level (left) and a specific AI-native move (right) with steps + a copyable prompt + a timebox. Log as done; confirm a rep lands on Skills.
2. **Verdict flips.** Re-run with appetite **conservative** → **skip-it** with the honest alternative; **pragmatic/ambitious** → **do-it**.
3. **Framework level re-levels.** Change the header **Framework level** dropdown; confirm the "what most PMs do" statement changes to that level.
4. **Training scenario.** Home → "Generate a training scenario"; confirm a realistic scenario pre-fills targeting your weakest skill; take the move; confirm a **practice**-tagged rep in Skills + History.
5. **Document upload.** In setup, attach a `.txt`/`.md` brief; confirm it loads into the situation box.
6. **History.** Open History; confirm logged moves show with the advice as it was at the time; practice tagged distinctly; expanding an entry shows both options, verdict, steps, prompt.
7. **Nav.** Click the **Product Builder** wordmark from any screen → returns home. Confirm only **Skills** and **History** are separate nav destinations (no "Work" tab).

## Live-generation check (needs a real ANTHROPIC_API_KEY) — TODO for the human

With a key in `.env.local`, confirm `/api/frame` produces a **generated** (non-fallback) frame,
not just the canned content. The generation path uses `@anthropic-ai/sdk` v0.70.1's beta
structured-output helpers (`client.beta.messages.parse` + `betaZodOutputFormat`) with model
`claude-opus-4-8` and adaptive thinking. If the live call errors for any reason, the route
silently falls back to the deterministic frame (so the app still works) — which means a broken
live path is invisible without this explicit check. To verify: set a key, restart, submit a
trigger, and confirm the returned `builder`/`steps`/`prompt` differ from the trigger's canned
fallback content. If they always match the fallback, the live SDK path needs attention (likely
the beta helper/model behaviour on this SDK version).

## Demo recommendation

For the hackathon demo, the "A new brief landed" trigger with **conservative** appetite is the
strongest single moment — it shows the honest "not worth it for this client" verdict, which is
the clearest proof the tool isn't just hype. Follow with a **training scenario** to show
off-client upskilling, then **Skills** to show progress compounding.
