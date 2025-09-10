import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, SupabaseEnvError } from '@/lib/supabase';
import { readFilters, deriveMonthRangeAsync, monthStartIso, nextMonthStartIso } from '@/lib/server/range';
import { FUNNEL, LEADS_STAGE_CODES } from '@/lib/constants';
import { fetchAllRows } from '@/lib/supabase-fetch';

type Row = { application_quality: string | null; stage_code: string | null; application_date: string | null };

export async function GET(req: NextRequest) {
  try {
    const supabase = getServerClient();
    const url = new URL(req.url);
    const incoming = readFilters(url.searchParams) as any;
    const { startMonth, endMonth } = await deriveMonthRangeAsync(incoming);
    const from = monthStartIso(startMonth);
    const to = nextMonthStartIso(endMonth);

    const base = supabase
      .from('ek_applications_v')
      .select('application_quality, stage_code, application_date', { count: 'exact' })
      .gte('application_date', from)
      .lt('application_date', to);
    const rows: Row[] = (await fetchAllRows<any>(base as any)) as any;
    const kycDone = new Set(FUNNEL.KYC_DONE as readonly string[]);
    const kycPending = new Set(FUNNEL.KYC_PENDING as readonly string[]);
    const approved = new Set(FUNNEL.APPROVED as readonly string[]);
    const rejected = new Set(FUNNEL.REJECTED as readonly string[]);

    type Acc = { leads: number; approvals: number; rejections: number; kycDone: number; kycPending: number };
    const accByQ = new Map<string, Acc>();
    const ensure = (q: string): Acc => {
      const key = q || 'Unknown';
      if (!accByQ.has(key)) accByQ.set(key, { leads: 0, approvals: 0, rejections: 0, kycDone: 0, kycPending: 0 });
      return accByQ.get(key)!;
    };

    const normalizeQuality = (raw: string | null | undefined): string => {
      const v = String(raw ?? '').trim().toLowerCase();
      if (!v || v === 'null') return 'Unknown';
      if (v.includes('good')) return 'Good';
      if (v.includes('avg') || v.includes('average')) return 'Avg';
      if (v.includes('bad')) return 'Bad';
      if (v.includes('unknown')) return 'Unknown';
      return 'Unknown';
    };

    const leadCodes = new Set(LEADS_STAGE_CODES as readonly string[]);
    for (const r of rows) {
      const q = normalizeQuality(r.application_quality);
      const sc = String(r.stage_code ?? '').toLowerCase();
      const acc = ensure(q);
      if (leadCodes.has(sc)) acc.leads += 1;
      if (kycDone.has(sc)) acc.kycDone += 1;
      if (kycPending.has(sc)) acc.kycPending += 1;
      if (approved.has(sc)) acc.approvals += 1;
      if (rejected.has(sc)) acc.rejections += 1;
    }

    const byQuality = Array.from(accByQ.entries())
      .map(([quality, v]) => ({
        quality,
        ...v,
        approvalRate: v.leads ? Number(((v.approvals / v.leads) * 100).toFixed(2)) : 0,
        rejectionRate: v.leads ? Number(((v.rejections / v.leads) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.quality.localeCompare(b.quality));

    const totals = byQuality.reduce(
      (t, r) => ({
        leads: t.leads + r.leads,
        approvals: t.approvals + r.approvals,
        rejections: t.rejections + r.rejections,
        kycDone: t.kycDone + r.kycDone,
        kycPending: t.kycPending + r.kycPending,
      }),
      { leads: 0, approvals: 0, rejections: 0, kycDone: 0, kycPending: 0 }
    );

    const metaDebug = { rowsCount: rows?.length ?? 0, range: { startMonth, endMonth, from, to } };

    return new Response(
      JSON.stringify(ok({ byQuality, totals, range: { startMonth, endMonth, from, to }, metaDebug })),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      return fail(500, 'supabase_env');
    }
    return fail(500, 'unexpected_error');
  }
}


