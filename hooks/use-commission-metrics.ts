"use client";
import { useMemo } from 'react';
import type { FilterOptions } from '@/lib/validations';
import { commissionMock } from '@/mock-data/commission';

export function useCommissionMetrics(_filters?: FilterOptions) {
  const data = commissionMock;

  const potentialCommission = useMemo(() => {
    return (
      data.paidCommission +
      data.confirmedCommission +
      data.pendingPredictedFromHistory
    );
  }, [data]);

  return {
    totalCommission: data.totalCommission,
    paidCommission: data.paidCommission,
    confirmedCommission: data.confirmedCommission,
    pendingCommission: data.pendingCommission,
    pendingPredictedFromHistory: data.pendingPredictedFromHistory,
    potentialCommission,
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
  };
}


