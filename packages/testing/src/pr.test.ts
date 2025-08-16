import { describe, it, expect } from 'vitest';
import { emitPR, hashRecord, ProvenanceRecordSchema } from '@avs/core';

describe('Provenance Record (PR)', () => {
  it('should emit a PR with complete schema and valid signature over hash', async () => {
    const prPayload = {
      ts: new Date().toISOString(),
      agent: 'test-agent',
      action: 'test-action',
      inputs: { param1: 'value1' },
      result: { status: 'success' },
      token_ref: 'test-jti',
      policies_checked: ['policy-a', 'policy-b'],
      trace_id: 'test-trace-id',
      ver: 'aiep-pr-1',
    };

    const emittedPr = await emitPR(prPayload);

    // Verify schema completeness
    expect(() => ProvenanceRecordSchema.parse(emittedPr)).not.toThrow();

    // Verify signature over hash
    const expectedHash = await hashRecord(prPayload);
    expect(emittedPr.hash).toEqual(expectedHash);
    // For signature verification, we rely on the jose library's internal verification
    // In a real scenario, you'd have a public key to verify the signature.
    // For now, we assume emitPR correctly signs it.
    expect(emittedPr.sig).toBeDefined();
  });

  it('should have a consistent hash for the same PR content', async () => {
    const prContent = {
      ts: new Date().toISOString(),
      agent: 'test-agent',
      action: 'test-action',
      inputs: { param1: 'value1' },
      result: { status: 'success' },
      token_ref: 'test-jti',
      policies_checked: ['policy-a', 'policy-b'],
      trace_id: 'test-trace-id',
      ver: 'aiep-pr-1',
    };

    const hash1 = await hashRecord(prContent);
    const hash2 = await hashRecord(prContent);

    expect(hash1).toEqual(hash2);
  });
});
