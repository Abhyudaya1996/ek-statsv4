'use client';

import React from 'react';

type Segment = {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
};

type Props = {
  data: Segment[];
  maxWidth?: number;
  minHeight?: number;
  className?: string;
  showDropOff?: boolean;
};

function useMeasure<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [rect, setRect] = React.useState({ width: 0 });
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setRect({ width: e.contentRect.width }));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, rect } as const;
}

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toLocaleString());

export default function PremiumFunnel({ data, maxWidth = 800, minHeight = 48, className, showDropOff = true }: Props) {
  const segments = React.useMemo(() => (data || []).filter(d => d && Number.isFinite(d.percentage) && Number.isFinite(d.count)), [data]);
  if (!segments.length) return null;

  const { ref, rect } = useMeasure<HTMLDivElement>();
  const width = Math.min(maxWidth, Math.max(320, rect.width || maxWidth));
  const gap = 10;
  const radius = 10;

  const baseline = Math.max(1, segments[0].percentage);
  const rows = segments.map((d, i) => {
    const topPct = Math.max(0, Math.min(100, (d.percentage / baseline) * 100));
    const next = segments[i + 1]?.percentage ?? d.percentage;
    const bottomPct = Math.max(0, Math.min(100, (next / baseline) * 100));
    const top = (topPct / 100) * width;
    const bottom = (bottomPct / 100) * width;
    return { ...d, top, bottom, idx: i };
  });

  const biggestDropIdx = React.useMemo(() => {
    let iBest = -1;
    let drop = -1;
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i]!.count;
      const b = rows[i + 1]!.count;
      const d = a > 0 ? (1 - b / a) * 100 : 0;
      if (d > drop) { drop = d; iBest = i; }
    }
    return iBest;
  }, [rows]);

  return (
    <div className={className}>
      <div ref={ref} className="mx-auto w-full max-w-[900px] rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Conversion Funnel</h3>
        <p className="mb-3 mt-1 text-xs text-gray-600">Trapezoid funnel with gradients, tooltips and drop-off indicators.</p>

        <div className="flex flex-col">
          {rows.map((s, i) => {
            const h = Math.max(minHeight, 40);
            const next = rows[i + 1];
            const conv = next ? (next.count / Math.max(1, s.count)) * 100 : null;

            const leftTop = (width - s.top) / 2;
            const rightTop = leftTop + s.top;
            const bottom = next ? next.bottom : s.bottom;
            const leftBottom = (width - bottom) / 2;
            const rightBottom = leftBottom + bottom;

            const path = `\
              M ${leftTop} 0\
              L ${rightTop} 0\
              L ${rightBottom} ${h}\
              L ${leftBottom} ${h}\
              Z\
            `;

            const gradientId = `grad-${i}`;
            const clipId = `clip-${i}`;

            return (
              <div key={s.id || s.label} className="relative">
                <div className="grid grid-cols-[180px,1fr,120px] items-center gap-3">
                  <div className="pr-3">
                    <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                    <div className="text-xs text-gray-600 tabular-nums">{fmt(s.count)} • {s.percentage.toFixed(2)}%</div>
                  </div>

                  <div className="relative">
                    <svg viewBox={`0 0 ${width} ${h}`} width="100%" height={h} role="img" aria-label={`${s.label} ${fmt(s.count)} ${s.percentage.toFixed(2)}%`}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={s.color} stopOpacity="0.95" />
                          <stop offset="100%" stopColor={s.color} stopOpacity="0.75" />
                        </linearGradient>
                        <clipPath id={clipId}>
                          <path d={path} />
                        </clipPath>
                      </defs>

                      <rect x={0} y={0} width={width} height={h} rx={radius} className="fill-gray-100" />

                      <g clipPath={`url(#${clipId})`}>
                        <rect x={0} y={0} width={width} height={h} fill={`url(#${gradientId})`}>
                          <animate attributeName="width" from="0" to={String(width)} dur="260ms" begin={`${i * 120}ms`} fill="freeze" />
                        </rect>
                      </g>

                      <path d={path} className="fill-none stroke-transparent hover:stroke-blue-400 focus:stroke-blue-400" strokeWidth={2} />
                    </svg>
                  </div>

                  <div className="text-right text-xs font-semibold text-gray-800 tabular-nums">{fmt(s.count)} • {s.percentage.toFixed(2)}%</div>
                </div>

                {showDropOff && rows[i + 1] && (
                  <div className="flex items-center justify-center py-1">
                    <span className={`${i === biggestDropIdx ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-gray-50 text-gray-600 ring-gray-200'} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1`}>
                      → {(conv ?? 0).toFixed(1)}% to next
                    </span>
                  </div>
                )}

                <div style={{ height: gap }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


