import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail, safePct } from '@/lib/api-helpers';
import { getServerClient, serverHasEnv, SupabaseEnvError } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/supabase-fetch';
import { CONFIG, nowTimestamps } from '@/lib/config';
import { readFilters, deriveMonthRangeAsync, monthStartIso, nextMonthStartIso } from '@/lib/server/range';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const forceMock = new URL(req.url).searchParams.get('mock') === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    if (forceMock || !serverHasEnv()) {
      const mock = await import('@/mock-data/reports_approval.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    const { startMonth, endMonth } = await deriveMonthRangeAsync(readFilters(new URL(req.url).searchParams) as any);
    let query = supabase
      .from('ek_applications_v')
      .select('bank, stage_code, application_date, decision_date, ops_status, total_commission, user_id', { count: 'exact' })
      .gte('application_date', monthStartIso(startMonth))
      .lt('application_date', nextMonthStartIso(endMonth));
    if ((filters as any).applicationMonth) {
      const m = (filters as any).applicationMonth as string;
      query = query
        .gte('application_date', `${m}-01`)
        .lt('application_date', new Date(Number(m.split('-')[0]), Number(m.split('-')[1]), 1).toISOString().slice(0,10));
    }
    if ((filters as any).customRange) {
      const cr = (filters as any).customRange as { from: string; to: string };
      query = query.gte('application_date', cr.from).lte('application_date', cr.to);
    }

    const rows = await fetchAllRows<any>(query as any);

    const byBank: Record<string, { total: number; approved: number; days: number[] }> = {};
    const parseYmd = (val: unknown): Date | null => {
      const s = String(val ?? '');
      if (!s) return null;
      // Prefer strict YYYY-MM-DD; fallback for DD-MM-YYYY
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return new Date(`${s}T00:00:00Z`);
      }
      const parts = s.split('-');
      if (parts.length === 3) {
        // Try DD-MM-YYYY → YYYY-MM-DD
        const [d, m, y] = parts;
        if (/^\d{2}$/.test(d) && /^\d{2}$/.test(m) && /^\d{4}$/.test(y)) {
          return new Date(`${y}-${m}-${d}T00:00:00Z`);
        }
      }
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };
    for (const r of rows ?? []) {
      const bank = (r as any).bank ?? 'Unknown';
      byBank[bank] ||= { total: 0, approved: 0, days: [] };
      byBank[bank].total += 1;
      const code = String((r as any).stage_code ?? '').toLowerCase();
      if (['z'].includes(code)) {
        byBank[bank].approved += 1;
        const ad = parseYmd((r as any).application_date);
        const dd = parseYmd((r as any).decision_date);
        if (ad && dd) {
          const ms = Math.max(0, dd.getTime() - ad.getTime());
          const diffDays = ms / (1000 * 60 * 60 * 24);
          byBank[bank].days.push(diffDays);
        }
      }
    }

    const banks = Object.entries(byBank).map(([bank, v]) => ({
      bank,
      total: v.total,
      approved: v.approved,
      rate: Number(safePct(v.approved, v.total).toFixed(2)),
      avgDays: v.days.length ? (v.days.reduce((a, b) => a + b, 0) / v.days.length) : null,
    }));

    const totalApprovals = banks.reduce((acc, b) => acc + b.approved, 0);
    const totalLeads = banks.reduce((acc, b) => acc + b.total, 0);
    const approvalRate = Number(safePct(totalApprovals, totalLeads).toFixed(2));
    const topBank = banks.slice().sort((a, b) => b.rate - a.rate)[0] || { bank: '—', rate: 0 };
    const avgProcessingDays = (() => {
      const all = banks.flatMap(b => (b.avgDays == null ? [] : [b.avgDays]));
      if (!all.length) return null;
      return all.reduce((a, b) => a + b, 0) / all.length;
    })();

    const ts = nowTimestamps();
    const meta = {
      version: 'v1',
      currency: CONFIG.CURRENCY,
      rounding: { money: 'rupees0', percent: '2dp' },
      clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH,
      generatedAt: ts.iso,
      generatedAtIST: ts.ist,
      timezone: ts.timezone,
    } as const;

    return new Response(
      JSON.stringify(ok({ kpis: { totalApprovals, approvalRate, topBank: { name: topBank.bank, rate: topBank.rate }, avgProcessingDays }, banks, meta })),
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

