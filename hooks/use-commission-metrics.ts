"use client";
import React from 'react';
import { useCommission, useDashboardKpis } from '@/hooks/use-leads';
import type { FilterOptions } from '@/lib/validations';

export interface CommissionMetrics {
  totalLeads: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

type UseCommissionMetricsResult = {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  data?: CommissionMetrics;
};

export function useCommissionMetrics(filters: FilterOptions): UseCommissionMetricsResult {
  const commissionQuery = useCommission(filters);
  const kpisQuery = useDashboardKpis(filters);

  const isLoading = commissionQuery.isLoading || kpisQuery.isLoading;
  const isError = commissionQuery.isError || kpisQuery.isError;
  const error = (commissionQuery.error as Error) || (kpisQuery.error as Error) || null;

  const data: CommissionMetrics | undefined = React.useMemo(() => {
    if (!commissionQuery.data || !kpisQuery.data) return undefined;
    const commission = commissionQuery.data as unknown as { total?: number; pending?: number; paid?: number };
    const kpis = kpisQuery.data as unknown as { totalLeads?: number };

    const toNumber = (v: unknown): number => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));
    const round2 = (n: number): number => Math.round(n * 100) / 100;

    return {
      totalLeads: toNumber(kpis.totalLeads),
      totalCommission: round2(toNumber(commission.total)),
      pendingCommission: round2(toNumber(commission.pending)),
      paidCommission: round2(toNumber(commission.paid)),
    };
  }, [commissionQuery.data, kpisQuery.data]);

  return { isLoading, isError, error, data };
}


