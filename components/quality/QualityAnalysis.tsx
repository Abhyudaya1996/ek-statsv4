// components/quality/QualityAnalysis.tsx
"use client";
import React from 'react';
import { formatCurrencyINR } from '@/lib/utils';
import { useCommissionMetrics } from '@/hooks/use-commission-metrics';

type QualityCounts = { avg: number; bad: number; good: number; unknown: number; total: number };
type CardOutByQuality = { avg: number; good: number; unknown: number; total: number; bad: number };
type RejectionByQuality = {
  avg: { count: number; pct: number };
  bad: { count: number; pct: number };
  good: { count: number; pct: number };
  unknown: { count: number; pct: number };
};

export default function QualityAnalysis() {
  const leadsByQuality: QualityCounts = { avg: 88, bad: 1967, good: 609, unknown: 2336, total: 5000 };
  const cardouts: CardOutByQuality = { avg: 2, good: 383, unknown: 163, bad: 0, total: 548 };
  const rejections: RejectionByQuality = {
    avg: { count: 13, pct: 14.77 },
    bad: { count: 1660, pct: 84.39 },
    good: { count: 56, pct: 9.2 },
    unknown: { count: 583, pct: 24.96 },
  };

  const commission = useCommissionMetrics().potentialCommission;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Quality <span className="font-bold">Good</span></h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <Stat label="Avg" value={leadsByQuality.avg} />
          <Stat label="Bad" value={leadsByQuality.bad} />
          <Stat label="Good" value={leadsByQuality.good} />
          <Stat label="Unknown" value={leadsByQuality.unknown} />
          <Stat label="Grand Total" value={leadsByQuality.total} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Approval Rate (Card-outs)</h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <Stat label="Avg" value={cardouts.avg} />
          <Stat label="Good" value={cardouts.good} />
          <Stat label="Unknown" value={cardouts.unknown} />
          <Stat label="Bad" value={cardouts.bad} />
          <Stat label="Grand Total" value={cardouts.total} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Rejection Rate</h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Avg" value={`${rejections.avg.count} (${rejections.avg.pct}%)`} />
          <Stat label="Bad" value={`${rejections.bad.count} (${rejections.bad.pct}%)`} />
          <Stat label="Good" value={`${rejections.good.count} (${rejections.good.pct}%)`} />
          <Stat label="Unknown" value={`${rejections.unknown.count} (${rejections.unknown.pct}%)`} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Earnings (Potential Commission)</h3>
        <p className="mt-2 text-2xl font-semibold">{formatCurrencyINR(commission)}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}


