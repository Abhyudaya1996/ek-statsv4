'use client';
import React from 'react';

export default function QualitySketch() {
  const good = { leads: 200, approvalRate: 57, cardouts: 120, rejectionRate: 45 };

  return (
    <section className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-gray-900">Quality <span className="font-bold">Good</span></h3>
        <span className="text-xs text-gray-500">Mobile-first</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Leads" value={good.leads} tone="good" />
        <Stat label="Approval Rate" value={`${good.approvalRate}%`} tone="good" />
        <Stat label="Cardouts" value={good.cardouts} />
        <Stat label="Rejection Rate" value={`${good.rejectionRate}%`} tone="warn" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
  const toneClass =
    tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : tone === 'bad' ? 'text-red-600' : 'text-gray-900';
  return (
    <div className="grid min-h-[76px] content-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-[20px] font-bold tabular-nums md:text-[22px] ${toneClass}`}>{value}</p>
    </div>
  );
}


