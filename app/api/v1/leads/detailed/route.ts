import { NextRequest } from 'next/server';
import { FiltersSchema, PaginationSchema, sanitizeSearch } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    const searchParam = sanitizeSearch(url.searchParams.get('search') ?? undefined);
    const useMock = process.env.USE_MOCK === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    const { page, limit } = PaginationSchema.parse({ page: pageParam, limit: limitParam });

    if (useMock || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mock = await import('@/mock-data/leads.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    let query = supabase
      .from('Raw')
      .select('*', { count: 'exact' })
      .gte('application_month', filters.timeRange.start)
      .lte('application_month', filters.timeRange.end);

    if (filters.banks.length) query = query.in('bank', filters.banks);
    if (filters.cards.length) query = query.in('card_name', filters.cards);
    if (filters.qualityStages && (filters.qualityStages as string[]).length) {
      query = query.in('application_quality', filters.qualityStages as string[]);
    }
    if (filters.stages && (filters.stages as string[]).length) {
      query = query.in('stage_code', filters.stages as string[]);
    }

    if (searchParam) {
      // Basic OR search across multiple columns
      query = query.or(
        `application_id.ilike.%${searchParam}%,applicant_name.ilike.%${searchParam}%,card_name.ilike.%${searchParam}%,bank.ilike.%${searchParam}%`
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: rows, count, error } = await query.range(from, to);
    if (error) return fail(500, 'Failed to fetch');

    const mapped = (rows ?? []).map(r => ({
      applicationId: (r as any).application_id,
      applicantName: (r as any).applicant_name ?? '',
      applicationDate: (r as any).application_date ?? '',
      bank: (r as any).bank ?? '',
      cardName: (r as any).card_name ?? '',
      stageBucket: (r as any).stage_code ?? '',
      quality: (r as any).application_quality ?? 'Unknown',
      description: (r as any).ek_crm_status ?? '',
      commission: Number((r as any).total_commission ?? 0),
      commissionStatus: ((r as any).ops_status ?? 'pending') as 'pending' | 'paid',
    }));

    return new Response(
      JSON.stringify(ok(mapped, { page, limit, total: count ?? 0, version: 'v1' })),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/leads.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

