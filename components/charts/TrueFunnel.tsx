'use client';

import React from 'react';

type FunnelItem = {
  stage: string;
  count: number;
  percentage: number; // relative to baseline, 0..100
  color: string;
  parent?: string;
};

type Props = {
  data: FunnelItem[];
  rowHeight?: number; // px per stage
  className?: string;
};

function useMeasure<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(0, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width } as const;
}

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toLocaleString());

export default function TrueFunnel({ data, rowHeight = 56, className }: Props) {
  // Call hooks before any conditional returns
  const { ref, width } = useMeasure<HTMLDivElement>();

  const baseline = Math.max(1, data.find(d => !d.parent)?.percentage ?? 100);
  const main = data.filter(d => !d.parent);
  if (main.length === 0) return null;

  const kyIndex = main.findIndex(d => d.stage.toLowerCase() === 'kyc');
  const kycChildren = data.filter(d => d.parent === 'KYC');
  const kycDone = kycChildren.find(d => /done/i.test(d.stage));
  const kycPend = kycChildren.find(d => /pend/i.test(d.stage));

  const h = rowHeight;
  const totalH = h * main.length; // no gaps

  const w = Math.max(320, width || 720);
  const maxW = Math.min(900, w);

  // Precompute widths per stage (top of each row)
  const stageWidth = main.map(s => (Math.max(0, Math.min(100, (s.percentage / baseline) * 100)) / 100) * maxW);

  const paths: Array<{ d: string; color: string; key: string; aria: string } | null> = [];

  for (let i = 0; i < main.length; i++) {
    const topW = stageWidth[i]!;
    const nextW = i < main.length - 1 ? stageWidth[i + 1]! : stageWidth[i]!;
    const y1 = i * h;
    const y2 = (i + 1) * h;
    const leftTop = (maxW - topW) / 2;
    const rightTop = leftTop + topW;
    const leftBottom = (maxW - nextW) / 2;
    const rightBottom = leftBottom + nextW;

    // KYC split within the same trapezoid
    if (i === kyIndex && kycDone && kycPend) {
      const parentCount = Math.max(1, main[i]!.count);
      const shareDone = Math.max(0, Math.min(1, kycDone.count / parentCount));
      const splitTop = leftTop + topW * shareDone;
      const splitBottom = leftBottom + nextW * shareDone;

      const donePath = `M ${leftTop} ${y1} L ${splitTop} ${y1} L ${splitBottom} ${y2} L ${leftBottom} ${y2} Z`;
      const pendPath = `M ${splitTop} ${y1} L ${rightTop} ${y1} L ${rightBottom} ${y2} L ${splitBottom} ${y2} Z`;
      paths.push({ d: donePath, color: '#059669', key: 'kyc-done', aria: `KYC Done ${fmt(kycDone.count)}` });
      paths.push({ d: pendPath, color: '#d97706', key: 'kyc-pending', aria: `KYC Pending ${fmt(kycPend.count)}` });
      continue;
    }

    const d = `M ${leftTop} ${y1} L ${rightTop} ${y1} L ${rightBottom} ${y2} L ${leftBottom} ${y2} Z`;
    paths.push({ d, color: main[i]!.color, key: main[i]!.stage, aria: `${main[i]!.stage} ${fmt(main[i]!.count)}` });
  }

  return (
    <div className={className}>
      <div ref={ref} className="mx-auto w-full max-w-[960px] rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Conversion Funnel</h3>
        <p className="mb-3 mt-1 text-xs text-gray-600">Connected trapezoids; labels outside; KYC is split in-row.</p>

        <div className="grid grid-cols-[200px,1fr,140px] items-center gap-3">
          {/* Left labels */}
          <div className="space-y-2">
            {main.map((s, i) => (
              <div key={s.stage} style={{ height: h }} className="flex items-center text-sm font-medium text-gray-900">
                {s.stage}
              </div>
            ))}
            {/* KYC children labels under KYC */}
            {kycDone || kycPend ? (
              <div aria-hidden className="-mt-[56px] ml-4 space-y-1 text-xs text-gray-700">
                {kycDone && <div>— KYC Done</div>}
                {kycPend && <div>— KYC Pending</div>}
              </div>
            ) : null}
          </div>

          {/* Single SVG funnel silhouette */}
          <div className="relative">
            <svg width="100%" height={totalH} viewBox={`0 0 ${maxW} ${totalH}`} role="img" aria-label="Funnel chart">
              <defs>
                <filter id="fshadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                </filter>
              </defs>
              {paths.map((p, idx) => (
                <path key={p!.key} d={p!.d} fill={p!.color} filter="url(#fshadow)">
                  <animate attributeName="opacity" from="0" to="1" dur="300ms" begin={`${idx * 120}ms`} fill="freeze" />
                </path>
              ))}
              {/* Stage separators */}
              {main.slice(1).map((_, i) => (
                <line key={`sep-${i}`} x1={0} x2={maxW} y1={(i + 1) * h} y2={(i + 1) * h} stroke="rgba(0,0,0,0.06)" />
              ))}
            </svg>
          </div>

          {/* Right metrics */}
          <div className="space-y-2">
            {main.map((s) => (
              <div key={s.stage} style={{ height: h }} className="flex items-center justify-end text-xs font-semibold text-gray-800 tabular-nums">
                {fmt(s.count)} • {s.percentage.toFixed(2)}%
              </div>
            ))}
            {(kycDone || kycPend) && (
              <div aria-hidden className="-mt-[56px] space-y-1 text-right text-[11px] text-gray-700 tabular-nums">
                {kycDone && <div>{fmt(kycDone.count)} • {kycDone.percentage.toFixed(2)}%</div>}
                {kycPend && <div>{fmt(kycPend.count)} • {kycPend.percentage.toFixed(2)}%</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


