import { z } from 'zod';

export const CapabilityTokenSchema = z.object({
  iss: z.string(),
  sub: z.string(),
  act: z.string(),
  res: z.string(),
  scope: z.array(z.string()),
  limits: z.record(z.any()).optional(),
  iat: z.number(),
  exp: z.number(),
  ver: z.literal('aiep-ct-1'),
  jti: z.string(),
});

export type CapabilityToken = z.infer<typeof CapabilityTokenSchema>;

export const DelegationEnvelopeSchema = z.object({
  origin: z.string(),
  task: z.string(),
  hop_limit: z.number().min(0),
  policy_hash: z.string(),
  ver: z.literal('aiep-de-1'),
  sig: z.string(),
});

export type DelegationEnvelope = z.infer<typeof DelegationEnvelopeSchema>;

export const ActionContractSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  inputs: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.array(z.any()), z.null()])),
  outputs: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}), z.array(z.any()), z.null()])),
  preconditions: z.array(z.string()).optional(),
  side_effects: z.array(z.string()).optional(),
  idempotent: z.boolean().default(true),
  compensation: z.string().optional(),
});

export type ActionContract = z.infer<typeof ActionContractSchema>;

export const ProvenanceRecordSchema = z.object({
  ts: z.string().datetime(),
  agent: z.string(),
  action: z.string(),
  inputs: z.object({}),
  result: z.object({}),
  token_ref: z.string(),
  policies_checked: z.array(z.string()).optional(),
  trace_id: z.string().optional(),
  hash: z.string(),
  sig: z.string(),
  ver: z.literal('aiep-pr-1'),
});

export type ProvenanceRecord = z.infer<typeof ProvenanceRecordSchema>;

