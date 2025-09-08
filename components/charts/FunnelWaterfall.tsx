"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { FUNNEL as FUNNEL_MOCK } from '@/mock-data/funnel-quality';

type Node = { id: string; label: string; value: number; percent: number; parent?: string };

const COLORS: Record<string, string> = {
  clicks: '#0ea5e9',
  leads: '#10b981',
  incomplete: '#f59e0b',
  kyc: '#a855f7',
  'kyc-done': '#10b981',
  'kyc-pend': '#f59e0b',
  verify: '#6366f1',
  reject: '#ef4444',
  expired: '#f59e0b',
  approved: '#16a34a',
};

function formatLabel(node: Node) {
  const pct = Number(node.percent).toFixed(2);
  return `${node.value.toLocaleString('en-IN')} • ${pct}%`;
}

const CustomLabel: React.FC<any> = ({ x, y, width, height, value, index, viewBox, payload }) => {
  const node = payload as Node;
  const text = formatLabel(node);
  return (
    <g>
      <text x={(x ?? 0) + (width ?? 0) + 8} y={(y ?? 0) + (height ?? 0) / 2} dominantBaseline="middle" className="text-[11px] fill-gray-700">
        {text}
      </text>
    </g>
  );
};

export function FunnelWaterfall() {
  const data: Node[] = React.useMemo(() => {
    // Indent labels for children by adding spaces
    return FUNNEL_MOCK.map(n => ({
      ...n,
      label: n.parent ? `  ${n.label}` : n.label,
    }));
  }, []);

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-2 text-base font-semibold text-gray-900">Lead Conversion Funnel</h3>
      <p className="mb-3 text-xs text-gray-500">Bars show count and percentage.</p>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="label" type="category" width={180} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(val: any, _name: any, props: any) => [
              `${Number(val).toLocaleString('en-IN')}`,
              (props?.payload?.label || '').trim(),
            ]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              <LabelList dataKey="value" content={<CustomLabel />} />
              {data.map((n) => (
                <rect key={n.id} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FunnelWaterfall;


