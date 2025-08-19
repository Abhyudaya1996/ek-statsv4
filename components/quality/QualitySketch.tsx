'use client';
import React from 'react';
import { QUALITY_LEADS, CARD_OUTS, REJECTION } from '@/lib/mock/quality';

type BucketKey = 'good' | 'avg' | 'bad' | 'unknown';

const ORDER: Array<{ key: BucketKey; label: string; tone?: 'good' | 'warn' | 'bad' }> = [
  { key: 'good', label: 'Good', tone: 'good' },
  { key: 'avg', label: 'Avg' },
  { key: 'bad', label: 'Bad', tone: 'bad' },
  { key: 'unknown', label: 'Unknown' },
];

export default function QualitySketch() {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 text-base font-semibold text-gray-900">Quality Analysis</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ORDER.map(({ key, label, tone }) => (
          <QualityCard key={key} bucketKey={key} label={label} tone={tone} />)
        )}
      </div>
    </section>
  );
}

function QualityCard({ bucketKey, label, tone }: { bucketKey: BucketKey; label: string; tone?: 'good' | 'warn' | 'bad' }) {
  const leads = QUALITY_LEADS[bucketKey] ?? 0;
  const cardouts = CARD_OUTS[bucketKey] ?? 0;
  const rejected = REJECTION[bucketKey]?.count ?? 0;
  const rejectionRate = REJECTION[bucketKey]?.pct ?? 0;
  const approvalRate = leads ? (cardouts / leads) * 100 : 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Quality <span className="font-bold">{label}</span></h4>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Leads" value={leads.toLocaleString()} tone={tone === 'good' ? 'good' : undefined} />
        <Stat label="Approval Rate" value={`${approvalRate.toFixed(1)}%`} tone="good" />
        <Stat label="Cardouts" value={cardouts.toLocaleString()} />
        <Stat label="Rejection Rate" value={`${rejectionRate}%`} tone="warn" />
        <Stat label="Total Rejected" value={rejected.toLocaleString()} tone="bad" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
  const toneClass =
    tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : tone === 'bad' ? 'text-red-600' : 'text-gray-900';
  return (
    <div className="grid min-h-[74px] content-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-[19px] font-bold tabular-nums md:text-[20px] ${toneClass}`}>{value}</p>
    </div>
  );
}


