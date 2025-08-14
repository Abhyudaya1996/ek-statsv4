"use client";
import React from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

export type BankPerfRow = { bank: string; total: number; approved: number; rate: number; avgDays?: number };

export function BankPerformanceChart({ data, title = 'Bank Performance' }: { data: BankPerfRow[]; title?: string }) {
  const alt = `${title}: ` + data.map(d => `${d.bank} total ${d.total}, approved ${d.approved}, rate ${d.rate}%`).join('; ');
  return (
    <div className="h-72 w-full">
      <p className="sr-only" role="img" aria-label={alt} />
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bank" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="total" name="Total" fill="#A7F3D0" />
          <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10B981" />
          <Line yAxisId="right" type="monotone" dataKey="rate" name="Rate %" stroke="#3B82F6" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

