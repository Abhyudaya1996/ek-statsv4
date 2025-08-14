"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { formatPercentageSafe, formatCurrencyINR } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { useFilters } from '@/hooks/use-filters';
import { useFunnel } from '@/hooks/use-leads';

export default function FunnelPage() {
  const { filters } = useFilters();
  const q = useFunnel(filters as any);

  if (q.isLoading) {
    return (
      <>
        <FilterBar />
        <div className="mt-3 h-64 animate-pulse rounded-lg bg-gray-200" aria-busy="true" />
      </>
    );
  }

  if (q.isError || !q.data) {
    return <EmptyState title="Unable to load funnel" message={(q.error as Error)?.message ?? 'Please try again.'} />;
  }

  const { clicks, leads, stages, quality } = q.data as any;

  const approvalRate = Number(formatPercentageSafe(stages.approved, leads).replace('%', '')) || 0;
  const rejectionRate = Number(formatPercentageSafe(stages.rejected, leads).replace('%', '')) || 0;

  const bar = (label: string, value: number, pct: string, color: string, height = 'h-8') => (
    <div className="flex items-center">
      <div className="w-24 text-xs text-gray-600">{label}</div>
      <div className="flex-1">
        <div className="w-full rounded bg-gray-100">
          <div className={`${color} ${height} rounded tap-anim`} style={{ width: `${Math.max(5, Math.min(100, Number(pct.replace('%',''))))}%` }}>
            <span className={`text-white text-[11px] px-2 leading-8 ${height === 'h-6' ? 'leading-6' : ''}`}>{value} {pct ? `(${pct})` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <FilterBar />

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">Lead Funnel Report</h1>
      <p className="mt-1 text-sm leading-5 text-gray-600">
        Gain insight into your lead conversion funnel. Track progression from clicks to approvals and identify bottlenecks.
      </p>

      {/* Top KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3"><p className="text-xs text-gray-500">Total Clicks</p><p className="text-xl font-bold">{clicks}</p></div>
        <div className="rounded-lg border border-gray-200 bg-white p-3"><p className="text-xs text-gray-500">Total Leads</p><p className="text-xl font-bold">{leads}</p></div>
        <div className="rounded-lg border border-gray-200 bg-white p-3"><p className="text-xs text-gray-500">Approval Rate</p><p className="text-xl font-bold">{formatPercentageSafe(stages.approved, leads)}</p></div>
        <div className="rounded-lg border border-gray-200 bg-white p-3"><p className="text-xs text-gray-500">Rejection Rate</p><p className="text-xl font-bold">{formatPercentageSafe(stages.rejected, leads)}</p></div>
      </div>

      {/* Scrollable vertical funnel for mobile */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Lead Conversion Funnel</h2>
        <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3">
          {bar('Clicks', clicks, '100%', 'bg-blue-500')}
          {bar('Leads', leads, formatPercentageSafe(leads, clicks), 'bg-green-500')}
          <div className="pl-6 space-y-2">
            {bar('├ Incomplete', stages.incomplete, formatPercentageSafe(stages.incomplete, leads), 'bg-gray-400', 'h-6')}
            {bar('├ KYC', stages.kyc, formatPercentageSafe(stages.kyc, leads), 'bg-yellow-500', 'h-6')}
            {bar('├ Verification', stages.verification, formatPercentageSafe(stages.verification, leads), 'bg-indigo-500', 'h-6')}
            {bar('├ Cardouts', stages.approved, formatPercentageSafe(stages.approved, leads), 'bg-emerald-600', 'h-6')}
            {bar('├ Rejected', stages.rejected, formatPercentageSafe(stages.rejected, leads), 'bg-red-500', 'h-6')}
            {bar('└ Expired', stages.expired, formatPercentageSafe(stages.expired, leads), 'bg-gray-500', 'h-6')}
          </div>
        </div>
      </div>

      {/* Quality Analysis */}
      <h2 className="mt-6 mb-2 text-base font-semibold text-gray-900">Quality Analysis</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(quality ?? []).map((row: any, idx: number) => {
          const border = row.label === 'Good' ? 'border-green-500' : row.label === 'Avg' ? 'border-amber-500' : row.label === 'Bad' ? 'border-red-500' : 'border-gray-300';
          return (
            <div key={idx} className={`rounded-xl border-2 bg-white p-4 ${border}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded px-2 py-1 text-xs font-semibold ${row.label === 'Good' ? 'bg-green-100 text-green-800' : row.label === 'Avg' ? 'bg-amber-100 text-amber-800' : row.label === 'Bad' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{row.label ?? 'Unknown'}</span>
                <span className="text-sm font-medium">{row.leads ?? 0} leads</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Cardout Rate</p>
                  <p className="text-xl font-bold">{row.cardoutRate != null ? `${Number(row.cardoutRate).toFixed(1)}%` : '—'}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Earnings</p>
                    <p className="text-sm font-semibold">{formatCurrencyINR(row.earnings ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rejections</p>
                    <p className="text-sm">{row.rejections ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
