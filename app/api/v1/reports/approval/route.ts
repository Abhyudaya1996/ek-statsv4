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
      const mock = await import('@/mock-data/reports_approval.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    let query = supabase
      .from('Raw')
      .select('bank, stage_code, application_date, decision_date')
      .gte('application_month', filters.timeRange.start)
      .lte('application_month', filters.timeRange.end);
    if ((filters as any).applicationMonth) {
      query = query.eq('application_month', (filters as any).applicationMonth as string);
    }
    if ((filters as any).customRange) {
      const cr = (filters as any).customRange as { from: string; to: string };
      query = query.gte('application_date', cr.from).lte('application_date', cr.to);
    }

    const { data: rows, error } = await query;
    if (error) return fail(500, 'Failed to fetch');

    const byBank: Record<string, { total: number; approved: number; days: number[] }> = {};
    for (const r of rows ?? []) {
      const bank = (r as any).bank ?? 'Unknown';
      byBank[bank] ||= { total: 0, approved: 0, days: [] };
      byBank[bank].total += 1;
      const code = (r as any).stage_code as string;
      if (['z'].includes(code)) {
        byBank[bank].approved += 1;
        const ad = (r as any).application_date;
        const dd = (r as any).decision_date;
        if (ad && dd) {
          const dt1 = new Date(ad.split('-').reverse().join('-'));
          const dt2 = new Date(dd.split('-').reverse().join('-'));
          const diff = Math.max(0, (dt2.getTime() - dt1.getTime()) / (1000 * 60 * 60 * 24));
          byBank[bank].days.push(diff);
        }
      }
    }

    const banks = Object.entries(byBank).map(([bank, v]) => ({
      bank,
      total: v.total,
      approved: v.approved,
      rate: safePct(v.approved, v.total),
      avgDays: v.days.length ? v.days.reduce((a, b) => a + b, 0) / v.days.length : null,
    }));

    const totalApprovals = banks.reduce((acc, b) => acc + b.approved, 0);
    const totalLeads = banks.reduce((acc, b) => acc + b.total, 0);
    const approvalRate = safePct(totalApprovals, totalLeads);
    const topBank = banks.slice().sort((a, b) => b.rate - a.rate)[0] || { bank: '—', rate: 0 };
    const avgProcessingDays = (() => {
      const all = banks.flatMap(b => (b.avgDays == null ? [] : [b.avgDays]));
      if (!all.length) return null;
      return all.reduce((a, b) => a + b, 0) / all.length;
    })();

    return new Response(
      JSON.stringify(ok({ kpis: { totalApprovals, approvalRate, topBank: { name: topBank.bank, rate: topBank.rate }, avgProcessingDays }, banks }, { version: 'v1' })),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/reports_approval.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

