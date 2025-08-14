"use client";
import React from 'react';
import { formatCurrencyINR, formatNumberIN } from '@/lib/utils';

type Trend = {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  period?: string;
};

type Props = {
  title: string;
  value: number | null;
  format: 'number' | 'currency' | 'percentage';
  trend?: Trend;
  tooltip?: string;
  loading?: boolean;
  ariaLabel?: string;
};

export function KPICard({ title, value, format, trend, tooltip, loading, ariaLabel }: Props) {
  const formatValue = () => {
    if (value == null) return '—';
    if (format === 'currency') return formatCurrencyINR(value);
    if (format === 'percentage') return `${Number(value).toFixed(1)}%`;
    return formatNumberIN(value);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? title}
      className="flex flex-col rounded-lg border bg-white p-4 shadow-sm focus-within:ring-2"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {tooltip && (
          <span className="text-xs text-gray-400" aria-label={tooltip} title={tooltip}>
            ⓘ
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">
        {loading ? <div className="h-7 w-32 animate-pulse rounded bg-gray-200" /> : formatValue()}
      </div>
      {trend && (
        <div className="mt-1 text-xs text-gray-500">
          {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '■'}{' '}
          {trend.percentage.toFixed(1)}% {trend.period ?? 'vs previous'}
        </div>
      )}
    </div>
  );
}

