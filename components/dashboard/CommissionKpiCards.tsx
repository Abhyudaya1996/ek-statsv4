"use client";
import React from 'react';
import { KPICard } from '@/components/ui/kpi-card';
import { useFilters } from '@/hooks/use-filters';
import { useCommissionMetrics } from '@/hooks/use-commission-metrics';

export function CommissionKpiCards() {
  const { filters } = useFilters();
  const q = useCommissionMetrics(filters as any);

  if (q.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
        Unable to load commission metrics. {q.error?.message ?? 'Please try again later.'}
      </div>
    );
  }

  const { totalLeads, totalCommission, pendingCommission, paidCommission } = q.data;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <KPICard title="Total Leads" value={totalLeads} format="number" ariaLabel="Total Leads" />
      <KPICard title="Total Commission" value={totalCommission} format="currency" ariaLabel="Total Commission" />
      <KPICard title="Pending Commission" value={pendingCommission} format="currency" ariaLabel="Pending Commission" />
      <KPICard title="Paid Commission" value={paidCommission} format="currency" ariaLabel="Paid Commission" />
    </section>
  );
}


