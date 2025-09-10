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

    const supabase = getServerClient();

    const withTimeout = async <T>(p: Promise<T>, ms = 8000): Promise<T> => {
      return await Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
      ]) as T;
    };

    if (view === 'month') {
      const { startMonth, endMonth } = deriveMonthRange(readFilters(new URL(req.url).searchParams) as any);

      const base = supabase
        .from('ek_applications_v')
        .select('application_month, stage_code', { count: 'exact' })
        .gte('application_date', monthStartIso(startMonth))
        .lt('application_date', nextMonthStartIso(endMonth));
      const { data: rowsRaw, error } = await withTimeout(base.range(0, 20000));
      if (error) return fail(500, 'Failed to fetch');
      const rows = rowsRaw ?? [];
      const byMonth: Record<string, any> = {};
      const leadCodes = new Set(LEADS_STAGE_CODES as readonly string[]);
      const incomplete = new Set(STAGE_CODES.INCOMPLETE as readonly string[]);
      const kyc = new Set(STAGE_CODES.KYC as readonly string[]);
      const verification = new Set([...(STAGE_CODES.UNDERWRITING as readonly string[]), ...(STAGE_CODES.CURING as readonly string[])]);
      const approved = new Set([...(STAGE_CODES.WAITING_APPROVAL as readonly string[]), ...(STAGE_CODES.APPROVED as readonly string[])]);
      const rejected = new Set(STAGE_CODES.REJECTED as readonly string[]);
      const expired = new Set(STAGE_CODES.EXPIRED as readonly string[]);

      for (const r of rows ?? []) {
        const m = (r as any).application_month ?? ((r as any).application_date ? String((r as any).application_date).slice(0,7) : 'unknown');
        byMonth[m] ||= { label: m, clicks: 0, leads: 0, incomplete: 0, kyc: 0, verification: 0, approved: 0, rejected: 0, expired: 0 };
        const code = String((r as any).stage_code ?? '').toLowerCase();
        if (leadCodes.has(code)) byMonth[m].leads += 1;
        if (incomplete.has(code)) byMonth[m].incomplete += 1;
        if (kyc.has(code)) byMonth[m].kyc += 1;
        if (verification.has(code)) byMonth[m].verification += 1;
        if (approved.has(code)) byMonth[m].approved += 1;
        if (rejected.has(code)) byMonth[m].rejected += 1;
        if (expired.has(code)) byMonth[m].expired += 1;
      }
      // Build month list between start and endMonth
      const months: string[] = [];
      {
        let ym = startMonth;
        while (ym <= endMonth) {
          months.push(ym);
          ym = nextMonthStartIso(ym).slice(0,7);
        }
      }
      const stitched = months.map(m => ({
        ...(byMonth[m] || { label: m, clicks: 0, leads: 0, incomplete: 0, kyc: 0, verification: 0, approved: 0, rejected: 0, expired: 0 }),
        clicks: PRD_MONTHLY_CLICKS[m] ?? null,
      }));
      const ts = { iso: new Date().toISOString(), ist: new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()), timezone: 'Asia/Kolkata' } as const;
      const meta = { version: 'v1', currency: CONFIG.CURRENCY, rounding: { money: 'rupees0', percent: '2dp' }, clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH, generatedAt: ts.iso, generatedAtIST: ts.ist, timezone: ts.timezone } as const;
      return new Response(JSON.stringify(ok({ timeline: stitched, meta })), { headers: { 'Content-Type': 'application/json' } });
    }

    // day view
    const endMonth = month > CONFIG.CURRENT_DATA_MAX_MONTH ? CONFIG.CURRENT_DATA_MAX_MONTH : month;
    const base = supabase
      .from('ek_applications_v')
      .select('application_date, stage_code', { count: 'exact' })
      .gte('application_date', `${endMonth}-01`)
      .lt('application_date', new Date(Number(endMonth.split('-')[0]), Number(endMonth.split('-')[1]), 1).toISOString().slice(0,10))
      .not('application_date', 'is', null);
    const { data: rowsRaw, error } = await withTimeout(base.range(0, 20000));
    if (error) return fail(500, 'Failed to fetch');
    const rows = rowsRaw ?? [];
    const byDay: Record<string, any> = {};
    const leadCodes2 = new Set(LEADS_STAGE_CODES as readonly string[]);
    const incomplete2 = new Set(STAGE_CODES.INCOMPLETE as readonly string[]);
    const kyc2 = new Set(STAGE_CODES.KYC as readonly string[]);
    const verification2 = new Set([...(STAGE_CODES.UNDERWRITING as readonly string[]), ...(STAGE_CODES.CURING as readonly string[])]);
    const approved2 = new Set([...(STAGE_CODES.WAITING_APPROVAL as readonly string[]), ...(STAGE_CODES.APPROVED as readonly string[])]);
    const rejected2 = new Set(STAGE_CODES.REJECTED as readonly string[]);
    const expired2 = new Set(STAGE_CODES.EXPIRED as readonly string[]);

    for (const r of rows ?? []) {
      const d = (r as any).application_date ?? '01-01-1970';
      const label = d.split('-').reverse().join('-');
      byDay[label] ||= { label, clicks: 0, leads: 0, incomplete: 0, kyc: 0, verification: 0, approved: 0, rejected: 0, expired: 0 };
      const code = String((r as any).stage_code ?? '').toLowerCase();
      if (leadCodes2.has(code)) byDay[label].leads += 1;
      if (incomplete2.has(code)) byDay[label].incomplete += 1;
      if (kyc2.has(code)) byDay[label].kyc += 1;
      if (verification2.has(code)) byDay[label].verification += 1;
      if (approved2.has(code)) byDay[label].approved += 1;
      if (rejected2.has(code)) byDay[label].rejected += 1;
      if (expired2.has(code)) byDay[label].expired += 1;
    }
    const ts = { iso: new Date().toISOString(), ist: new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()), timezone: 'Asia/Kolkata' } as const;
    const meta = { version: 'v1', currency: CONFIG.CURRENCY, rounding: { money: 'rupees0', percent: '2dp' }, clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH, generatedAt: ts.iso, generatedAtIST: ts.ist, timezone: ts.timezone } as const;
    return new Response(JSON.stringify(ok({ timeline: Object.values(byDay), meta })), { headers: { 'Content-Type': 'application/json' } });
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

