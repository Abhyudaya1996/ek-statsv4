export const STAGE_CODES = {
  INCOMPLETE: ['a', 'b'] as const,
  KYC: ['c', 'd'] as const,
  UNDERWRITING: ['e'] as const,
  CURING: ['f'] as const,
  WAITING_APPROVAL: ['w'] as const,
  APPROVED: ['z'] as const,
  REJECTED: ['r', 'r2'] as const,
  EXPIRED: ['y'] as const,
  NON_COMMISSIONABLE: ['x'] as const,
} as const;

export type StageCode = typeof STAGE_CODES[keyof typeof STAGE_CODES][number];

export const STAGE_LABELS: Record<keyof typeof STAGE_CODES, string> = {
  INCOMPLETE: 'Incomplete Applications',
  KYC: 'KYC',
  UNDERWRITING: 'Underwriting',
  CURING: 'Curing',
  WAITING_APPROVAL: 'Waiting Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  NON_COMMISSIONABLE: 'Non Commissionable',
};

