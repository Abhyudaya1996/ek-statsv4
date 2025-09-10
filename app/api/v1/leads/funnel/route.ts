import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, serverHasEnv, SupabaseEnvError } from '@/lib/supabase';
import { PRD_MONTHLY_CLICKS } from '@/lib/prd-clicks';
import { readFilters, enumerateMonths, deriveMonthRangeAsync, monthStartIso, nextMonthStartIso } from '@/lib/server/range';
import { STAGE_CODES, FUNNEL, LEADS_STAGE_CODES } from '@/lib/constants';
import { fetchAllRows } from '@/lib/supabase-fetch';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filtersParam = url.searchParams.get('filters');
    const includeClicks = url.searchParams.get('include_clicks') === 'true';
    const debug = url.searchParams.get('debug') === '1';
    const forceMock = url.searchParams.get('mock') === '1';
    const haveEnv = serverHasEnv();

    let filters;
    try {
      filters = FiltersSchema.parse(filtersParam ? JSON.parse(filtersParam) : {});
    } catch {
      return fail(400, 'Invalid filters');
    }

    if (forceMock || !haveEnv) {
      const mock = await import('@/mock-data/funnel.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();

    const incoming = readFilters(new URL(req.url).searchParams) as any;
    const { startMonth, endMonth, clampMonth } = await deriveMonthRangeAsync(incoming);
    const from = monthStartIso(startMonth);
    const to = nextMonthStartIso(endMonth);
    const base = supabase
      .from('ek_applications_v')
      .select('application_id, stage_code, clean_exit, application_date, user_id', { count: 'exact' })
      .gte('application_date', from)
      .lt('application_date', to);
    const rawRows = await fetchAllRows<any>(base as any);
    const rows = (rawRows ?? []).map(r => ({
      ...(r as any),
      stage_code: String((r as any).stage_code ?? '').toLowerCase(),
    }));

    // Always include PRD clicks by default for the effective month span
    const months = enumerateMonths(startMonth, endMonth);
    const clicks = months.reduce((sum, m) => sum + (PRD_MONTHLY_CLICKS[m] ?? 0), 0);

    const leadsSet = new Set(LEADS_STAGE_CODES as readonly string[]);
    const leads = rows.filter(r => leadsSet.has(String((r as any).stage_code))).length;
    const count = (codes: string[]) => rows.filter(r => codes.includes(String((r as any).stage_code))).length;
    const result = {
      clicks,
      leads,
      stages: {
        incomplete: count([...(FUNNEL.INCOMPLETE as readonly string[])]),
        kycDone: count([...(FUNNEL.KYC_DONE as readonly string[])]),
        kycPending: count([...(FUNNEL.KYC_PENDING as readonly string[])]),
        verification: count([...(FUNNEL.VERIFICATION as readonly string[])]),
        approved: count([...(FUNNEL.APPROVED as readonly string[])]),
        rejected: count([...(FUNNEL.REJECTED as readonly string[])]),
      },
      quality: [],
      clicksByMonth: months.map(m => ({ month: m, clicks: PRD_MONTHLY_CLICKS[m] ?? 0 })),
      ...(debug
        ? {
            debug: {
              totalRows: rows.length,
              byStage: rows.reduce((acc: Record<string, number>, r: any) => {
                const sc = String(r.stage_code);
                acc[sc] = (acc[sc] || 0) + 1;
                return acc;
              }, {}),
            },
          }
        : {}),
    } as const;

    return new Response(JSON.stringify(ok(result, { range: { startMonth, endMonth }, clampMonth } as any)), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/funnel.json');
      return new Response(JSON.stringify(mock.default), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, 'Unexpected error');
  }
}

