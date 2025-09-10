import { NextRequest } from 'next/server';
import { FiltersSchema, PaginationSchema, sanitizeSearch } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';
import { deriveMonthRangeAsync, readFilters, monthStartIso, nextMonthStartIso } from '@/lib/server/range';
import { fetchAllRows } from '@/lib/supabase-fetch';
import { STAGE_CODES, STAGE_LABELS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    const searchParam = sanitizeSearch(url.searchParams.get('search') ?? undefined);
    const forceMock = new URL(req.url).searchParams.get('mock') === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    const { page, limit } = PaginationSchema.parse({ page: pageParam, limit: limitParam });

    if (forceMock || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mock = await import('@/mock-data/leads.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    // Clamp to the effective data month on the server regardless of client filters
    const incoming = readFilters(new URL(req.url).searchParams) as any;
    const { startMonth, endMonth, clampMonth } = await deriveMonthRangeAsync(incoming);
    let query = supabase
      .from('ek_applications_v')
      .select('*', { count: 'exact' })
      .gte('application_date', monthStartIso(startMonth))
      .lt('application_date', nextMonthStartIso(endMonth));

    // If explicit application-month selection is provided, narrow to that single month
    if ((filters as any).applicationMonth) {
      const m = (filters as any).applicationMonth as string;
      query = query
        .gte('application_date', `${m}-01`)
        .lt('application_date', new Date(Number(m.split('-')[0]), Number(m.split('-')[1]), 1).toISOString().slice(0,10));
    }

    // If a custom day range is present, filter by application_date day granularity
    if ((filters as any).customRange) {
      const cr = (filters as any).customRange as { from: string; to: string };
      query = query.gte('application_date', cr.from).lte('application_date', cr.to);
    }

    if (filters.banks.length) query = query.in('bank', filters.banks);
    if (filters.cards.length) query = query.in('card_name', filters.cards);
    const qualitySelections = (filters.qualityStages as string[]) ?? [];
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
    const wantsQuality = qualitySelections && qualitySelections.length > 0;
    let rows: any[] = [];
    let count: number | null = null;
    if (wantsQuality) {
      const all = await fetchAllRows<any>(query as any);
      const selected = new Set(qualitySelections.map(s => s.toLowerCase()));
      const normalizeQuality = (raw: string | null | undefined): 'Good' | 'Avg' | 'Bad' | 'Unknown' => {
        const v = String(raw ?? '').trim().toLowerCase();
        if (!v) return 'Unknown';
        if (v.includes('good')) return 'Good';
        if (v.includes('avg') || v.includes('average')) return 'Avg';
        if (v.includes('bad')) return 'Bad';
        if (v.includes('unknown')) return 'Unknown';
        return 'Unknown';
      };
      const filtered = all.filter(r => selected.has(normalizeQuality((r as any).application_quality).toLowerCase()));
      count = filtered.length;
      rows = filtered.slice(from, to + 1);
    } else {
      const { data, count: c, error } = await query.range(from, to);
      if (error) return fail(500, 'Failed to fetch');
      rows = (data ?? []) as any[];
      count = c ?? rows.length;
    }

    const classify = (code: string | null | undefined): string => {
      const sc = String(code ?? '').toLowerCase();
      for (const [bucket, codes] of Object.entries(STAGE_CODES)) {
        if ((codes as readonly string[]).includes(sc)) {
          return (STAGE_LABELS as any)[bucket] ?? bucket;
        }
      }
      return 'Unknown';
    };

    const normalizeQualityLabel = (raw: string | null | undefined): string => {
      const v = String(raw ?? '').trim().toLowerCase();
      if (!v) return 'Unknown';
      if (v.includes('good')) return 'Good';
      if (v.includes('avg') || v.includes('average')) return 'Avg';
      if (v.includes('bad')) return 'Bad';
      if (v.includes('unknown')) return 'Unknown';
      return 'Unknown';
    };

    const normalizeDescription = (raw: string | null | undefined): string => {
      const s = String(raw ?? '').trim();
      if (!s || s.toUpperCase() === 'NA') return 'User selected secured card';
      return s;
    };

    const mapped = (rows ?? []).map(r => ({
      applicationId: (r as any).application_id,
      applicantName: (r as any).applicant_name ?? '',
      applicationDate: (r as any).application_date ?? '',
      bank: (r as any).bank ?? '',
      cardName: (r as any).card_name ?? '',
      stageBucket: classify((r as any).stage_code),
      quality: normalizeQualityLabel((r as any).application_quality),
      description: normalizeDescription((r as any).description ?? (r as any).ek_crm_status ?? (r as any).current_status ?? ''),
      commission: Number((r as any).total_commission ?? 0),
      commissionStatus: ((r as any).ops_status ?? 'Pending') as 'Pending' | 'Paid',
    }));

    return new Response(
      JSON.stringify(ok(mapped, { page, limit, total: count ?? 0, version: 'v1', clampMonth })),
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

