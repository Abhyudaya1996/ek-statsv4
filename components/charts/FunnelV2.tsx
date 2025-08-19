'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { FUNNEL_MOCK, type FunnelNode } from '@/lib/mock/funnel';

type Mode = 'both' | 'count' | 'percent';

const COLORS: Record<string, string> = {
  clicks: '#043424',
  leads: '#2563eb',
  incomplete: '#f59e0b',
  kyc: '#22c55e',
  'kyc-done': '#16a34a',
  'kyc-pend': '#84cc16',
  verify: '#06b6d4',
  reject: '#ef4444',
  expired: '#9ca3af',
  approved: '#10b981',
};

const ORDER = ['clicks', 'leads', 'incomplete', 'kyc', 'kyc-done', 'kyc-pend', 'verify', 'reject', 'expired', 'approved'];

function withDisplay(mode: Mode) {
  return [...FUNNEL_MOCK]
    .sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id))
    .map(n => ({
      ...n,
      indent: n.parent === 'kyc' ? 2 : n.parent ? 1 : 0,
      labelRight:
        mode === 'both'
          ? `${n.value.toLocaleString()} • ${n.percent}%`
          : mode === 'count'
          ? n.value.toLocaleString()
          : `${n.percent}%`,
      barValue: n.value,
      fill: COLORS[n.id] ?? '#64748b',
    }));
}

function CustomLabel(props: any) {
  const { x, y, width, height, value } = props;
  const textX = (x ?? 0) + (width ?? 0) + 8;
  const textY = (y ?? 0) + (height ?? 0) / 2 + 2;
  return (
    <text x={textX} y={textY} dy={2} textAnchor="start" fill="#111827" fontSize={12} fontWeight={600}>
      {value}
    </text>
  );
}

export default function FunnelV2({ mode = 'both' }: { mode?: Mode }) {
  const data = React.useMemo(() => withDisplay(mode), [mode]);

  const yTick = (v: any) => {
    const node = FUNNEL_MOCK.find(n => n.label === v);
    const indent = node?.parent === 'kyc' ? '   ' : node?.parent ? '  ' : '';
    return indent + v;
  };

  return (
    <div aria-label="Lead Conversion Funnel" className="rounded-xl border bg-white p-4">
      <h3 className="mb-2 text-base font-semibold text-gray-900">Lead Conversion Funnel</h3>
      <p className="mb-2 text-xs text-gray-500">
        Bars show count and percentage. Percentages are relative to Leads, except the KYC children are relative to KYC.
      </p>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 80, left: 10, bottom: 10 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="label" type="category" width={210} tick={{ fill: '#111827', fontSize: 12 }} tickFormatter={yTick} />
            <Tooltip
              cursor={{ fill: 'rgba(2,132,199,0.05)' }}
              formatter={(val: any, _name: any, ctx: any) => {
                const n: FunnelNode | undefined = ctx?.payload;
                const value = n?.value ?? 0;
                const pct = n?.percent ?? 0;
                const label = n?.label?.replace(/^—\s/, '') ?? '';
                return [`${value.toLocaleString()} • ${pct}%`, label];
              }}
            />
            <Bar dataKey="barValue" radius={[0, 8, 8, 0]} minPointSize={6} isAnimationActive={false}>
              <LabelList dataKey="labelRight" content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


