'use client';

import React from 'react';
import { AlertCircle, TrendingUp, XCircle, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RejectionReport() {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="px-4 py-6">
        <h1 className="mb-1 text-lg font-bold text-gray-900 md:text-xl">Lead Rejection Report</h1>
        <p className="mb-4 text-sm leading-5 text-gray-600">
          Understand lead rejection patterns — identify trends and reduce rejects by focusing on key categories.
        </p>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Rejection Report</h1>

        <div className="mb-6 flex gap-2">
          <button className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white">Current</button>
          <button className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-600">Last 3</button>
          <button className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-600">Last 6</button>
        </div>

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
            <p className="text-xs text-gray-500">Worst Bank</p>
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
