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




Simple explanation:
Agent Verification Studio (AVS) is a safety harness for AI agents. You sketch how an agent should behave on a visual canvas, write down the rules and allowed actions in plain files, and then “play” scenarios against that design. AVS checks those runs with a deterministic rule engine (no LLM judging), and logs a signed audit trail of what happened. It uses a few simple building blocks—capability tokens (what an agent is allowed to do), action contracts (what each tool expects/returns), delegation envelopes (how far an agent may hand tasks off), and provenance records (tamper-evident trace of events). AVS is for designing and verifying behavior before connecting real APIs, so you catch policy and safety issues early.



What this enables:
Teams can prototype agent workflows quickly, prove they follow policy, and hand off a clear, testable spec to engineering. You get repeatable simulations, automatic triage reports when rules fail, and an audit trail that helps with compliance, reviews, and debugging. This shortens build cycles, reduces risk (scopes, budgets, hop limits), improves cross-team communication (UX ↔︎ eng ↔︎ security), and makes it much easier to move from “idea” to production-ready designs without surprises.

