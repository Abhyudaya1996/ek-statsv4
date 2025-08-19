"use client";
/* eslint-disable react-hooks/rules-of-hooks */

import React from "react";

export type FunnelDatum = {
  stage: string;
  count: number;
  percentage: number; // 0..100 relative to baseline
  color: string;
};

type Props = {
  data: FunnelDatum[];
  className?: string;
  rowHeight?: number;
  gapY?: number;
  rounded?: number;
  showConversionRates?: boolean;
};

function useContainerWidth<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(0, Math.floor(entry.contentRect.width)));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width } as const;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export default function ConversionFunnel({
  data,
  className,
  rowHeight = 56,
  gapY = 14,
  rounded = 8,
  showConversionRates = true,
}: Props) {
  // Hooks must be called before any early returns
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  const cleaned = (data || []).filter((d) => d && Number.isFinite(d.percentage));
  if (cleaned.length === 0) return null;

  const baseline = Math.max(1, cleaned[0].percentage || 100);

  const rows = cleaned.map((d, i) => {
    const pctTop = Math.max(0, Math.min(100, (d.percentage / baseline) * 100));
    const next = cleaned[i + 1];
    const pctBottom = Math.max(
      0,
      Math.min(100, ((next?.percentage ?? d.percentage) / baseline) * 100)
    );
    return { ...d, pctTop, pctBottom, index: i };
  });

  return (
    <div className={className}>
      <div ref={ref} className="w-full rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Lead Conversion Funnel</h3>
        <p className="mb-3 mt-1 text-xs text-gray-600">
          Vertical funnel with trapezoids. Percentages are relative to the baseline stage.
        </p>

        <div className="flex flex-col">
          {rows.map((row, idx) => {
            const h = rowHeight;
            const yPad = gapY;
            const w = Math.max(1, width);
            const padX = 8;
            const maxW = Math.max(1, w - padX * 2);

            const t = (row.pctTop / 100) * maxW;
            const b = (row.pctBottom / 100) * maxW;
            const leftTop = (maxW - t) / 2;
            const leftBottom = (maxW - b) / 2;

            const points = [
              `${leftTop},0`,
              `${leftTop + t},0`,
              `${leftBottom + b},${h}`,
              `${leftBottom},${h}`,
            ].join(" ");

            let conv: string | null = null;
            if (showConversionRates && rows[idx + 1]) {
              const next = rows[idx + 1]!;
              const rate = row.count > 0 ? (next.count / row.count) * 100 : 0;
              conv = `${rate.toFixed(1)}%`;
            }

            const isHover = hoverIdx === idx;

            return (
              <div key={row.stage} className="relative">
                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
                  <div className="min-w-[120px] pr-2 text-sm font-medium text-gray-900">
                    {row.stage}
                  </div>
                  <div
                    className="relative"
                    onMouseEnter={() => setHoverIdx(idx)}
                    onMouseLeave={() => setHoverIdx(null)}
                  >
                    <svg
                      width="100%"
                      height={h}
                      viewBox={`0 0 ${maxW} ${h}`}
                      role="img"
                      aria-label={`${row.stage} ${formatNum(row.count)} (${row.percentage.toFixed(2)}%)`}
                    >
                      <rect x={0} y={0} width={maxW} height={h} rx={rounded} className="fill-gray-100" />
                      <clipPath id={`clip-${idx}`}>
                        <polygon points={points} />
                      </clipPath>
                      <rect
                        x={0}
                        y={0}
                        width={maxW}
                        height={h}
                        clipPath={`url(#clip-${idx})`}
                        style={{ fill: row.color }}
                      >
                        <animate attributeName="width" from="0" to={String(maxW)} dur="350ms" fill="freeze" />
                      </rect>
                      {isHover && (
                        <rect
                          x={0}
                          y={0}
                          width={maxW}
                          height={h}
                          rx={rounded}
                          className="fill-transparent stroke-blue-500"
                          strokeWidth={2}
                        />
                      )}
                    </svg>
                    {isHover && (
                      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-max -translate-x-1/2 -translate-y-[115%] rounded-md border bg-white px-2 py-1 text-[11px] shadow" role="dialog">
                        <div className="font-medium text-gray-900">{row.stage}</div>
                        <div className="tabular-nums text-gray-700">{formatNum(row.count)} • {row.percentage.toFixed(2)}%</div>
                        {conv && <div className="mt-0.5 text-gray-500">Next conversion: {conv}</div>}
                      </div>
                    )}
                  </div>
                  <div className="min-w-[88px] text-right text-xs font-semibold text-gray-800 tabular-nums">
                    {formatNum(row.count)} • {row.percentage.toFixed(2)}%
                  </div>
                </div>
                {showConversionRates && rows[idx + 1] && (
                  <div className="flex items-center justify-center py-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-gray-200">→ {((rows[idx + 1]!.count / Math.max(1, row.count)) * 100).toFixed(1)}%</span>
                  </div>
                )}
                <div style={{ height: gapY }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


