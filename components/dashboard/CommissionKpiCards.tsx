"use client";
import React from 'react';
import { useCommissionMetrics } from '@/hooks/use-commission-metrics';
import { formatCurrencyINR } from '@/lib/utils';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { TOOLTIP_COPY } from '@/lib/constants';

export function CommissionKpiCards() {
  const m = useCommissionMetrics();

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {/* Potential Commission */}
      <div className="rounded-2xl border border-[#eef2f7] bg-[#eef2ff] p-4">
        <h3 className="flex items-center gap-1 text-sm font-medium text-[#2563eb]">
          Potential Commission
          <InfoTooltip side="top" text={TOOLTIP_COPY.commission.potential} />
        </h3>
        <p className="mt-2 text-2xl font-semibold text-[#1e40af]">{formatCurrencyINR(m.potentialCommission)}</p>
      </div>

      {/* Pending for Confirmation */}
      <div className="rounded-2xl border border-[#eef2f7] bg-[#fff7ed] p-4">
        <h3 className="flex items-center gap-1 text-sm font-medium text-[#b45309]">
          Pending for Confirmation
          <InfoTooltip side="top" text={TOOLTIP_COPY.commission.pendingConfirmation} />
        </h3>
        <p className="mt-2 text-2xl font-semibold text-[#9a3412]">{formatCurrencyINR(m.pendingCommission)}</p>
      </div>

      {/* Available for Payment */}
      <div className="rounded-2xl border border-[#eef2f7] bg-[#ecfdf5] p-4">
        <h3 className="flex items-center gap-1 text-sm font-medium text-[#047857]">
          Available for Payment
          <InfoTooltip side="top" text={TOOLTIP_COPY.commission.available} />
        </h3>
        <p className="mt-2 text-2xl font-semibold text-[#065f46]">{formatCurrencyINR(m.confirmedCommission)}</p>
      </div>

      {/* Paid Commission */}
      <div className="rounded-2xl border border-[#eef2f7] bg-[#f5f3ff] p-4">
        <h3 className="flex items-center gap-1 text-sm font-medium text-[#6d28d9]">
          Paid Commission
          <InfoTooltip side="top" text={TOOLTIP_COPY.commission.paid} />
        </h3>
        <p className="mt-2 text-2xl font-semibold text-[#5b21b6]">{formatCurrencyINR(m.paidCommission)}</p>
      </div>
    </section>
  );
}


