// components/quality/QualityAnalysis.tsx
"use client";
import React from 'react';
import { formatCurrencyINR } from '@/lib/utils';
import { QUALITY_LEADS, CARD_OUTS, REJECTION, POTENTIAL_COMMISSION } from '@/lib/mock/quality';

export default function QualityAnalysis() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Quality <span className="font-bold">Good</span></h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <Stat label="Avg" value={QUALITY_LEADS.avg} />
          <Stat label="Bad" value={QUALITY_LEADS.bad} />
          <Stat label="Good" value={QUALITY_LEADS.good} />
          <Stat label="Unknown" value={QUALITY_LEADS.unknown} />
          <Stat label="Grand Total" value={QUALITY_LEADS.total} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Approval Rate (Card-outs)</h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <Stat label="Avg" value={CARD_OUTS.avg} />
          <Stat label="Good" value={CARD_OUTS.good} />
          <Stat label="Unknown" value={CARD_OUTS.unknown} />
          <Stat label="Bad" value={CARD_OUTS.bad} />
          <Stat label="Grand Total" value={CARD_OUTS.total} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Rejection Rate</h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Avg" value={`${REJECTION.avg.count} (${REJECTION.avg.pct}%)`} />
          <Stat label="Bad" value={`${REJECTION.bad.count} (${REJECTION.bad.pct}%)`} />
          <Stat label="Good" value={`${REJECTION.good.count} (${REJECTION.good.pct}%)`} />
          <Stat label="Unknown" value={`${REJECTION.unknown.count} (${REJECTION.unknown.pct}%)`} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Earnings (Potential Commission)</h3>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-500">Potential Commission</p>
            <p className="text-2xl font-semibold">{formatCurrencyINR(POTENTIAL_COMMISSION.total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Available for payment</p>
            <p className="text-xl font-semibold">{formatCurrencyINR(POTENTIAL_COMMISSION.availableForPayment)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending for confirmation</p>
            <p className="text-xl font-semibold">{formatCurrencyINR(POTENTIAL_COMMISSION.pendingForConfirmation)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}


