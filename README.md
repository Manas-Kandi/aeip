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
