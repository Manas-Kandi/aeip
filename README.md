Agent Verification Studio (AVS)
Design, simulate, and verify agent behaviors before you ever ship them.
AVS implements an AIEP-lite model—Capability Tokens (CT), Action Contracts (AC), Delegation Envelopes (DE), and Provenance Records (PR)—plus a deterministic runner and a lightweight web app for modeling and triage.
Why AVS?
LLMs are great at generating behavior; they’re terrible at proving it’s bounded, auditable, and policy-conformant. AVS is a small, pragmatic layer that lets you:
Model agent workflows visually (React Flow).
Specify allowed actions/contracts & invariants in plain files.
Simulate scenarios (optionally fuzzed with Gemini, but never judged by it).
Verify deterministically with an oracle that checks your invariants.
Record signed provenance for every meaningful step.
AVS is a design/verification tool, not a production agent builder. Use it to catch policy and delegation problems before wiring real tools.
Features
AIEP-lite primitives
CT – signed capability tokens with scopes/limits
DE – signed, decrementing hop limits for safe delegation
AC – action contracts (typed inputs/outputs, preconditions)
PR – signed provenance records (hash + sig)
Runner/CLI – executes graphs against scenarios, evaluates invariants, emits a Triage Report (HTML)
Web app (Next.js) – React Flow canvas, Monaco editors, file-backed load/save, dark “liquid glass” UI
Gateway – mint/introspect CTs, ingest PRs (SQLite via Prisma)
Examples – starter graph, contracts, invariants, scenarios
Monorepo – pnpm workspaces + Turbo, shared configs, Vitest
Quickstart
# 1) Clone & install
pnpm install

# 2) Copy env and set secrets
cp .env.example .env
# Set: DATABASE_URL, GEMINI_API_KEY (optional), AIEP_SIGNING_SECRET

# 3) Dev servers (web + gateway)
pnpm dev
# Web: http://localhost:3000

# 4) Try the example run (HTML report artifact)
pnpm --filter packages/runner exec tsx src/cli.ts \
  run --graph ./examples/graphs/sample.json \
  --contracts ./examples/contracts \
  --invariants ./examples/invariants.yml \
  --scenarios ./examples/scenarios.yml \
  --report ./reports/latest.html
Repository Structure
apps/
  web/                 # Next.js app (React Flow canvas, Monaco, API routes)
packages/
  core/                # Zod/JSON Schemas, signing & verification utils
  runner/              # CLI runner (tsx) -> executes scenarios + triage report
  adapters/            # withAIEP() wrapper to attach CT/DE and emit PRs
  gateway/             # Express + Prisma (CT mint/introspect, PR ingest)
  testing/             # Vitest suites (CT/DE/PR/invariants)
examples/
  contracts/           # Action Contracts (*.yml)
  graphs/              # React Flow graph JSON (sample.json)
  invariants.yml       # Policy checks (deterministic)
  scenarios.yml        # Inputs & fuzzing toggles
reports/
  latest.html          # Generated triage report (on demand)
Core Concepts
Deterministic Oracle
Invariants are pure predicates (no LLM in the loop). The runner evaluates pass/fail with explanations.
LLM as Generator, not Judge
Gemini can fuzz scenarios (paraphrases/variants) to expand coverage. Verification stays deterministic.
Signed Artifacts
CT/DE/PR are HS256-signed using AIEP_SIGNING_SECRET for dev. Swap to asymmetric keys in prod.
Web App
/ – landing (Start Modeling / Edit Files)
/model – React Flow canvas with palette (add nodes), properties panel (edit labels), Load/Save graph (file-backed)
/edit – Monaco editor tabs for:
examples/contracts/*.yml
examples/invariants.yml
examples/scenarios.yml
Files are the source of truth. The canvas is a view over text artifacts.
Minimal Examples
Action Contract – examples/contracts/send_email.yml
name: send_email
version: "1.0.0"
description: Send an email via provider X
inputs: { to: string, subject: string, body: string }
outputs: { message_id: string }
preconditions:
  - "to must be a valid address"
side_effects:
  - "sends an external email"
idempotent: true
compensation: "send follow-up cancellation email if supported"
Invariants – examples/invariants.yml
- id: no_pii_in_subject_or_body
  description: Avoid obvious PII in subject/body
  check: "!(subject =~ /(ssn|passport)/i) && !(body =~ /(ssn|passport)/i)"

- id: ct_scope_allows_action
  description: Capability scope includes the attempted action
  check: "ct.scope.includes(action)"
Graph – examples/graphs/sample.json (excerpt)
{ "nodes":[{"id":"planner","data":{"label":"Planner"}},{"id":"sendEmail","data":{"label":"SendEmail"}}],
  "edges":[{"id":"e1","source":"planner","target":"sendEmail"}] }
Runner Command
pnpm --filter packages/runner exec tsx src/cli.ts run \
  --graph ./examples/graphs/sample.json \
  --contracts ./examples/contracts \
  --invariants ./examples/invariants.yml \
  --scenarios ./examples/scenarios.yml \
  --report ./reports/latest.html
Development
Install: pnpm install
Web: pnpm --filter apps/web dev
Gateway: runs with pnpm dev (shared dev script)
Tests: pnpm test
Build: pnpm build
Lint: pnpm lint
Environment (.env.example):
DATABASE_URL="file:./.data/avs.sqlite"
GEMINI_API_KEY="YOUR_KEY"            # optional
AIEP_SIGNING_SECRET="dev-only-not-for-prod"
Roadmap
 Visual DE hop-limit indicators & budget limits on edges
 Inline invariant failures on canvas nodes
 Pluggable token backends (JWT → Paseto, asymmetric keys)
 Provenance timeline view & diffing between runs
 Import/export to MCP/Cursor/Windsurf project templates
 Postgres option + migrations
Contributing
Issues and PRs welcome! Keep files small and composable, prioritize deterministic checks, and avoid introducing LLMs into the verifier path.
