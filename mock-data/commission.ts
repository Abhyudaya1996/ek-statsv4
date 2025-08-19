// mock-data/commission.ts
export type CommissionSummary = {
  totalCommission: number;
  paidCommission: number;
  confirmedCommission: number;
  pendingCommission: number;
  pendingPredictedFromHistory: number;
};

export const commissionMock: CommissionSummary = {
  totalCommission: 10_00_000, // 10L (Indian numbering: 10,00,000)
  paidCommission: 3_00_000, // 3L
  confirmedCommission: 1_00_000, // 1L
  pendingCommission: 6_00_000, // 6L pending (explicit)
  pendingPredictedFromHistory: 6_00_000, // you asked to "add 6L in mock"
};


