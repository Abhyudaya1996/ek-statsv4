import { NextRequest } from 'next/server';
import { FiltersSchema } from '@/lib/validations';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, serverHasEnv, SupabaseEnvError } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/supabase-fetch';
import { readFilters, fetchWithFallback } from '@/lib/server/range';
import { resolveDateColumn } from '@/lib/server/date-column';
import { CONFIG, nowTimestamps } from '@/lib/config';
import { fmt } from '@/lib/format';
import { OPS_STATUS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const useMock = process.env.USE_MOCK === '1';

    const incoming = readFilters(url.searchParams) as any;

    if (useMock || !serverHasEnv()) {
      const mock = await import('@/mock-data/dashboard.json');
      return new Response(JSON.stringify({ success: true, data: mock.default.commission }), { headers: { 'Content-Type': 'application/json' } });
    }

    const supabase = getServerClient();
    
    const dateCol = await resolveDateColumn();
    const { rows, from, to, used } = await fetchWithFallback<any>(async (fromIso, toIso) => {
      let q = supabase
        .from('ek_applications_v')
        .select(`stage_code, total_commission, ops_status, ${dateCol}, user_id`, { count: 'exact' })
        .gte(dateCol, fromIso)
        .lt(dateCol, toIso);
      const { data, error, count } = await q;
      if (error) throw new Error(error.message);
      return { rows: data ?? [], count: count ?? (data?.length ?? 0) };
    }, incoming);

    const DEBUG = process.env.NODE_ENV !== 'production';
    let metaDebug: any = undefined;
    if (DEBUG) {
      const byOps: Record<string, number> = {};
      const byStageCounts: Record<string, number> = {};
      for (const r of rows ?? []) {
        const keyOps = String((r as any).ops_status ?? 'NULL');
        const keyStg = String((r as any).stage_code ?? 'NULL');
        byOps[keyOps] = (byOps[keyOps] ?? 0) + Number((r as any).total_commission ?? 0);
        byStageCounts[keyStg] = (byStageCounts[keyStg] ?? 0) + 1;
      }
      metaDebug = {
        clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH,
        range: { from, to, startMonth: (used as any).startMonth, endMonth: (used as any).endMonth },
        rowsCount: rows?.length ?? 0,
        sample: rows?.[0] ?? null,
        byOps,
        byStageCounts,
      };
    }

    const total = rows.reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0);
    const pending = rows
      .filter(r => (r as any).ops_status === OPS_STATUS.Pending)
      .reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0);
    const paid = rows
      .filter(r => (r as any).ops_status === OPS_STATUS.Paid)
      .reduce((acc, r) => acc + Number((r as any).total_commission ?? 0), 0);

    // Potential commission logic: full for approved 'z', 10% for all others
    const confirmedCommission = rows
      .filter(r => (r as any).stage_code === 'z')
      .reduce((sum, r) => sum + Number((r as any).total_commission ?? 0), 0);
    const potentialFromOthers = rows
      .filter(r => (r as any).stage_code !== 'z')
      .reduce((sum, r) => sum + Number((r as any).total_commission ?? 0) * CONFIG.POTENTIAL_COMMISSION_RATE, 0);
    const potential = confirmedCommission + potentialFromOthers;

    const ts = nowTimestamps();
    const meta = {
      version: 'v1',
      currency: CONFIG.CURRENCY,
      rounding: { money: 'rupees0', percent: '2dp' },
      clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH,
      generatedAt: ts.iso,
      generatedAtIST: ts.ist,
      timezone: ts.timezone,
    } as const;

    const body = {
      potentialCommission: Number(potential.toFixed(2)),
      pendingConfirmation: Math.round(pending),
      availableForPayment: Math.round(total - pending - paid),
      paidCommission: Math.round(paid),
      meta: { ...meta, range: used },
      ...(metaDebug ? { metaDebug } : {}),
    } as const;
    return new Response(JSON.stringify(ok(body)), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof SupabaseEnvError) {
      const mock = await import('@/mock-data/dashboard.json');
      return new Response(JSON.stringify({ success: true, data: mock.default.commission }), { headers: { 'Content-Type': 'application/json' } });
    }
    return fail(500, (e as Error)?.message || 'Unexpected error');
  }
}

