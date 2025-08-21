"use client";
import React from 'react';

export type ConversionBreakdown = {
  label?: string; // preferred
  substage?: string; // backward-compat
  count: number;
  percentage: number; // relative to parent stage (0-100)
  color: string;
};

export type ConversionStage = {
  stage: string;
  count: number;
  percentage: number; // relative to clicks or leads depending on stage
  baselinePercentage?: number; // scales the progress bar (default 100)
  color: string;
  description: string;
  icon?: string;
  breakdown?: ConversionBreakdown[];
};

const formatCount = (num: number): string => {
  if (num >= 1_000_000) {
    const v = num / 1_000_000;
    return v % 1 === 0 ? `${v}M` : `${v.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const v = num / 1_000;
    return v % 1 === 0 ? `${v}k` : `${v.toFixed(1)}k`;
  }
  return num.toLocaleString();
};

const formatPercent = (pct: number): string => {
  const rounded = Math.round(pct * 100) / 100; // clamp to 2dp
  if (Math.abs(rounded - Math.round(rounded)) < 0.005) return `${Math.round(rounded)}%`;
  return `${rounded.toFixed(2)}%`;
};

function Icon({ name, color }: { name: string; color: string }) {
  const cn = name.toLowerCase();
  const stroke = color;
  const common = { stroke, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      {cn.includes('click') && (
        <>
          <path {...common} d="M8 3h8a3 3 0 0 1 3 3v8" />
          <path {...common} d="M3 8v8a3 3 0 0 0 3 3h8" />
          <path {...common} d="M10 10l8 8" />
        </>
      )}
      {cn.includes('lead') && (
        <>
          <circle {...common} cx="9" cy="8" r="3" />
          <path {...common} d="M3 21a6 6 0 0 1 12 0" />
          <circle {...common} cx="17" cy="6" r="2" />
        </>
      )}
      {cn.includes('incomplete') && (
        <>
          <path {...common} d="M12 6v6l4 2" />
          <circle {...common} cx="12" cy="12" r="9" />
        </>
      )}
      {cn === 'kyc' && (
        <>
          <rect {...common} x="3" y="4" width="14" height="16" rx="2" />
          <path {...common} d="M7 9h6M7 13h4" />
          <path {...common} d="M17 12l2 2 4-4" />
        </>
      )}
      {cn.includes('verify') && (
        <>
          <circle {...common} cx="11" cy="11" r="6" />
          <path {...common} d="M20 20l-3.5-3.5" />
        </>
      )}
      {cn.includes('reject') && (
        <>
          <circle {...common} cx="12" cy="12" r="9" />
          <path {...common} d="M8 8l8 8M16 8l-8 8" />
        </>
      )}
      {cn.includes('approve') && (
        <>
          <circle {...common} cx="12" cy="12" r="9" />
          <path {...common} d="M8 12l3 3 5-6" />
        </>
      )}
    </svg>
  );
}

const relativeLabel = (stage: string): string => {
  const key = stage.toLowerCase();
  if (key.includes('lead')) return 'of clicks';
  if (key.includes('kyc')) return 'of leads';
  if (key.includes('verify')) return 'of leads';
  if (key.includes('reject')) return 'of leads';
  if (key.includes('approve')) return 'of leads';
  if (key.includes('incomplete')) return 'of leads';
  return '';
};

export default function ConversionFlowCards({ data }: { data: ConversionStage[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const STAGE_TIPS: Record<string, string> = React.useMemo(() => ({
    Clicks: 'Total clicks from your content',
    Leads: 'Users who actually applied on bank.',
    'Incomplete Applications': 'Users who started applications but dropped off.',
    KYC: 'People who are at KYC stage.',
    Verification: "Verification pending at bank's end.",
    Approved: 'Successfully approved',
    Rejected: 'Applications declined',
  }), []);

  // simple count-up formatter
  const useCountUp = (target: number, durationMs = 700) => {
    const [val, setVal] = React.useState(0);
    React.useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / durationMs);
        setVal(target * p);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);
    return val;
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-1 text-base font-semibold text-gray-900">Conversion Flow</h3>
      <p className="mb-4 text-[13px] text-gray-600">Clean overview from clicks to approvals; KYC shows an inline breakdown.</p>

      <div className="relative mx-auto w-full max-w-[560px]">
        <span className="pointer-events-none absolute left-1/2 top-2 bottom-2 -z-10 -translate-x-1/2 hidden w-px bg-gray-200 sm:block" />
        {data.map((s, i) => (
          <div key={s.stage} className="flex flex-col items-center">
            <article
              className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderLeftColor: s.color, borderLeftWidth: 4 }}
              aria-label={`${s.stage}: ${s.count} (${formatPercent(s.percentage)})`}
            >
              <header className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 ring-1 ring-inset ring-gray-200">
                  <Icon name={s.stage} color={s.color} />
                </span>
                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900">{s.stage}</h4>
                  {STAGE_TIPS[s.stage] && (
                    <p className="text-xs text-gray-500 mt-0.5">{STAGE_TIPS[s.stage]}</p>
                  )}
                </div>
              </header>
              <StageMetrics
                count={s.count}
                percentage={s.percentage}
                baselinePercentage={s.baselinePercentage}
                color={s.color}
                labelSuffix={relativeLabel(s.stage)}
                mounted={mounted}
                useCountUp={useCountUp}
              />
              {s.description && <p className="mt-1 text-[13px] leading-5 text-gray-600">{s.description}</p>}

              {Array.isArray(s.breakdown) && s.breakdown.length > 0 && (
                <BreakdownCard items={s.breakdown} />
              )}
            </article>

            {i < data.length - 1 && (
              <div className="my-2 flex flex-col items-center" aria-hidden>
                <span className="h-3 w-px bg-gray-300" />
                <span className="-mt-0.5 text-sm leading-none text-gray-400">▼</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StageMetrics({
  count,
  percentage,
  baselinePercentage = 100,
  color,
  labelSuffix,
  mounted,
  useCountUp,
}: {
  count: number;
  percentage: number;
  baselinePercentage?: number;
  color: string;
  labelSuffix?: string;
  mounted: boolean;
  useCountUp: (target: number, durationMs?: number) => number;
}) {
  const pctOfBaseline = Math.max(0, Math.min(100, (percentage / (baselinePercentage || 100)) * 100));
  const animatedCount = useCountUp(count);
  const animatedPct = useCountUp(percentage);
  return (
    <div>
      <div className="text-[15px] font-bold text-gray-900 tabular-nums">
        {formatCount(Math.round(animatedCount))}{' '}
        <span className="font-semibold text-gray-600">
          ({formatPercent(animatedPct)}{labelSuffix ? ` ${labelSuffix}` : ''})
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-inset ring-gray-200">
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: mounted ? `${pctOfBaseline}%` : '0%',
            transition: 'width 700ms ease',
          }}
        />
      </div>
    </div>
  );
}

function BreakdownCard({ items }: { items: ConversionBreakdown[] }) {
  const total = items.reduce((sum, b) => sum + (b.percentage || 0), 0) || 100;
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 text-[12px] font-semibold text-gray-700">KYC Breakdown</div>
      <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200">
        <div className="flex h-full w-full">
          {items.map((b) => {
            const w = Math.max(0, Math.min(100, (b.percentage / total) * 100));
            return <span key={(b.label || b.substage) as string} className="h-full" style={{ width: `${w}%`, backgroundColor: b.color }} />;
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {items.map((b) => (
          <div key={(b.label || b.substage) as string} className="flex items-center justify-between rounded-md bg-white p-2 ring-1 ring-gray-200">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-[13px] font-medium text-gray-800">{b.label || b.substage}</span>
            </div>
            <div className="text-[13px] font-semibold text-gray-900 tabular-nums">
              {formatCount(b.count)} <span className="text-gray-600">({formatPercent(b.percentage)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


