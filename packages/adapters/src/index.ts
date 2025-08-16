import axios from 'axios';
import { CapabilityToken, DelegationEnvelope, ProvenanceRecord, signCT, verifyCT, mintDE, emitPR } from '@avs/core';

interface AIEPConfig {
  act: string;
  res: string;
  scope: string[];
  gatewayUrl?: string;
}

export function withAIEP<T extends (...args: any[]) => Promise<any>>(
  actionFn: T,
  config: AIEPConfig
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const gatewayUrl = config.gatewayUrl || 'http://localhost:3001';

    // 1. Fetch a scoped CT from the gateway.
    let ct: CapabilityToken | undefined;
    try {
      const ctResponse = await axios.post(`${gatewayUrl}/mint-ct`, {
        sub: 'agent-id', // Replace with actual agent ID
        act: config.act,
        res: config.res,
        scope: config.scope,
        ttl: 3600,
      });
      ct = ctResponse.data.token;
    } catch (error) {
      console.error('Error fetching CT:', error);
      throw new Error('Failed to obtain Capability Token');
    }

    // 2. Validate DE (if provided), decrement hop_limit, re-sign as needed.
    // This is a simplified example. A real implementation would involve more complex DE handling.
    let currentDe: DelegationEnvelope | undefined;
    // Assuming DE is passed as the last argument for simplicity in this example
    if (args.length > 0 && typeof args[args.length - 1] === 'object' && (args[args.length - 1] as any).ver === 'aiep-de-1') {
      currentDe = args[args.length - 1] as DelegationEnvelope;
      if (currentDe.hop_limit <= 0) {
        throw new Error('Delegation hop limit exceeded.');
      }
      currentDe.hop_limit--;
      // Re-sign DE (simplified - in a real scenario, this would involve the delegating agent's key)
      currentDe = await mintDE(currentDe);
    }

    // 3. Call actionFn(params).
    const inputs = args[0]; // Assuming inputs are the first argument
    let result: ReturnType<T>;
    try {
      result = await actionFn(...args);
    } catch (error) {
      console.error('Error executing action function:', error);
      throw error;
    }

    // 4. Emit a PR to gateway with inputs/result and policies_checked.
    const pr: Omit<ProvenanceRecord, 'hash' | 'sig'> = {
      ts: new Date().toISOString(),
      agent: 'agent-id', // Replace with actual agent ID
      action: config.act,
      inputs: inputs,
      result: result,
      token_ref: ct ? (await verifyCT(ct)).payload.jti : 'no-token',
      policies_checked: [], // Placeholder
      trace_id: 'some-trace-id', // Placeholder
      ver: 'aiep-pr-1',
    };

    try {
      const emittedPr = await emitPR(pr);
      await axios.post(`${gatewayUrl}/ingest-pr`, emittedPr);
    } catch (error) {
      console.error('Error ingesting PR:', error);
    }

    return result;
  };
}

// Example Adapter for a fake tool (send_email)
interface SendEmailInputs {
  to: string;
  subject: string;
  body: string;
}

interface SendEmailResult {
  message_id: string;
  status: string;
}

const sendEmailFn = async (inputs: SendEmailInputs): Promise<SendEmailResult> => {
  console.log(`Sending email to ${inputs.to} with subject: ${inputs.subject}`);
  // Simulate email sending
  return { message_id: `msg-${Date.now()}`, status: 'sent' };
};

export const sendEmail = withAIEP(sendEmailFn, {
  act: 'send_email',
  res: 'email:*',
  scope: ['email.send'],
});

// Tiny "downstream delegate" to simulate a handoff
interface DownstreamDelegateInputs {
  task: string;
  data: any;
  delegationEnvelope?: DelegationEnvelope;
}

interface DownstreamDelegateResult {
  status: string;
  processed_data: any;
}

const downstreamDelegateFn = async (inputs: DownstreamDelegateInputs): Promise<DownstreamDelegateResult> => {
  console.log(`Downstream delegate processing task: ${inputs.task}`);
  // Simulate some processing
  return { status: 'processed', processed_data: inputs.data };
};

export const downstreamDelegate = withAIEP(downstreamDelegateFn, {
  act: 'downstream_process',
  res: 'task:*',
  scope: ['task.process'],
});
