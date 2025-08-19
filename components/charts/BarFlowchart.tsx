"use client";
import React from 'react';

export type BarStage = {
  id: string;
  label: string;
  value: number;
  percent: number;
  color: string;
  parent?: string;
  isChild?: boolean;
};

const formatCount = (num: number) => {
  if (num >= 1000000) {
    const v = num / 1000000;
    return v % 1 === 0 ? `${v}M` : `${v.toFixed(1)}M`;
  }
  if (num >= 1000) {
    const v = num / 1000;
    return v % 1 === 0 ? `${v}k` : `${v.toFixed(1)}k`;
  }
  return num.toLocaleString();
};

const formatPercent = (pct: number) => {
  const rounded = Math.round(pct);
  if (Math.abs(pct - rounded) < 0.005) return `${rounded}%`;
  return `${pct.toFixed(2)}%`;
};

export default function BarFlowchart({ data }: { data: BarStage[] }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Lead Conversion Flow</h3>
      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center space-y-4">
        <span className="pointer-events-none absolute left-1/2 top-2 bottom-2 -translate-x-1/2 hidden w-px bg-gray-200 sm:block" />
        {data.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center">
            <div
              className={`flex min-h-[50px] items-center justify-center rounded-[6px] px-4 py-3 text-[14px] font-semibold text-white tabular-nums shadow-sm ${
                stage.isChild || stage.parent ? 'ml-10' : ''
              }`}
              style={{
                backgroundColor: stage.color,
                width: stage.isChild || stage.parent ? '360px' : '420px',
              }}
            >
              {stage.label} | {formatCount(stage.value)} | {formatPercent(stage.percent)}
            </div>

            {index < data.length - 1 && (
              <div className="flex flex-col items-center justify-center py-1" aria-hidden>
                <span className="h-3 w-px bg-gray-300" />
                <span className="-mt-0.5 text-base leading-none text-gray-400">▼</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


