import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail, safePct } from '@/lib/api-helpers';
import { getServerClient, serverHasEnv, SupabaseEnvError } from '@/lib/supabase';
import { fetchAllRows, monthRangeToDates } from '@/lib/supabase-fetch';
import { CONFIG } from '@/lib/config';
import { deriveMonthRangeAsync, readFilters } from '@/lib/server/range';
import { OPS_STATUS, STAGE_CODES } from '@/lib/constants';

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
      const mock = await import('@/mock-data/dashboard.json');
      return new Response(
        JSON.stringify({ success: true, data: (mock as any).default.kpis }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getServerClient();

    // Resolve month range considering dynamic clamp
    const incoming = readFilters(new URL(req.url).searchParams) as any;
    const { startMonth, endMonth } = await deriveMonthRangeAsync(incoming);
    const { from, to } = monthRangeToDates(startMonth, endMonth);

    // Build base query with exact count; page through results to avoid 1k cap
    let base = supabase
      .from('ek_applications_v')
      .select('stage_code, total_commission, ops_status, application_date, user_id', { count: 'exact' })
      .gte('application_date', from)
      .lt('application_date', to);
    if ((filters as any).userId) {
      base = base.eq('user_id', Number((filters as any).userId));
    }
    if ((filters as any).applicationMonth) {
      const m = (filters as any).applicationMonth as string; // YYYY-MM
      base = base.gte('application_date', `${m}-01`).lt('application_date', new Date(Number(m.split('-')[0]), Number(m.split('-')[1]), 1).toISOString().slice(0,10));
    }
    if ((filters as any).customRange) {
      const cr = (filters as any).customRange as { from: string; to: string };
      // If customRange provided, assume 'to' is inclusive by caller; use lt on next day if needed
      base = base.gte('application_date', cr.from).lte('application_date', cr.to);
    }

    const rows = await fetchAllRows<any>(base as any);

    const totalLeads = rows.length;
    const approvedCount = rows.filter(r => (r as any).stage_code === 'z').length;
    const incomplete = rows.filter(r => (STAGE_CODES.INCOMPLETE as readonly string[]).includes((r as any).stage_code)).length;
    const approvalRate = safePct(approvedCount, totalLeads);

    const sum = (arr: any[]) => arr.reduce((s, r) => s + (Number((r as any).total_commission) || 0), 0);
    const paidCommission = sum(rows.filter(r => (r as any).ops_status === OPS_STATUS.Paid));
    const availablePayment = sum(rows.filter(r => (r as any).ops_status === OPS_STATUS.Confirmed));
    const pendingConfirmation = sum(rows.filter(r => (r as any).stage_code === 'z' && (r as any).ops_status === OPS_STATUS.Pending));
    const confirmedFromZ = sum(rows.filter(r => (r as any).stage_code === 'z'));
    const tenPctFromOthers = sum(rows.filter(r => (r as any).stage_code !== 'z')) * CONFIG.POTENTIAL_COMMISSION_RATE;
    const potentialCommission = confirmedFromZ + tenPctFromOthers;

    const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    return new Response(
      JSON.stringify(ok({
        potentialCommission: round2(potentialCommission),
        pendingConfirmation: Math.round(pendingConfirmation),
        availablePayment: Math.round(availablePayment),
        paidCommission: Math.round(paidCommission),
        totalLeads,
        approvalRate: round2(approvalRate),
        incomplete,
      }, { version: 'v1' })),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/dashboard.json');
      return new Response(
        JSON.stringify({ success: true, data: (mock as any).default.kpis }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    return fail(500, 'Unexpected error');
  }
}

