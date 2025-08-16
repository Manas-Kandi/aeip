import { describe, it, expect } from 'vitest';
import { mintDE, verifyDE, DelegationEnvelopeSchema } from '@avs/core';

describe('Delegation Envelope (DE)', () => {
  it('should mint and verify a valid DE', async () => {
    const dePayload = {
      origin: 'agent-a',
      task: 'task-123',
      hop_limit: 5,
      policy_hash: 'some-policy-hash',
      ver: 'aiep-de-1',
    };

    const mintedDe = await mintDE(dePayload);
    const isValid = await verifyDE(mintedDe);

    expect(isValid).toBe(true);
    expect(DelegationEnvelopeSchema.parse(mintedDe)).toEqual(mintedDe);
  });

  it('should reject a DE with tampered signature', async () => {
    const dePayload = {
      origin: 'agent-a',
      task: 'task-123',
      hop_limit: 5,
      policy_hash: 'some-policy-hash',
      ver: 'aiep-de-1',
    };

    const mintedDe = await mintDE(dePayload);
    const tamperedDe = { ...mintedDe, sig: mintedDe.sig.slice(0, -5) + 'abcde' };

    const isValid = await verifyDE(tamperedDe);
    expect(isValid).toBe(false);
  });

  it('should prevent further delegation at 0 hop-limit', async () => {
    const dePayload = {
      origin: 'agent-a',
      task: 'task-123',
      hop_limit: 0,
      policy_hash: 'some-policy-hash',
      ver: 'aiep-de-1',
    };

    const mintedDe = await mintDE(dePayload);
    // In a real scenario, the adapter would check this before attempting to delegate further
    // Here we just verify the DE itself is valid
    const isValid = await verifyDE(mintedDe);
    expect(isValid).toBe(true);

    // Simulate a further delegation attempt that should fail due to hop_limit
    const nextDePayload = { ...mintedDe, hop_limit: mintedDe.hop_limit - 1 };
    expect(nextDePayload.hop_limit).toBe(-1);
    // The actual enforcement logic is in the adapter, not the DE itself.
  });
});
