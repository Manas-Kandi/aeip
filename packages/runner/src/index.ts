import { Command } from 'commander';
import { loadYaml, ActionContract, ProvenanceRecord, CapabilityToken, DelegationEnvelope, signCT, verifyCT, mintDE, verifyDE, emitPR } from '@avs/core';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import fs from 'fs';

const program = new Command();

program
  .name('avs')
  .description('Agent Verification Studio CLI')
  .version('0.1.0');

async function generateScenarioVariants(scenario: any, options: any): Promise<any[]> {
  if (process.env.GEMINI_API_KEY && options.fuzz) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `Given the following scenario for an agent system, generate 3 variations of this scenario. Focus on paraphrasing and slight perturbations to the inputs, but keep the core intent of the scenario the same. Return only a JSON array of the varied scenarios.\n\nScenario: ${JSON.stringify(scenario, null, 2)}\n\nVariations:`

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating scenario variants with Gemini:", error);
      return [scenario]; // Fallback to original scenario
    }
  } else {
    return [scenario]; // No fuzzing, return original scenario
  }
}

interface GraphNode {
  id: string;
  action: string;
  agent: string;
  inputs: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

async function executeGraph(graph: Graph, contracts: Record<string, ActionContract>, scenario: any): Promise<ProvenanceRecord[]> {
  const trace: ProvenanceRecord[] = [];
  const agentState: Record<string, any> = {}; // Simulate agent's internal state

  // Simple execution: just process nodes in order for now
  for (const node of graph.nodes) {
    const contract = contracts[node.action];
    if (!contract) {
      console.warn(`Action contract for ${node.action} not found. Skipping.`);
      continue;
    }

    // Simulate action execution
    const inputs = { ...node.inputs, ...scenario.inputs }; // Merge scenario inputs
    const result = { status: 'success', output: `Simulated output for ${node.action}` };

    // Simulate CT minting and usage
    const ctPayload: CapabilityToken = {
      iss: 'runner',
      sub: node.agent,
      act: node.action,
      res: '*', 
      scope: [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ver: 'aiep-ct-1',
      jti: Math.random().toString(36).substring(2),
    };
    const signedCt = await signCT(ctPayload);

    // Simulate PR emission
    const pr: Omit<ProvenanceRecord, 'hash' | 'sig'> = {
      ts: new Date().toISOString(),
      agent: node.agent,
      action: node.action,
      inputs: inputs,
      result: result,
      token_ref: ctPayload.jti,
      policies_checked: [],
      trace_id: scenario.id,
      ver: 'aiep-pr-1',
    };
    const emittedPr = await emitPR(pr);
    trace.push(emittedPr);

    // Simulate delegation (simplified)
    if (node.action === 'Planner' && node.id === 'planner-node-id') { // Example for delegation
      const dePayload: Omit<DelegationEnvelope, 'sig'> = {
        origin: node.agent,
        task: 'plan-execution',
        hop_limit: 2,
        policy_hash: 'some-policy-hash',
        ver: 'aiep-de-1',
      };
      const delegatedDe = await mintDE(dePayload);
      console.log('Simulated Delegation Envelope:', delegatedDe);
    }
  }
  return trace;
}

program.command('run')
  .description('Execute scenarios and run invariants')
  .option('--graph <path>', 'Path to the graph JSON file', './examples/graphs/sample.json')
  .option('--contracts <path>', 'Path to the contracts directory', './examples/contracts')
  .option('--invariants <path>', 'Path to the invariants YAML file', './examples/invariants.yml')
  .option('--scenarios <path>', 'Path to the scenarios YAML file', './examples/scenarios.yml')
  .option('--report <path>', 'Path to the HTML report output', './reports/latest.html')
  .option('--cache <path>', 'Path to the cache directory', './.cache')
  .option('--fuzz', 'Enable scenario fuzzing with Gemini (requires GEMINI_API_KEY)', false)
  .action(async (options) => {
    console.log('Running AVS with options:', options);

    // Load invariants
    const invariants = loadYaml(path.resolve(options.invariants));
    console.log('Loaded Invariants:', invariants);

    // Load scenarios
    const scenarios = loadYaml(path.resolve(options.scenarios));
    console.log('Loaded Scenarios:', scenarios);

    // Load graph
    const graph = JSON.parse(fs.readFileSync(path.resolve(options.graph), 'utf8'));
    console.log('Loaded Graph:', graph);

    // Load contracts
    const contractFiles = fs.readdirSync(path.resolve(options.contracts));
    const contracts: Record<string, ActionContract> = {};
    for (const file of contractFiles) {
      if (file.endsWith('.yml')) {
        const contract = loadYaml<ActionContract>(path.join(path.resolve(options.contracts), file));
        contracts[contract.name] = contract;
      }
    }
    console.log('Loaded Contracts:', contracts);

    let allScenarioVariants: any[] = [];
    for (const scenario of scenarios.scenarios) {
      const variants = await generateScenarioVariants(scenario, options);
      allScenarioVariants = allScenarioVariants.concat(variants);
    }
    console.log('Generated Scenario Variants:', allScenarioVariants);

    const allTraces: ProvenanceRecord[][] = [];
    for (const scenario of allScenarioVariants) {
      const trace = await executeGraph(graph, contracts, scenario);
      allTraces.push(trace);
    }
    console.log('Generated Traces:', allTraces);

    // Implement invariant evaluation
    const invariantResults: Record<string, InvariantResult[]> = {};
    for (const invariantName in invariants.invariants) {
      const invariant = invariants.invariants[invariantName];
      const results: InvariantResult[] = [];
      for (const trace of allTraces) {
        const result = invariant.predicate(trace);
        results.push(result);
      }
      invariantResults[invariantName] = results;
    }
    console.log('Invariant Results:', invariantResults);

    // Implement HTML report generation
    function generateReport(invariantResults: Record<string, InvariantResult[]>, allTraces: ProvenanceRecord[][]): string {
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVS Triage Report</title>
            <style>
                body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
                .container { max-width: 1000px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h1 { color: #333; }
                h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
                .invariant-section { margin-bottom: 20px; padding: 15px; border-radius: 5px; }
                .invariant-section.pass { background-color: #e6ffe6; border: 1px solid #a3e6a3; }
                .invariant-section.fail { background-color: #ffe6e6; border: 1px solid #e6a3a3; }
                pre { background-color: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }
                .trace-item { margin-bottom: 10px; padding: 8px; background-color: #f9f9f9; border-left: 3px solid #ddd; }
                .summary { margin-bottom: 20px; padding: 15px; background-color: #e0f7fa; border-radius: 5px; border: 1px solid #b2ebf2; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>AVS Triage Report</h1>
                <div class="summary">
                    <p>Report generated on: ${new Date().toLocaleString()}</p>
                    <p>Total Scenarios Run: ${allTraces.length}</p>
                </div>
      `;

      for (const invariantName in invariantResults) {
        const results = invariantResults[invariantName];
        const allPass = results.every(r => r.pass);
        const sectionClass = allPass ? 'pass' : 'fail';

        html += `
          <div class="invariant-section ${sectionClass}">
            <h2>Invariant: ${invariantName} - ${allPass ? 'PASS' : 'FAIL'}</h2>
        `;

        if (!allPass) {
          results.forEach((result, index) => {
            if (!result.pass) {
              html += `
                <h3>Scenario ${index + 1} Failed:</h3>
                <p>Reason: ${result.message || 'No specific reason provided.'}</p>
              `;
              if (result.offendingRecords && result.offendingRecords.length > 0) {
                html += `<h4>Offending Records:</h4><pre>${JSON.stringify(result.offendingRecords, null, 2)}</pre>`;
              }
              // Minimal trace for context
              html += `<h4>Full Trace (Scenario ${index + 1}):</h4><pre>${JSON.stringify(allTraces[index], null, 2)}</pre>`;
              // Placeholder for cheapest fix suggestion
              html += `<p><strong>Cheapest Fix Suggestion:</strong> Review the action contract for '${invariantName}' and adjust inputs or preconditions.</p>`;
            }
          });
        }
        html += `</div>`;
      }

      html += `
            </div>
        </body>
        </html>
      `;
      return html;
    }

    const reportHtml = generateReport(invariants.invariants, allTraces);
    fs.writeFileSync(path.resolve(options.report), reportHtml);
    console.log(`Report generated at ${path.resolve(options.report)}`);

    console.log('AVS run complete.');
  });

program.parse(process.argv);
