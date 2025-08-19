'use client';

import React from 'react';
import { FUNNEL } from '@/mock-data/funnel-quality';

type Step = {
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

export default function HierarchicalFunnelSketch() {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900">Lead Conversion Funnel</h3>
      <p className="mb-3 text-xs text-gray-500">
        Clicks &amp; Leads are 100%. Other stages are % of Leads; KYC Done/Pending are % of KYC.
      </p>

      {/* Centered readable layout */}
      <div className="mx-auto w-full max-w-[560px]">
        {buildSteps().map((s, i) => {
          const pct = Math.max(0, Math.min(100, s.pct));
          const dot = s.tone ? toneDot[s.tone] : 'bg-blue-600';
          return (
            <div key={i} className="grid grid-cols-[180px,1fr,auto] items-center gap-3 py-1">
              {/* Name (indented for children) */}
              <div className={`flex items-center ${s.level ? 'pl-4' : ''}`}>
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="text-sm font-medium text-gray-900">{s.name}</span>
              </div>

              {/* Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-[width]"
                  style={{ width: `${pct}%` }}
                  aria-label={`${s.name} ${pct.toFixed(2)}%`}
                />
              </div>

              {/* Count • % */}
              <div className="tabular-nums text-xs text-gray-700">
                {s.count.toLocaleString()} • {pct.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


