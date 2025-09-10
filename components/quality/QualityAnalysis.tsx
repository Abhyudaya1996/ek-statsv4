// components/quality/QualityAnalysis.tsx
"use client";
import React from 'react';
import { useFilters } from '@/hooks/use-filters';
import { useQuality } from '@/hooks/use-quality';

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
  const { filters } = useFilters();
  const { data, isLoading, error } = useQuality(filters);
  const rows: any[] = data?.byQuality ?? [];

  if (isLoading) return <div className="rounded-xl border bg-white p-4">Loading quality…</div>;
  if (error) return <div className="rounded-xl border bg-white p-4 text-red-600">Failed to load quality</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Quality Overview</h3>
        <p className="mt-1 text-xs text-gray-600">Live per-quality metrics with KYC breakdown.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((r) => (
            <CategoryCard key={r.quality} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ r }: { r: any }) {
  const q = (String(r.quality || 'Unknown').toLowerCase() as QualityKey) || 'unknown';
  const label = LABEL_BY_KEY[q] || r.quality || 'Unknown';
  const tone = TONE_BY_KEY[q] || 'text-gray-800';
  const leads = Number(r.leads ?? 0);
  const cardouts = Number(r.approvals ?? 0);
  const rejCount = Number(r.rejections ?? 0);
  const rejPct = leads ? Number(((rejCount / leads) * 100).toFixed(2)) : 0;
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
        <Stat label="KYC Done" value={Number(r.kycDone ?? 0)} />
        <Stat label="KYC Pending" value={Number(r.kycPending ?? 0)} />
        <Stat label="Approved" value={cardouts} />
        <Stat label="Rejected" value={rejCount} />
        <Stat label="Rejection Rate" value={`${rejPct}%`} />
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


