import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
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
      return new Response(JSON.stringify({ success: true, data: mock.default.commission }), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    const { data: rows, error } = await supabase
      .from('Raw')
      .select('total_commission, ops_status')
      .gte('application_month', filters.timeRange.start)
      .lte('application_month', filters.timeRange.end);

    if (error) return fail(500, 'Failed to fetch');

    const total = rows?.reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0) ?? 0;
    const pending = rows?.filter(r => (r as any).ops_status === 'pending').reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0) ?? 0;
    const paid = rows?.filter(r => (r as any).ops_status === 'paid').reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0) ?? 0;
    const potential = total * 0.1;

    return new Response(JSON.stringify(ok({ total, potential, pending, paid })), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/dashboard.json');
      return new Response(JSON.stringify({ success: true, data: mock.default.commission }), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

