import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const view = (url.searchParams.get('view') as 'month' | 'day') || 'month';
    const month = url.searchParams.get('month') || '';
    const filtersParam = url.searchParams.get('filters');
    const useMock = process.env.USE_MOCK === '1';

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    if (useMock || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mock = await import('@/mock-data/timeline.json');
      const data = mock.default.data;
      const payload = view === 'month' ? data.months : data.days[month] ?? [];
      return new Response(JSON.stringify(ok(payload, { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    if (view === 'month') {
      const { data: rows, error } = await supabase
        .from('Raw')
        .select('application_month, stage_code')
        .gte('application_month', filters.timeRange.start)
        .lte('application_month', filters.timeRange.end);
      if (error) return fail(500, 'Failed to fetch');
      const byMonth: Record<string, any> = {};
      for (const r of rows ?? []) {
        const m = (r as any).application_month ?? 'unknown';
        byMonth[m] ||= { label: m, clicks: 0, leads: 0, incomplete: 0, kyc: 0, verification: 0, approved: 0, rejected: 0, expired: 0 };
        byMonth[m].leads += 1;
        const code = (r as any).stage_code as string;
        if (['a','b'].includes(code)) byMonth[m].incomplete += 1;
        if (['c','d'].includes(code)) byMonth[m].kyc += 1;
        if (['e','f'].includes(code)) byMonth[m].verification += 1;
        if (['w','z'].includes(code)) byMonth[m].approved += 1;
        if (['r','r2'].includes(code)) byMonth[m].rejected += 1;
        if (['y'].includes(code)) byMonth[m].expired += 1;
      }
      return new Response(JSON.stringify(ok(Object.values(byMonth), { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
    }

    // day view
    const { data: rows, error } = await supabase
      .from('Raw')
      .select('application_date, stage_code')
      .like('application_month', month)
      .is('application_date', null, { not: true });
    if (error) return fail(500, 'Failed to fetch');
    const byDay: Record<string, any> = {};
    for (const r of rows ?? []) {
      const d = (r as any).application_date ?? '01-01-1970';
      const label = d.split('-').reverse().join('-');
      byDay[label] ||= { label, clicks: 0, leads: 0, incomplete: 0, kyc: 0, verification: 0, approved: 0, rejected: 0, expired: 0 };
      byDay[label].leads += 1;
      const code = (r as any).stage_code as string;
      if (['a','b'].includes(code)) byDay[label].incomplete += 1;
      if (['c','d'].includes(code)) byDay[label].kyc += 1;
      if (['e','f'].includes(code)) byDay[label].verification += 1;
      if (['w','z'].includes(code)) byDay[label].approved += 1;
      if (['r','r2'].includes(code)) byDay[label].rejected += 1;
      if (['y'].includes(code)) byDay[label].expired += 1;
    }
    return new Response(JSON.stringify(ok(Object.values(byDay), { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/timeline.json');
      const data = mock.default.data;
      const url = new URL(req.url);
      const view = (url.searchParams.get('view') as 'month' | 'day') || 'month';
      const month = url.searchParams.get('month') || '';
      const payload = view === 'month' ? data.months : data.days[month] ?? [];
      return new Response(JSON.stringify(ok(payload, { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

