import { ProvenanceRecord } from '../zod_schemas';

export type InvariantPredicate = (trace: ProvenanceRecord[]) => InvariantResult;

export interface Invariant {
  name: string;
  description: string;
  predicate: InvariantPredicate;
}

export interface InvariantResult {
  pass: boolean;
  message?: string;
  offendingRecords?: ProvenanceRecord[];
}
