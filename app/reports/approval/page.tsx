"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { BankPerformanceChart } from '@/components/charts/bank-performance';
import { EmptyState } from '@/components/ui/empty-state';
import { useFilters } from '@/hooks/use-filters';
import { useApprovalReport } from '@/hooks/use-leads';

export default function ApprovalsReportPage() {
  const { filters } = useFilters();
  const q = useApprovalReport(filters as any);
  const [activeBank, setActiveBank] = React.useState<any | null>(null);

  if (q.isLoading) {
    return (
      <>
        <FilterBar />
        <div className="mt-3 h-40 animate-pulse rounded bg-gray-200" aria-busy="true" />
      </>
    );
  }

  if (q.isError || !q.data) {
    return <EmptyState title="Unable to load approval report" message={(q.error as Error)?.message ?? 'Please try again.'} />;
  }

  const { kpis, banks } = q.data as any;

  return (
    <>
      <FilterBar />

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">Lead Approval Report</h1>
      <p className="mt-1 text-sm leading-5 text-gray-600">
        Analyze your lead approval performance — evaluate rates and bank performance to optimize conversion strategy.
      </p>

      {/* Preset chips under page title */}
      <div className="mb-6 mt-3 flex gap-2">
        <button className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white">Current</button>
        <button className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-600">Last 3</button>
        <button className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-600">Last 6</button>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Approvals</p>
          <p className="text-xl font-bold text-gray-900">{kpis.totalApprovals}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Approval Rate</p>
          <p className="text-xl font-bold text-gray-900">{kpis.approvalRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Top Bank</p>
          <p className="text-sm font-bold text-gray-900">{kpis.topBank.name} ({kpis.topBank.rate.toFixed(1)}%)</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Avg Processing</p>
          <p className="text-xl font-bold text-gray-900">{kpis.avgProcessingDays != null ? `${kpis.avgProcessingDays.toFixed(1)} days` : '—'}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Bank Performance Overview</h2>
        <div className="h-[260px] sm:h-[340px] md:h-[400px]">
          <BankPerformanceChart data={banks} />
        </div>
        {/* Horizontal card deck of top banks */}
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {banks.slice(0, 10).map((b: any) => (
            <button
              key={b.bank}
              onClick={() => setActiveBank(b)}
              className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm tap-anim"
              aria-label={`View ${b.bank} performance details`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{b.bank}</span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{b.rate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[11px] text-gray-500">Leads</p>
                  <p className="text-sm font-semibold">{b.total}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Approved</p>
                  <p className="text-sm font-semibold text-emerald-600">{b.approved}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Avg Days</p>
                  <p className="text-sm font-semibold">{b.avgDays != null ? b.avgDays.toFixed(1) : '—'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Top Performing Banks</h2>
          <select className="rounded border px-2 py-1 text-sm">
            <option>Sort by Rate</option>
            <option>Sort by Approvals</option>
            <option>Sort by Leads</option>
          </select>
        </div>
        <div className="overflow-x-auto pb-1">
          <table className="w-full text-sm align-middle">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Bank</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">Approvals</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {banks.slice(0, 5).map((b: any, idx: number) => (
                <tr key={b.bank} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                        <span className="text-xs font-bold">{b.bank?.slice(0,1)}</span>
                      </div>
                      <span>{b.bank}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{b.total}</td>
                  <td className="px-4 py-3 text-right">{b.approved}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">{b.rate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right">{b.avgDays != null ? b.avgDays.toFixed(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bank detail modal */}
      {activeBank && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold">{activeBank.bank} — Details</h3>
              <button className="rounded px-2 py-1 text-sm ring-1 ring-gray-300" onClick={() => setActiveBank(null)} aria-label="Close details">Close</button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[11px] text-gray-500">Leads</p>
                <p className="text-sm font-semibold">{activeBank.total}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Approved</p>
                <p className="text-sm font-semibold text-emerald-600">{activeBank.approved}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Rate</p>
                <p className="text-sm font-semibold">{activeBank.rate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-xs text-gray-500">Approval Progress</p>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, Math.max(0, (activeBank.approved / Math.max(1, activeBank.total)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
