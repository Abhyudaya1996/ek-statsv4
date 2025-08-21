// components/quality/QualityAnalysis.tsx
"use client";
import React from 'react';
import { formatCurrencyINR } from '@/lib/utils';
import { QUALITY_LEADS, CARD_OUTS, REJECTION, POTENTIAL_COMMISSION } from '@/lib/mock/quality';

type QualityKey = 'good' | 'avg' | 'bad' | 'unknown';

const LABEL_BY_KEY: Record<QualityKey, string> = {
  good: 'Good',
  avg: 'Average',
  bad: 'Bad',
  unknown: 'Unknown',
};

const TONE_BY_KEY: Record<QualityKey, string> = {
  good: 'text-emerald-700',   // success
  avg: 'text-gray-800',       // neutral
  bad: 'text-amber-700',      // warn
  unknown: 'text-gray-800',   // neutral
};

export default function QualityAnalysis() {
  const keys: QualityKey[] = ['good', 'avg', 'bad', 'unknown'];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Quality Overview</h3>
        <p className="mt-1 text-xs text-gray-600">Cards show per-quality segment metrics. Rejected Cards added for each segment.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {keys.map((k) => (
            <CategoryCard key={k} q={k} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Earnings (Potential Commission)</h3>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Potential Commission</p>
            <p className="text-2xl font-semibold">{formatCurrencyINR(POTENTIAL_COMMISSION.total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Available for payment</p>
            <p className="text-xl font-semibold">{formatCurrencyINR(POTENTIAL_COMMISSION.availableForPayment)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending for confirmation</p>
            <p className="text-xl font-semibold">{formatCurrencyINR(POTENTIAL_COMMISSION.pendingForConfirmation)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ q }: { q: QualityKey }) {
  const label = LABEL_BY_KEY[q];
  const tone = TONE_BY_KEY[q];
  const leads = QUALITY_LEADS[q as keyof typeof QUALITY_LEADS] as number;
  const cardouts = CARD_OUTS[q as keyof typeof CARD_OUTS] as number;
  const rej = REJECTION[q as keyof typeof REJECTION] as { count: number; pct: number };
  // background by quality
  const bgByQ: Record<QualityKey, string> = {
    good: 'bg-[#ecfdf5] border-[#d1fae5]',      // success bg
    avg: 'bg-white border-[#eef2f7]',           // neutral
    bad: 'bg-[#fff7ed] border-[#fde68a]',       // warn
    unknown: 'bg-white border-[#eef2f7]',       // neutral
  };
  return (
    <section className={`rounded-lg border p-3 shadow-sm ${bgByQ[q]}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Quality <span className={tone}>{label}</span></h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Stat label="Leads" value={leads} />
        <Stat label="Cardouts" value={cardouts} />
        <Stat label="Rejected Cards" value={rej.count} />
        <Stat label="Rejection Rate" value={`${rej.pct}%`} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
    </div>
  );
}


