import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail, safePct } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const useMock = process.env.USE_MOCK === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    if (useMock || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mock = await import('@/mock-data/reports_rejection.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    const { data: rows, error } = await supabase
      .from('Raw')
      .select('bank, stage_code, rejection_reason, rejection_category')
      .gte('application_month', filters.timeRange.start)
      .lte('application_month', filters.timeRange.end);

    if (error) return fail(500, 'Failed to fetch');

    const totalByBank: Record<string, number> = {};
    const rejectedByBank: Record<string, number> = {};
    const reasonCounts: Record<string, number> = {};

    for (const r of rows ?? []) {
      const bank = (r as any).bank ?? 'Unknown';
      totalByBank[bank] = (totalByBank[bank] ?? 0) + 1;
      const code = (r as any).stage_code as string;
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
      rate: safePct(rejectedByBank[bank] ?? 0, totalByBank[bank] ?? 0),
    }));

    const totalLeads = Object.values(totalByBank).reduce((a, b) => a + b, 0);

    const reasons = Object.entries(reasonCounts).map(([key, count]) => {
      const [category, reason] = key.split('::');
      return { category, reason, count, pctOfTotal: totalLeads ? (count / totalLeads) * 100 : 0 };
    });

    const totalRejections = Object.values(rejectedByBank).reduce((a, b) => a + b, 0);
    const topReason = reasons.slice().sort((a, b) => b.count - a.count)[0]?.reason ?? '—';
    const rejectionRate = safePct(totalRejections, totalLeads);
    const worstBank = banks.slice().sort((a, b) => b.rate - a.rate)[0]?.bank ?? '—';

    return new Response(
      JSON.stringify(ok({ kpis: { totalRejections, topReason, rejectionRate, worstBank }, banks, reasons }, { version: 'v1' })),
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

