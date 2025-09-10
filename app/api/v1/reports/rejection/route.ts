import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail, safePct } from '@/lib/api-helpers';
import { fmt } from '@/lib/format';
import { CONFIG, nowTimestamps } from '@/lib/config';
import { readFilters, deriveMonthRange, monthStartIso, nextMonthStartIso, fetchWithFallback } from '@/lib/server/range';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/supabase-fetch';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const forceMock = url.searchParams.get('mock') === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    if (forceMock || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mock = await import('@/mock-data/reports_rejection.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    const incoming = readFilters(new URL(req.url).searchParams) as any;
    const { rows, used } = await fetchWithFallback<any>(async (fromIso, toIso) => {
      const base = supabase
        .from('ek_applications_v')
        .select('bank, stage_code, rejection_reason, rejection_category, application_date, user_id', { count: 'exact' })
        .gte('application_date', fromIso)
        .lt('application_date', toIso);
      const { data, error, count } = await base.range(0, 20000);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? (data?.length ?? 0) };
    }, incoming);

    const totalByBank: Record<string, number> = {};
    const rejectedByBank: Record<string, number> = {};
    const reasonCounts: Record<string, number> = {};

    for (const r of rows ?? []) {
      const bank = (r as any).bank ?? 'Unknown';
      totalByBank[bank] = (totalByBank[bank] ?? 0) + 1;
      const code = String((r as any).stage_code ?? '').toLowerCase();
      if (['r', 'r2'].includes(code)) {
        rejectedByBank[bank] = (rejectedByBank[bank] ?? 0) + 1;
        const key = `${(r as any).rejection_category ?? 'Unknown'}::${(r as any).rejection_reason ?? 'Unknown'}`;
        reasonCounts[key] = (reasonCounts[key] ?? 0) + 1;
      }
    }

    const banks = Object.keys(totalByBank).map(bank => ({
      bank,
      total: totalByBank[bank],
      rejected: rejectedByBank[bank] ?? 0,
      rate: Number((safePct(rejectedByBank[bank] ?? 0, totalByBank[bank] ?? 0)).toFixed(2)),
    }));

    const totalLeads = Object.values(totalByBank).reduce((a, b) => a + b, 0);

    const reasons = Object.entries(reasonCounts).map(([key, count]) => {
      const [category, reason] = key.split('::');
      const pct = totalLeads ? (count / totalLeads) : 0;
      return { category, reason, count, pctOfTotal: Number((pct * 100).toFixed(2)) };
    });

    const totalRejections = Object.values(rejectedByBank).reduce((a, b) => a + b, 0);
    const topReason = reasons.slice().sort((a, b) => b.count - a.count)[0]?.reason ?? '—';
    const rejectionRate = Number((safePct(totalRejections, totalLeads)).toFixed(2));
    const worstBank = banks.slice().sort((a, b) => b.rate - a.rate)[0]?.bank ?? '—';

    const ts = nowTimestamps();
    const meta = {
      version: 'v1',
      currency: CONFIG.CURRENCY,
      rounding: { money: 'rupees0', percent: '2dp' },
      clampMonth: (used as any)?.endMonth ?? CONFIG.CURRENT_DATA_MAX_MONTH,
      generatedAt: ts.iso,
      generatedAtIST: ts.ist,
      timezone: ts.timezone,
    } as const;

    return new Response(
      JSON.stringify(ok({ kpis: { totalRejections, topReason, rejectionRate, worstBank }, banks, reasons, meta })),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/reports_rejection.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

