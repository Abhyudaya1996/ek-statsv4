'use client';

import React from 'react';

type Step = {
  name: string;
  count: number;
  pct: number;        // display percent
  level?: 0 | 1;      // 0 root, 1 child (indented)
  tone?: 'good' | 'warn' | 'bad';
};

const steps: Step[] = [
  { name: 'Clicks', count: 60000, pct: 100, level: 0, tone: 'good' },
  { name: 'Leads', count: 5000, pct: 100, level: 0, tone: 'good' },
  { name: 'Incomplete Applications', count: 1993, pct: 39.03, level: 0, tone: 'warn' },
  { name: 'KYC', count: 106, pct: 2.08, level: 0 },
  { name: '— KYC Done', count: 30, pct: 28.3, level: 1, tone: 'good' },
  { name: '— KYC Pending', count: 76, pct: 71.7, level: 1, tone: 'warn' },
  { name: 'Verification', count: 41, pct: 0.8, level: 0 },
  { name: 'Rejected', count: 1702, pct: 33.33, level: 0, tone: 'bad' },
  { name: 'Expired', count: 610, pct: 11.95, level: 0 },
  { name: 'Approved', count: 548, pct: 10.73, level: 0, tone: 'good' },
];

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
        {steps.map((s, i) => {
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


