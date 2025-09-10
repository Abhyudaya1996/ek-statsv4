import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';
import { CONFIG } from '@/lib/config';
import { readFilters, deriveMonthRange, monthStartIso, nextMonthStartIso } from '@/lib/server/range';
import { PRD_MONTHLY_CLICKS } from '@/lib/prd-clicks';
import { LEADS_STAGE_CODES, STAGE_CODES } from '@/lib/constants';
import { fetchAllRows } from '@/lib/supabase-fetch';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const view = (url.searchParams.get('view') as 'month' | 'day') || 'month';
    const month = url.searchParams.get('month') || '';
    const filtersParam = url.searchParams.get('filters');
    const useMock = process.env.USE_MOCK === '1';

    // Quick health/probe to verify the handler is reachable without touching DB
    if (url.searchParams.get('ping') === '1') {
      return new Response(JSON.stringify(ok({ pong: true, view, month }, { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
    }

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    // Use mock data for timeline report
    const mock = await import('@/mock-data/timeline.json');
    const data = mock.default.data as { months: any[]; days: Record<string, any[]> };
    const days = data.days as Record<string, any[]>;
    const payload = view === 'month' ? data.months : (days[month] ?? []);
    return new Response(JSON.stringify(ok(payload, { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/timeline.json');
      const data = mock.default.data as { months: any[]; days: Record<string, any[]> };
      const url = new URL(req.url);
      const view = (url.searchParams.get('view') as 'month' | 'day') || 'month';
      const month = url.searchParams.get('month') || '';
      const days = data.days as Record<string, any[]>;
      const payload = view === 'month' ? data.months : (days[month] ?? []);
      return new Response(JSON.stringify(ok(payload, { version: 'v1' })), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

