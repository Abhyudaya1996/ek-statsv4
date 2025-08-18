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
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
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
      <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-gray-800">Total Leads</h3>
        <div className="text-2xl font-bold text-gray-900">{totalLeads.toLocaleString('en-IN')}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-gray-800">Total Commission</h3>
        <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalCommission)}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-gray-800">Pending Commission</h3>
        <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pendingCommission)}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-gray-800">Paid Commission</h3>
        <div className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paidCommission)}</div>
      </div>
    </section>
  );
}


