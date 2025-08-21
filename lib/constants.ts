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

export const TOOLTIP_COPY = {
  commission: {
    potential:
      'Projected commission assuming 10% of pending leads convert — a conservative baseline from your past approvals.',
    pendingConfirmation:
      'Commission from approved leads that are still awaiting confirmation from the bank/network.',
    available:
      'Confirmed commission that’s ready to withdraw now.',
    paid:
      'Commission already withdrawn by you.',
  },
  funnel: {
    clicks: 'Total clicks from your content.',
    leads: 'Users who submitted an application with the bank.',
    incomplete: 'Users who started the form but dropped off.',
    kyc: 'Applicants currently at the KYC stage.',
    verification: 'Bank is verifying documents/KYC — final decision pending.',
  },
  kpis: {
    totalApprovals: 'Total card-outs.',
    approvalRate: 'Card-outs ÷ Leads × 100.',
    avgProcessing: 'Average time from application to card-out.',
  },
} as const;

