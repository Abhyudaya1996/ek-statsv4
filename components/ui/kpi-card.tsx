"use client";
import React from 'react';
import { formatCurrencyINR, formatNumberIN } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

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
  icon?: React.ReactNode;
  emphasis?: boolean;
};

export function KPICard({ 
  title, 
  value, 
  format, 
  trend, 
  tooltip, 
  loading, 
  ariaLabel, 
  icon,
  emphasis = false 
}: Props) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const formatValue = () => {
    if (value == null) return '—';
    if (format === 'currency') return formatCurrencyINR(value);
    if (format === 'percentage') return `${Number(value).toFixed(1)}%`;
    return formatNumberIN(value);
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendClass = () => {
    if (!trend) return '';
    return `kpi-trend ${trend.direction === 'up' ? 'positive' : trend.direction === 'down' ? 'negative' : 'neutral'}`;
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? title}
      className={`kpi-card ${emphasis ? 'ring-2 ring-emerald-500 ring-opacity-20' : ''} fade-in`}
      tabIndex={0}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="kpi-label flex items-center gap-2">
              {title}
              {tooltip && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    aria-label={`More information about ${title}`}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showTooltip && (
                    <div
                      ref={tooltipRef}
                      className="tooltip -top-2 left-6 transform -translate-y-full w-48 text-left"
                      role="tooltip"
                    >
                      {tooltip}
                    </div>
                  )}
                </div>
              )}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="kpi-value">
          {loading ? (
            <div className="skeleton h-9 w-32" />
          ) : (
            <span className={emphasis ? 'text-emerald-600' : ''}>{formatValue()}</span>
          )}
        </div>

        {trend && !loading && (
          <div className={getTrendClass()}>
            {getTrendIcon()}
            <span>
              {trend.percentage.toFixed(1)}% {trend.period ?? 'vs previous'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}