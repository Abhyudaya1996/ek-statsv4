"use client";
import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid, LabelList } from 'recharts';

export type FunnelStageDatum = { label: string; value: number; percentLabel?: string };

export function FunnelChart({ data, title = 'Funnel' }: { data: FunnelStageDatum[]; title?: string }) {
  const alt = `${title}: ` + data.map(d => `${d.label} ${d.value}${d.percentLabel ? ` (${d.percentLabel})` : ''}`).join(', ');
  return (
    <div className="h-64 w-full">
      <p className="sr-only" role="img" aria-label={alt} />
      <ResponsiveContainer>
        <BarChart layout="vertical" data={data} margin={{ left: 24, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={120} />
          <Tooltip />
          <Bar dataKey="value" fill="#34D399" radius={[0, 6, 6, 0]}>
            <LabelList dataKey="percentLabel" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

