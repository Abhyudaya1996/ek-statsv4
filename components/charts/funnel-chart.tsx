"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer, Cell } from 'recharts';
// No external classnames helper to keep bundle lean

export type FunnelRow = {
  key: string;
  label: string;
  count: number;
  pct: number;
  level?: number;
  color?: string;
};

type Props = {
  rows: FunnelRow[];
};

const COLORS: Record<string, string> = {
  clicks: '#14532d',
  leads: '#2563eb',
  incomplete: '#f59e0b',
  kyc: '#0ea5e9',
  kyc_done: '#16a34a',
  kyc_pending: '#eab308',
  verification: '#8b5cf6',
  rejected: '#ef4444',
  expired: '#64748b',
  approved: '#22c55e',
};

export function FunnelChart({ rows }: Props) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="label"
            tick={(props) => {
              const { x, y, payload } = props as any;
              const level = payload?.payload?.level ?? 0;
              const cls = `fill-gray-700 text-[12px]${level > 0 ? ' font-medium' : ''}`;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={4}
                    textAnchor="end"
                    className={cls}
                  >
                    <tspan dx={-level * 12}>{payload.value}</tspan>
                  </text>
                </g>
              );
            }}
            width={180}
          />
          <Tooltip
            formatter={(value: any, _name: any, item: any) => {
              const row = item?.payload ?? {};
              const rawCount = (row as any).count;
              const rawPct = (row as any).pct;
              const count: number = typeof rawCount === 'number' ? rawCount : Number(rawCount ?? 0) || 0;
              const pctValFromRow: number = typeof rawPct === 'number' ? rawPct : Number(rawPct ?? 0) || 0;
              const pctValFromValue: number = typeof value === 'number' ? value : Number(value ?? 0) || 0;
              const pct: number = Number.isFinite(pctValFromRow) && pctValFromRow > 0 ? pctValFromRow : pctValFromValue;
              const label: string = typeof (row as any).label === 'string' ? (row as any).label : '';
              return [`${count.toLocaleString()} (${pct.toFixed(2)}%)`, label];
            }}
          />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]} isAnimationActive>
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: number | undefined, entry: any) => {
                const countSource = typeof entry?.count === 'number' ? entry.count : (typeof entry?.payload?.count === 'number' ? entry.payload.count : 0);
                const count = Number(countSource) || 0;
                const pct = typeof v === 'number' ? v : Number(v ?? 0) || 0;
                return `${count.toLocaleString()}  •  ${pct.toFixed(2)}%`;
              }}
              className="text-[11px] fill-gray-800"
            />
            {rows.map((r) => (
              // @ts-ignore Recharts Cell component
              <Cell key={r.key} fill={r.color ?? COLORS[r.key] ?? '#334155'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-gray-500">Bars show %; labels show both count and percentage.</p>
    </div>
  );
}

