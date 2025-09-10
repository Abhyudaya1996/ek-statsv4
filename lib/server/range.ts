import { CONFIG } from '@/lib/config';
import { getServerClient } from '@/lib/supabase';

function addMonths(yyyymm: string, delta: number): string {
  const [y, m] = yyyymm.split('-').map(Number);
  const d = new Date(y, (m - 1) + delta, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

export const monthStartIso = (m: string) => `${m}-01`;

export function nextMonthStartIso(m: string): string {
  const [y, mth] = m.split('-').map(Number);
  const d = new Date(y, (mth - 1) + 1, 1);
  return d.toISOString().slice(0, 10);
}

export type Filters = { timeRange?: { start?: string; end?: string } } | undefined;

/** Always returns a valid [startMonth, endMonth] within the clamp. */
export function deriveMonthRange(incoming?: Filters): { startMonth: string; endMonth: string } {
  const clamp = CONFIG.CURRENT_DATA_MAX_MONTH;
  let end = (incoming?.timeRange?.end as string | undefined) || clamp;
  if (end > clamp) end = clamp;

  let start = (incoming?.timeRange?.start as string | undefined) || addMonths(end, -5);
  if (start > end) start = end;

  return { startMonth: start, endMonth: end };
}

/** DB-aware clamp: fallback to latest available month if env clamp not set. */
export async function deriveMonthRangeAsync(incoming?: Filters): Promise<{ startMonth: string; endMonth: string; clampMonth: string }> {
  let clamp = CONFIG.CURRENT_DATA_MAX_MONTH;
  try {
    if (!clamp) {
      const supabase = getServerClient();
      const { data, error } = await supabase
        .from('ek_applications_v')
        .select('application_month')
        .order('application_month', { ascending: false })
        .limit(1);
      if (!error && data && data.length) clamp = (data[0] as any).application_month as string;
    }
  } catch {}
  const base = deriveMonthRange(incoming);
  const end = base.endMonth > clamp ? clamp : base.endMonth;
  const start = base.startMonth > end ? end : base.startMonth;
  return { startMonth: start, endMonth: end, clampMonth: clamp };
}

export function readFilters(searchParams: URLSearchParams): Filters {
  const raw = searchParams.get('filters');
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
}

export function enumerateMonths(startMonth: string, endMonth: string): string[] {
  const out: string[] = [];
  const [sy, sm] = startMonth.split('-').map(Number);
  const [ey, em] = endMonth.split('-').map(Number);
  let cur = new Date(sy, sm - 1, 1);
  const end = new Date(ey, em - 1, 1);
  while (cur <= end) {
    out.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return out;
}

// Generic fallback helper for single-month empty windows
export async function fetchWithFallback<T>(
  fetcher: (fromIso: string, toIso: string) => Promise<{ rows: T[]; count: number }>,
  incoming?: Filters
) {
  const { startMonth, endMonth } = deriveMonthRange(incoming);
  let from = monthStartIso(startMonth);
  let to = nextMonthStartIso(endMonth);

  let { rows, count } = await fetcher(from, to);
  if (count > 0) return { rows, from, to, used: { startMonth, endMonth } } as const;

  if (startMonth === endMonth) {
    const prev = addMonths(startMonth, -1);
    const fromPrev = monthStartIso(prev);
    const toPrev = nextMonthStartIso(prev);
    const r2 = await fetcher(fromPrev, toPrev);
    return { rows: r2.rows, from: fromPrev, to: toPrev, used: { startMonth: prev, endMonth: prev } } as const;
  }

  return { rows, from, to, used: { startMonth, endMonth } } as const;
}


