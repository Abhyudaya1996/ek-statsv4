"use client";
import React from 'react';
import { useCommissionMetrics } from '@/hooks/use-commission-metrics';
import { formatCurrencyINR } from '@/lib/utils';

export function CommissionKpiCards() {
  const m = useCommissionMetrics();

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm text-gray-500">Potential Commission</h3>
        <p className="mt-1 text-2xl font-semibold">{formatCurrencyINR(m.potentialCommission)}</p>
        <p className="mt-1 text-xs text-gray-500">
          Includes {formatCurrencyINR(m.paidCommission)} paid + {formatCurrencyINR(m.confirmedCommission)} confirmed + <span className="font-medium">{formatCurrencyINR(m.pendingPredictedFromHistory)}</span> expected from pending
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm text-gray-500">Pending for confirmation</h3>
        <p className="mt-1 text-2xl font-semibold">{formatCurrencyINR(m.pendingCommission)}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm text-gray-500">Available for payment</h3>
        <p className="mt-1 text-2xl font-semibold">{formatCurrencyINR(m.confirmedCommission)}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm text-gray-500">Paid Commission</h3>
        <p className="mt-1 text-2xl font-semibold">{formatCurrencyINR(m.paidCommission)}</p>
      </div>
    </section>
  );
}


