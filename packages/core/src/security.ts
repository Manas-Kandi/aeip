import * as jose from 'jose';
import { CapabilityToken, DelegationEnvelope, ProvenanceRecord } from './zod_schemas';

const secret = new TextEncoder().encode(process.env.AIEP_SIGNING_SECRET || 'dev-only-not-for-prod');
const alg = 'HS256';

export async function signCT(payload: CapabilityToken): Promise<string> {
  return await new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .setJti(payload.jti)
    .sign(secret);
}

export async function verifyCT(jwt: string): Promise<jose.JWTVerifyResult> {
  return await jose.jwtVerify(jwt, secret);
}

async function sign(payload: string): Promise<string> {
  const jws = await new jose.CompactSign(new TextEncoder().encode(payload))
    .setProtectedHeader({ alg })
    .sign(secret);
  return jws;
}

async function verify(payload: string, signature: string): Promise<boolean> {
  try {
    const { payload: verifiedPayload } = await jose.compactVerify(signature, secret);
    return new TextDecoder().decode(verifiedPayload) === payload;
  } catch {
    return false;
  }
}

export async function mintDE(de: Omit<DelegationEnvelope, 'sig'>): Promise<DelegationEnvelope> {
  const payload = `${de.origin}|${de.task}|${de.hop_limit}|${de.policy_hash}|${de.ver}`;
  const sig = await sign(payload);
  return { ...de, sig };
}

export async function verifyDE(de: DelegationEnvelope): Promise<boolean> {
    const payload = `${de.origin}|${de.task}|${de.hop_limit}|${de.policy_hash}|${de.ver}`;
    return await verify(payload, de.sig);
}

export async function hashRecord(pr: Omit<ProvenanceRecord, 'hash' | 'sig'>): Promise<string> {
    const prString = JSON.stringify(pr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(prString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function emitPR(pr: Omit<ProvenanceRecord, 'hash' | 'sig'>): Promise<ProvenanceRecord> {
    const hash = await hashRecord(pr);
    const sig = await sign(hash);
    return { ...pr, hash, sig };
}

