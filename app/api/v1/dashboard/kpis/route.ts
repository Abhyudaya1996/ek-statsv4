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
      const mock = await import('@/mock-data/dashboard.json');
      return new Response(
        JSON.stringify({ success: true, data: (mock as any).default.kpis }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getServerClient();

    // Simplified REAL logic placeholder: aggregate from Raw. In production, prefer mv_dashboard_kpis for single month.
    const monthStart = filters.timeRange.start;
    const monthEnd = filters.timeRange.end;

    // Build base query with exact count; page through results to avoid 1k cap
    let base = supabase
      .from('Raw')
      .select('stage_code, total_commission, ops_status, application_date, application_month', { count: 'exact' })
      .gte('application_month', monthStart)
      .lte('application_month', monthEnd);
    if ((filters as any).applicationMonth) {
      base = base.eq('application_month', (filters as any).applicationMonth as string);
    }
    if ((filters as any).customRange) {
      const cr = (filters as any).customRange as { from: string; to: string };
      base = base.gte('application_date', cr.from).lte('application_date', cr.to);
    }

    const PAGE_SIZE = 1000;
    const firstPage = await base.range(0, PAGE_SIZE - 1);
    if (firstPage.error) return fail(500, 'Failed to fetch');

    let rows = firstPage.data ?? [];
    const totalRows = firstPage.count ?? rows.length;
    for (let offset = rows.length; offset < totalRows; offset += PAGE_SIZE) {
      const { data, error } = await base.range(offset, Math.min(offset + PAGE_SIZE - 1, totalRows - 1));
      if (error) return fail(500, 'Failed to fetch');
      if (data && data.length) rows = rows.concat(data);
    }

    const totalLeads = rows.length;
    const cardouts = rows.filter(r => ['w', 'z'].includes((r as any).stage_code)).length;
    const incomplete = rows.filter(r => ['a', 'b'].includes((r as any).stage_code)).length;
    const totalCommission = rows.reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0);
    const potentialCommission = totalCommission * 0.1;
    const approvalRate = safePct(cardouts, totalLeads);

    return new Response(
      JSON.stringify(ok({ totalLeads, potentialCommission, approvalRate, incomplete })),
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

