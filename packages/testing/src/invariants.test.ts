import { describe, it, expect } from 'vitest';
import { piiNotInEmail, ProvenanceRecord, InvariantResult } from '@avs/core';

describe('Invariants', () => {
  it('should detect PII in email subject or body', () => {
    const traceWithPii: ProvenanceRecord[] = [
      {
        ts: new Date().toISOString(),
        agent: 'test-agent',
        action: 'send_email',
        inputs: { to: 'test@example.com', subject: 'Order Confirmation', body: 'Your SSN is 123-45-678.' },
        result: { status: 'sent' },
        token_ref: 'jti-1',
        policies_checked: [],
        trace_id: 'trace-1',
        hash: 'hash-1',
        sig: 'sig-1',
        ver: 'aiep-pr-1',
      },
    ];

    const result = piiNotInEmail(traceWithPii);
    expect(result.pass).toBe(false);
    expect(result.message).toContain('PII found');
    expect(result.offendingRecords).toHaveLength(1);
  });

  it('should pass if no PII is found in email', () => {
    const traceWithoutPii: ProvenanceRecord[] = [
      {
        ts: new Date().toISOString(),
        agent: 'test-agent',
        action: 'send_email',
        inputs: { to: 'test@example.com', subject: 'Order Confirmation', body: 'Your order is confirmed.' },
        result: { status: 'sent' },
        token_ref: 'jti-2',
        policies_checked: [],
        trace_id: 'trace-2',
        hash: 'hash-2',
        sig: 'sig-2',
        ver: 'aiep-pr-1',
      },
    ];

    const result = piiNotInEmail(traceWithoutPii);
    expect(result.pass).toBe(true);
  });
});
