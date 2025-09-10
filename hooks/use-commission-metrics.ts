"use client";
import { useEffect, useMemo, useState } from 'react';
import type { FilterOptions } from '@/lib/validations';
import { serialize } from '@/lib/utils/serialize';

export function useCommissionMetrics(filters?: FilterOptions) {
  // Delegate to actual API hook to avoid mock desync
  // If filters undefined, pass minimal default handled server-side
  const [payload, setPayload] = useState<any>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isError, setErrorFlag] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const defaultFilters = useMemo(() => {
    const d = new Date();
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { timeRange: { start: ym, end: ym } } as any;
  }, []);

  const q = useMemo(() => serialize(filters ?? defaultFilters), [filters, defaultFilters]);

  useEffect(() => {
    let alive = true;
    setLoading(true); setErrorFlag(false); setError(null);
    fetch(`/api/v1/dashboard/commission?filters=${q}`, { cache: 'no-store', next: { revalidate: 0 } })
      .then(r => { if (!r.ok) throw new Error('commission fetch failed'); return r.json(); })
      .then(json => { if (alive) setPayload((json && (json.data ?? json)) as any); })
      .catch(e => { if (alive) { setErrorFlag(true); setError(e as Error); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [q]);

  return {
    totalCommission: (() => {
      const p: any = payload ?? {};
      const total = Number(p.totalCommission ?? 0);
      if (Number.isFinite(total) && total > 0) return total;
      const sum = Number(p.availableForPayment ?? 0) + Number(p.pendingConfirmation ?? 0) + Number(p.paidCommission ?? 0);
      return Number.isFinite(sum) ? sum : 0;
    })(),
    paidCommission: Number((payload ?? {}).paidCommission ?? 0),
    confirmedCommission: Number((payload ?? {}).availableForPayment ?? 0),
    pendingCommission: Number((payload ?? {}).pendingConfirmation ?? 0),
    pendingPredictedFromHistory: 0,
    potentialCommission: Number((payload ?? {}).potentialCommission ?? 0),
    isLoading,
    isError,
    error,
    data: payload ?? null,
  };
}


