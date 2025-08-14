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

    // Example query sketch; replace with real columns and filters
    const { data: rows, error } = await supabase
      .from('Raw')
      .select('application_id, stage_code, total_commission, ops_status')
      .gte('application_month', monthStart)
      .lte('application_month', monthEnd);

    if (error) return fail(500, 'Failed to fetch');

    const totalLeads = rows?.length ?? 0;
    const cardouts = rows?.filter(r => ['w', 'z'].includes((r as any).stage_code)).length ?? 0;
    const incomplete = rows?.filter(r => ['a', 'b'].includes((r as any).stage_code)).length ?? 0;
    const totalCommission = rows?.reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0) ?? 0;
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

