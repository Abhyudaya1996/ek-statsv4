"use client";
import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid, LabelList, Legend } from 'recharts';

export type FunnelStageDatum = { label: string; value: number; percentLabel?: string; description?: string; fill?: string };

const MIN_BAR_PX = 60;

const COLOR_MAP: Record<string, string> = {
  Clicks: '#1D4ED8',
  Leads: '#10B981',
  Incomplete: '#6B7280',
  KYC: '#D97706',
  Verification: '#4F46E5',
  Rejected: '#DC2626',
  Expired: '#6B7280',
  Approved: '#047857',
  Cardouts: '#047857',
};

const DESC_MAP: Record<string, string> = {
  Clicks: 'Users who clicked outbound links',
  Leads: 'Total submitted applications',
  Incomplete: 'Abandoned or missing information',
  KYC: 'KYC documentation stage',
  Verification: 'Bank verification in progress',
  Rejected: 'Rejected after review',
  Expired: 'Timed out without decision',
  Approved: 'Successfully approved (cardout)',
  Cardouts: 'Successfully approved (cardout)',
};

function orderStages(input: FunnelStageDatum[]): FunnelStageDatum[] {
  const copy = [...input];
  // Ensure Approved/Cardouts last
  const approvedIdx = copy.findIndex(d => /approved|cardout/i.test(d.label));
  const approved = approvedIdx >= 0 ? copy.splice(approvedIdx, 1)[0] : undefined;
  const rest = copy;
  return approved ? [...rest, approved] : rest;
}

function CustomBarShape(props: any) {
  const { x, y, width, height, fill } = props;
  const w = Math.max(width, MIN_BAR_PX);
  return <rect x={x} y={y} width={w} height={height} fill={fill} rx={6} ry={6} />;
}

function LabelContent(props: any) {
  const { x, y, width, height, value } = props; // value is percentLabel
  const text = String(value ?? '');
  const isSmall = width < MIN_BAR_PX + 8;
  const tx = isSmall ? x + width + 8 : x + 8;
  const ty = y + height / 2 + 4;
  const fill = isSmall ? '#111827' : '#FFFFFF';
  return (
    <text x={tx} y={ty} fill={fill} fontSize={12} textAnchor="start">
      {text}
    </text>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0]?.payload as FunnelStageDatum & { percentLabel?: string };
  return (
    <div className="rounded-md border bg-white p-2 text-xs shadow" role="dialog" aria-live="polite">
      <div className="font-medium">{p.label}</div>
      <div>Leads: {p.value}</div>
      {p.percentLabel && <div>Share: {p.percentLabel}</div>}
      <div className="text-gray-600">{p.description || DESC_MAP[p.label] || 'Stage details'}</div>
    </div>
  );
}

function StageLegend({ items }: { items: FunnelStageDatum[] }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      {items.map(it => (
        <div key={it.label} className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: it.fill || COLOR_MAP[it.label] || '#10B981' }} />
          <span className="text-gray-900">{it.label}</span>
          <span className="ml-auto tabular-nums text-gray-600">{it.value}{it.percentLabel ? ` (${it.percentLabel})` : ''}</span>
        </div>
      ))}
    </div>
  );
}

export function FunnelChart({ data, title = 'Funnel' }: { data: FunnelStageDatum[]; title?: string }) {
  const total = React.useMemo(() => data.reduce((a, b) => a + (b.value || 0), 0), [data]);
  const enriched = React.useMemo(() => {
    const withMeta = data.map(d => ({
      ...d,
      percentLabel: d.percentLabel || (total ? `${Math.round((d.value / total) * 1000) / 10}%` : ''),
      description: d.description || DESC_MAP[d.label],
      fill: d.fill || COLOR_MAP[d.label] || '#10B981',
    }));
    return orderStages(withMeta);
  }, [data, total]);

  const alt = `${title}: ` + enriched.map(d => `${d.label} ${d.value}${d.percentLabel ? ` (${d.percentLabel})` : ''}`).join(', ');

  return (
    <div className="w-full">
      <p className="sr-only" role="img" aria-label={alt} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-3 h-64">
          <ResponsiveContainer>
            <BarChart layout="vertical" data={enriched} margin={{ left: 24, right: 24, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" width={120} tick={{ fill: '#111827', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} shape={<CustomBarShape />}>
                <LabelList dataKey="percentLabel" content={<LabelContent />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="md:col-span-1">
          <StageLegend items={enriched} />
        </div>
      </div>
    </div>
  );
}

