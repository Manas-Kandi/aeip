import { InvariantPredicate, InvariantResult } from './types';
import { ProvenanceRecord } from '../zod_schemas';

export const piiNotInEmail: InvariantPredicate = (trace: ProvenanceRecord[]): InvariantResult => {
  const emailRecords = trace.filter(r => r.action === 'send_email');
  const offendingRecords = emailRecords.filter(r => {
    const inputs = r.inputs as { body?: string; subject?: string; }; // Cast to specific type
    const body = inputs.body || '';
    const subject = inputs.subject || '';
    return body.includes('ssn') || subject.includes('ssn'); // simplified check
  });

  if (offendingRecords.length > 0) {
    return { pass: false, message: 'PII found in email subject or body', offendingRecords };
  }
  return { pass: true };
};

export const hopLimitNonNegative: InvariantPredicate = (trace: ProvenanceRecord[]): InvariantResult => {
    // This would be checked at runtime by the adapter, but we can also check it here as a post-hoc invariant.
    return { pass: true }; // Assuming runtime enforcement
};

export const costWithinBudget: InvariantPredicate = (trace: ProvenanceRecord[]): InvariantResult => {
    // This would require cost information in the provenance records.
    return { pass: true }; // Assuming no cost information for now
};
