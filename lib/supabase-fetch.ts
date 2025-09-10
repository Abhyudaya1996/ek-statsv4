import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchAllRows<T>(baseQuery: ReturnType<SupabaseClient['from']> & { range: (from: number, to: number) => any }): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const first = await (baseQuery as any).range(0, PAGE_SIZE - 1);
  if (first.error) throw first.error;
  let rows: T[] = (first.data ?? []) as T[];
  const total = first.count ?? rows.length;
  for (let offset = rows.length; offset < total; offset += PAGE_SIZE) {
    const { data, error } = await (baseQuery as any).range(offset, Math.min(offset + PAGE_SIZE - 1, total - 1));
    if (error) throw error;
    if (data && data.length) rows = rows.concat(data as T[]);
  }
  return rows;
}

/**
 * Converts month range (YYYY-MM) to [from, toExclusive] dates.
 * Uses first day of next month as exclusive upper bound to avoid invalid dates.
 */
export function monthRangeToDates(startMonth: string, endMonth: string): { from: string; to: string } {
  const from = `${startMonth}-01`;
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  const firstOfNextMonth = new Date(endYear, endMonthNum, 1);
  const to = firstOfNextMonth.toISOString().slice(0, 10);
  return { from, to };
}

/** Single-month variant returning [from, toExclusive] */
export function monthToDateRange(month: string): { from: string; to: string } {
  return monthRangeToDates(month, month);
}

/** Inclusive range helper if ever needed */
export function monthRangeToInclusiveDates(startMonth: string, endMonth: string): { from: string; to: string } {
  const from = `${startMonth}-01`;
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  const lastDay = new Date(endYear, endMonthNum, 0).getDate();
  const to = `${endMonth}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

