import { describe, it, expect } from 'vitest';
import { signCT, verifyCT, CapabilityTokenSchema } from '@avs/core';

describe('Capability Token (CT)', () => {
  it('should sign and verify a valid CT', async () => {
    const ctPayload = {
      iss: 'test-issuer',
      sub: 'test-subject',
      act: 'test-action',
      res: 'test-resource',
      scope: ['read', 'write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ver: 'aiep-ct-1',
      jti: 'test-jti',
    };

    const signedCt = await signCT(ctPayload);
    const { payload } = await verifyCT(signedCt);

    expect(payload).toMatchObject(ctPayload);
  });

  it('should reject an expired CT', async () => {
    const ctPayload = {
      iss: 'test-issuer',
      sub: 'test-subject',
      act: 'test-action',
      res: 'test-resource',
      scope: ['read', 'write'],
      iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      ver: 'aiep-ct-1',
      jti: 'expired-jti',
    };

    const signedCt = await signCT(ctPayload);

    await expect(verifyCT(signedCt)).rejects.toThrow('JWTExpired');
  });

  it('should reject a CT with invalid signature', async () => {
    const ctPayload = {
      iss: 'test-issuer',
      sub: 'test-subject',
      act: 'test-action',
      res: 'test-resource',
      scope: ['read', 'write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ver: 'aiep-ct-1',
      jti: 'invalid-sig-jti',
    };

    const signedCt = await signCT(ctPayload);
    const tamperedCt = signedCt.slice(0, -5) + 'abcde'; // Tamper with signature

    await expect(verifyCT(tamperedCt)).rejects.toThrow();
  });
});
