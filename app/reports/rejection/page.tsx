'use client';

import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { useFilters } from '@/hooks/use-filters';
import { AlertCircle, TrendingUp, XCircle, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RejectionReport() {
  const { filters } = useFilters();
  const kpis = {
    totalRejections: 543,
    topReason: 'Policy Reject',
    rejectionRate: 45.3,
    worstBank: 'HDFC',
  };

  const bankData = [
    { bank: 'HDFC', rejected: 189, total: 420 },
    { bank: 'Axis', rejected: 152, total: 380 },
    { bank: 'ICICI', rejected: 102, total: 340 },
    { bank: 'SBI', rejected: 70, total: 280 },
  ];

  const reasons = [
    { category: 'Policy', reason: 'Internal Policy Reject', count: 127, percentage: 23.4 },
    { category: 'Credit', reason: 'Low Credit Score', count: 89, percentage: 16.4 },
    { category: 'Docs', reason: 'Incomplete Documents', count: 76, percentage: 14.0 },
    { category: 'Income', reason: 'Income Criteria Not Met', count: 65, percentage: 12.0 },
  ];

  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  // Derive quality per bank using rejection rate; add lead mix
  const banksWithQuality = bankData.map((b) => {
    const approvals = Math.max(0, (b.total ?? 0) - (b.rejected ?? 0));
    const rejectionRate = (Math.max(0, b.rejected ?? 0) / Math.max(1, b.total)) * 100;
    let quality: 'Good' | 'Avg' | 'Bad' | 'Unknown';
    if (!b.total) quality = 'Unknown';
    else if (rejectionRate < 25) quality = 'Good';
    else if (rejectionRate < 50) quality = 'Avg';
    else quality = 'Bad';
    return { ...b, approvals, rejectionRate, quality };
  });
  const [qualityFilter, setQualityFilter] = React.useState<'all' | 'Good' | 'Avg' | 'Bad' | 'Unknown'>('all');
  const filteredBanks = React.useMemo(() => (
    qualityFilter === 'all' ? banksWithQuality : banksWithQuality.filter(b => b.quality === qualityFilter)
  ), [banksWithQuality, qualityFilter]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <FilterBar />
      <div className="px-4 py-6">
        <h1 className="mb-1 text-lg font-bold text-gray-900 md:text-xl">Lead Rejection Report</h1>
        <p className="mb-4 text-sm leading-5 text-gray-600">
          Understand lead rejection patterns — identify trends and reduce rejects by focusing on key categories.
        </p>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Rejection Report</h1>

        {/* Time chips are already provided by FilterBar at the top */}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <XCircle className="h-8 w-8 text-red-500" />
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xs text-gray-500">Total Rejections</p>
            <p className="text-xl font-bold text-gray-900">{kpis.totalRejections}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <AlertCircle className="mb-2 h-8 w-8 text-orange-500" />
            <p className="text-xs text-gray-500">Top Reason</p>
            <p className="text-sm font-bold text-gray-900">{kpis.topReason}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Rejection Rate</p>
            <p className="text-xl font-bold text-red-600">{kpis.rejectionRate}%</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Bank with Most Rejects</p>
            <p className="text-lg font-bold text-gray-900">{kpis.worstBank}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Bank-wise Rejections</h2>
          <div className="h-[240px] sm:h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankData}>
                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                <XAxis dataKey="bank" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="rejected" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quality table */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bank quality overview</h3>
              <label className="text-sm text-gray-600 inline-flex items-center gap-2">
                Quality
                <select value={qualityFilter} onChange={(e)=> setQualityFilter(e.target.value as any)} className="rounded border px-2 py-1 text-sm">
                  <option value="all">All</option>
                  <option value="Good">Good</option>
                  <option value="Avg">Avg</option>
                  <option value="Bad">Bad</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto pb-1">
              <table className="w-full text-sm align-middle">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">Bank</th>
                    <th className="px-3 py-2 text-right">Leads</th>
                    <th className="px-3 py-2 text-right">Rejected</th>
                    <th className="px-3 py-2 text-right">Rejection Rate</th>
                    <th className="px-3 py-2 text-right">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanks.map((b) => (
                    <tr 
                      key={b.bank}
                      onClick={() => {
                        // Future: Navigate to bank rejection detail view
                        console.log('Bank clicked:', b.bank);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          console.log('Bank selected:', b.bank);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
                    >
                      <td className="px-3 py-2">{b.bank}</td>
                      <td className="px-3 py-2 text-right">{b.total}</td>
                      <td className="px-3 py-2 text-right">{b.rejected}</td>
                      <td className="px-3 py-2 text-right">{b.rejectionRate.toFixed(1)}%</td>
                      <td className={`px-3 py-2 text-right font-semibold ${b.quality==='Bad'?'text-red-600': b.quality==='Avg'?'text-amber-600': b.quality==='Good'?'text-emerald-600':'text-gray-600'}`}>{b.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reasons - mobile-friendly, tappable rows */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">Rejection Analysis</h2>
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y">
            {reasons.map((reason, i) => {
              const isOpen = openIdx === i;
              return (
                <button
                  key={i}
                  className="w-full px-4 py-3 text-left tap-anim"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${reason.category === 'Policy' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{reason.category}</span>
                      <span className="text-sm font-medium text-gray-900">{reason.reason}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{reason.count}</p>
                      <p className="text-xs text-red-600">{reason.percentage}%</p>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
                      Tap insights: This category represents {reason.percentage}% of total leads. Focus on documentation and policy alignment to reduce rejects.
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
