import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

type Step = {
  node: string; action: string; inputs: any; outputs: any;
  cap_token: { scope: string; exp: number };
  delegation?: { hop_remaining: number };
  cost_usd: number; cost_ms: number; ts: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const base = process.cwd();
    const contracts = yaml.load(fs.readFileSync(path.join(base, 'contracts/send_email.yml'), 'utf8')) as any;
    const invariants = yaml.load(fs.readFileSync(path.join(base, 'invariants.yml'), 'utf8')) as any;
    const scenarios = yaml.load(fs.readFileSync(path.join(base, 'scenarios.yml'), 'utf8')) as any;

    const n = Number(req.body?.n ?? 100);
    const seed = Number(req.body?.seed ?? 123);

    const results = [] as any[];
    for (let i = 0; i < n && i < scenarios.scenarios.length; i++) {
      const sc = scenarios.scenarios[i];
      const trace: Step[] = [];

      // --- simulate Planner -> SendEmail ---
      const cap = {
        scope: sc.override_cap_token?.scope ?? 'email:send',
        exp: Date.now() + 60 * 60 * 1000
      };
      const delegation = sc.delegation ? { hop_remaining: sc.delegation.hop_remaining } : undefined;

      // "send_email" stub
      const step: Step = {
        node: 'SendEmail',
        action: 'send_email',
        inputs: sc.vars,
        outputs: { message_id: `msg_${Math.random().toString(36).slice(2)}` },
        cap_token: cap,
        delegation,
        cost_usd: 0.001, cost_ms: 20, ts: Date.now()
      };
      trace.push(step);

      const evalResult = evaluate(trace, invariants);
      results.push({ scenario: sc.id, status: evalResult.ok ? 'pass' : 'fail', failures: evalResult.failures, trace });

      // write simple provenance line
      const provDir = path.join(base, '.avs-cache');
      if (!fs.existsSync(provDir)) fs.mkdirSync(provDir);
      const provLine = JSON.stringify({ agent: 'SendEmail', action: 'send_email', inputs: sc.vars, cap, delegation, result: step.outputs, ts: Date.now() });
      fs.appendFileSync(path.join(provDir, `${sc.id}.ndjson`), provLine + '\n');
    }

    const summary = summarize(results);
    const reportsDir = path.join(base, 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
    fs.writeFileSync(path.join(reportsDir, 'latest.json'), JSON.stringify({ summary, results }, null, 2));

    // Also write a tiny HTML report
    const html = `<html><body><h1>AVS Run</h1><pre>${JSON.stringify({ summary, results }, null, 2)}</pre></body></html>`;
    fs.writeFileSync(path.join(reportsDir, 'latest.html'), html);

    res.json({ summary, results });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

// --- Deterministic checks (toy but works) ---
function redactPII(s: string) { return s?.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]'); }
function noPII(s: string) { return !/\b\d{3}-\d{2}-\d{4}\b/.test(s ?? ''); }

function evaluate(trace: Step[], inv: any) {
  const fails: { id: string; reason: string }[] = [];
  const step = trace[0]; // one-step demo

  for (const rule of inv.invariants) {
    if (rule.id === 'no_pii') {
      const ok = noPII(step.inputs.subject) && noPII(step.inputs.body);
      if (!ok) fails.push({ id: rule.id, reason: 'PII detected in subject/body' });
    }
    if (rule.id === 'scoped_token') {
      const ok = step.cap_token.scope === 'email:send' && step.cap_token.exp > Date.now();
      if (!ok) fails.push({ id: rule.id, reason: 'missing or wrong scope/expired token' });
    }
    if (rule.id === 'hop_limit') {
      const ok = !step.delegation || step.delegation.hop_remaining <= 2;
      if (!ok) fails.push({ id: rule.id, reason: 'delegation hop_limit exceeded' });
    }
    if (rule.id === 'budget') {
      const runCost = trace.reduce((a, s) => a + s.cost_usd, 0);
      const ok = runCost <= 0.25;
      if (!ok) fails.push({ id: rule.id, reason: `cost ${runCost.toFixed(3)} > 0.25` });
    }
  }
  return { ok: fails.length === 0, failures: fails };
}

function summarize(results:any[]) {
  const total = results.length;
  const fails = results.filter(r => r.status === 'fail').length;
  return { total, fails, pass: total - fails };
}
