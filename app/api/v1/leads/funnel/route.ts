import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const includeClicks = url.searchParams.get('include_clicks') === 'true';
    const useMock = process.env.USE_MOCK === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    if (useMock || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mock = await import('@/mock-data/funnel.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    let query = supabase
      .from('Raw')
      .select('application_id, stage_code, clean_exit, application_month, application_date')
      .gte('application_month', filters.timeRange.start)
      .lte('application_month', filters.timeRange.end);

    if ((filters as any).applicationMonth) {
      query = query.eq('application_month', (filters as any).applicationMonth as string);
    }
    if ((filters as any).customRange) {
      const cr = (filters as any).customRange as { from: string; to: string };
      query = query.gte('application_date', cr.from).lte('application_date', cr.to);
    }

    const { data: rawRows, error } = await query;
    if (error) return fail(500, 'Failed to fetch');

    let clicks = 0;
    if (includeClicks) {
      const exits = await supabase
        .from('exitclicks')
        .select('exit_id, clean_exit, userid')
        .not('clean_exit', 'is', null);
      if (!exits.error) clicks = exits.data?.length ?? 0;
    }

    const leads = rawRows?.length ?? 0;
    const count = (codes: string[]) => rawRows?.filter(r => codes.includes((r as any).stage_code)).length ?? 0;
    const result = {
      clicks,
      leads,
      stages: {
        incomplete: count(['a', 'b']),
        kyc: count(['c', 'd']),
        verification: count(['e', 'f']),
        approved: count(['w', 'z']),
        rejected: count(['r', 'r2']),
        expired: count(['y']),
      },
      quality: [],
    } as const;

    return new Response(JSON.stringify(ok(result)), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/funnel.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

