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



**What AIEP is**


AIEP is a small, vendor-neutral interoperability protocol for agent systems. Instead of inventing a whole platform, it standardizes four tiny, signed documents that travel with your normal messages so different agents can authorize, delegate, and leave auditable evidence the same way everywhere. Those four artifacts are:
    Capability Token (CT) – what an agent/tool is allowed to do, for how long, under which limits (scoped, revocable).
    Action Contract (AC) – what a callable action expects/returns, preconditions, and side-effects.
    Delegation Envelope (DE) – a safe wrapper to pass limited authority to another agent with a signed hop-limit (prevents infinite hand-offs/privilege amplification).
    Provenance Record (PR) – a compact, signed receipt of what happened, by whom, using which token, with what result.

AIEP is intentionally minimal: it doesn’t replace transports like A2A/MCP or SDKs like LangChain; it rides on top of them to make permission, intent, and evidence consistent across vendors and runtimes.

How it works at runtime (happy-path)
    Token issuance: A service mints a short-lived CT for a specific action/resource (e.g., “charge:order-456”).
    Action call: The calling agent includes that CT when invoking an action; the callee verifies signature, scope, and expiry.
    Delegation (optional): If the callee must hand off, it wraps the CT in a signed DE with a hop_limit and policy hash; the next agent verifies, decrements hop_limit, and proceeds.
    Provenance: On completion, a signed PR is appended to the audit store (append-only or DB+signatures).

What guarantees it aims to provide
    Safer delegation & least privilege: scoped, revocable tokens; signed hop-limits prevent runaway chains.
    Composability: agents can reliably discover/call each other by referencing ACs, not bespoke glue.
    Traceability & reproducibility: every meaningful step leaves a PR that can be replayed and audited.

Why it’s practical
All artifacts are tiny JSON/JWT documents with simple schemas and signatures (e.g., HS256 for dev, asymmetric keys later). They’re easy to validate with widely available libraries and slot into existing frameworks via light adapters.
What it is not
It’s not a new agent framework or cloud. It complements things like A2A/MCP (which handle messaging/discovery) by adding portable tokens, signed audit records, and standard contracts so messages carry verifiable authority, not just intent.
