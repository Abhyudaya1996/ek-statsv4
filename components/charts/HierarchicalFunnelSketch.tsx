'use client';

import React from 'react';
import { FUNNEL } from '@/mock-data/funnel-quality';

type Step = {
  id: string;
  name: string;
  count: number;
  pct: number;        // display percent
  level?: 0 | 1;      // 0 root, 1 child (indented)
  tone?: 'good' | 'warn' | 'bad';
};

const TONE_BY_ID: Record<string, Step['tone']> = {
  clicks: 'good',
  leads: 'good',
  incomplete: 'warn',
  'kyc-done': 'good',
  'kyc-pend': 'warn',
  verify: undefined,
  reject: 'bad',
  expired: undefined,
  approved: 'good',
};

const ORDER = ['clicks','leads','incomplete','kyc','kyc-done','kyc-pend','verify','reject','expired','approved'];

function buildSteps(): Step[] {
  return [...FUNNEL]
    .sort((a,b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id))
    .map(n => ({
      id: n.id,
      name: n.label,
      count: n.value,
      pct: n.percent,
      level: n.parent === 'kyc' ? 1 : 0,
      tone: TONE_BY_ID[n.id],
    }));
}

const toneDot: Record<NonNullable<Step['tone']>, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-red-500',
};

const toneFill: Record<NonNullable<Step['tone']>, string> = {
  good: '#059669',
  warn: '#d97706',
  bad: '#dc2626',
};

export default function HierarchicalFunnelSketch() {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900">Lead Conversion Funnel</h3>
      <p className="mb-4 text-[13px] text-gray-600">
        Clicks &amp; Leads are 100%. Other stages are % of Leads; KYC Done/Pending are % of KYC.
      </p>

      {/* Centered, high-contrast layout */}
      <div className="relative mx-auto w-full max-w-[820px]">
        <span className="pointer-events-none absolute left-3 top-1 bottom-1 hidden w-0.5 bg-gray-200 sm:block" />
        {buildSteps().map((s) => {
          const pct = Math.max(0, Math.min(100, s.pct));
          const dot = s.tone ? toneDot[s.tone] : 'bg-blue-600';

          // Compose a stacked bar for KYC using its children (kyc-done, kyc-pend)
          if (s.id === 'kyc') {
            const done = FUNNEL.find(n => n.id === 'kyc-done');
            const pend = FUNNEL.find(n => n.id === 'kyc-pend');
            const totalKyc = Math.max(1, s.count);
            const doneShare = done ? (done.value / totalKyc) * 100 : 0;
            const pendShare = pend ? (pend.value / totalKyc) * 100 : 0;
            const baseBarPct = pct; // overall KYC vs Leads
            return (
              <div key={s.id} className="grid grid-cols-[28px,240px,1fr,112px] md:grid-cols-[28px,280px,1fr,128px] items-center gap-3 py-2">
                <div className="relative hidden sm:block">
                  <span className={`absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full ${dot}`} />
                </div>
                <div className="flex items-center">
                  <span className="text-[13px] font-medium text-gray-900">{s.name}</span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="relative h-full" style={{ width: `${baseBarPct}%` }}>
                    <div className="absolute left-0 top-0 h-full" style={{ width: `${doneShare}%`, backgroundColor: toneFill['good'] }} />
                    <div className="absolute top-0 h-full" style={{ left: `${doneShare}%`, width: `${Math.max(0, pendShare)}%`, backgroundColor: toneFill['warn'] }} />
                  </div>
                </div>
                <div className="tabular-nums text-right text-[13px] font-semibold text-gray-800">
                  {s.count.toLocaleString()} • {pct.toFixed(2)}%
                </div>
              </div>
            );
          }

          // Skip separate child rows since we render stacked segments above
          if (s.id === 'kyc-done' || s.id === 'kyc-pend') return null;

          return (
            <div key={s.id} className="grid grid-cols-[28px,240px,1fr,112px] md:grid-cols-[28px,280px,1fr,128px] items-center gap-3 py-2">
              {/* Spine + dot */}
              <div className="relative hidden sm:block">
                <span className={`absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full ${dot}`} />
              </div>

              {/* Bar */}
              <div className={`flex items-center ${s.level ? 'pl-4' : ''}`}>
                <span className="text-[13px] font-medium text-gray-900">{s.name}</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${pct}%` }}
                  aria-label={`${s.name} ${pct.toFixed(2)}%`}
                  // inline tone color keeps contrast high
                  {...(s.tone ? { style: { width: `${pct}%`, backgroundColor: toneFill[s.tone] } } : {})}
                />
              </div>

              {/* Count • % */}
              <div className="tabular-nums text-right text-[13px] font-semibold text-gray-800">
                {s.count.toLocaleString()} • {pct.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


