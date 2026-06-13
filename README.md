# Agent Spec Governance Demo — Rig

Reproduces Confluence "Autonomous Agent Use Cases" **Row 11 (DONE ⭐)** on **philip V12**:
Agent Mode adds spec lint to CI → API Catalog scorecard is bad → Agent Mode fixes the lint errors → score climbs to 100% pass → **Autonomous API Engineer (Agent Tasks)** fixes everything that drifted downstream.

Build plan: `~/Documents/marvin/content/agent-tasks-spec-governance-demo/build-plan.md`

## The API
A tiny in-memory **Contacts API** (Node + Express): `GET /contacts`, `POST /contacts`, `GET /contacts/{id}`.

## ⚠️ The two engineered elements (do not "fix" these — they ARE the demo)

1. **`openapi.yaml` is deliberately BAD.** It omits security schemes, rate-limit annotations, request-body schema properties, response content/schemas, operationIds, summaries, and error responses. This produces a **low API Catalog scorecard** so the score-climb has somewhere to climb from. (Beats 2–7.)

2. **Planted spec↔code drift (the Beat-8 payoff).** The backend (`src/server.js`) uses **snake_case / short** field names: `customer_id`, `phone`, `email`. The Postman collection's example responses use **camelCase / long** names: `customerId`, `phoneNumber`, `emailAddress`. When Agent Mode tightens the spec (grounding response schemas in the camelCase examples), the backend drifts from the now-authoritative contract. The Autonomous Engineer reconciles it on: *"Go find anything that broke because of my recent spec changes and fix it across the code base."*
   - **Dry-run check:** confirm the spec-fix actually produces camelCase and that Beat 8 has real work. If the agent's spec-fix happens to keep snake_case, plant an explicit field rename in the spec before the finale (build-plan §5).

## Demo beat → asset map
| Beat | What happens | Asset |
|---|---|---|
| 1 | Show the CI workflow (runs on PR) | `.github/workflows/ci.yml` (no spec-lint step yet) |
| 2 | Agent Mode adds a `postman spec lint` step → PR → merge | edits `ci.yml` |
| 3–4 | CI shows lint errors; API Catalog scorecard is low | `openapi.yaml` + Catalog |
| 5–7 | Agent Mode fixes lint errors → push → score → 100% | `openapi.yaml` |
| 8–9 | Autonomous Engineer fixes drifted backend + collection | `src/server.js` + collection |

## Status
- **Phase A (this repo):** scaffold complete — backend + bad spec + collection + CI workflow.
- **Phase B (Postman +v12):** workspace + Native Git Integration + spec into API Catalog + collection link + CLI secret. NOT done yet.

## Local run
```
npm install
npm start   # contacts api on :3010
npm test
```
