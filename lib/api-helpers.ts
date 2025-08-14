import { STAGE_CODES, type StageCode } from './constants';
import type { FilterOptions } from './validations';

export type ApiResponse<T> = { success: true; data: T; meta?: Record<string, unknown> } | { success: false; error: string; meta?: Record<string, unknown> };

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { success: true, data, ...(meta ? { meta } : {}) } as const;
}

export function fail(code: number, message: string, details?: Record<string, unknown>): Response {
  const body = { success: false, error: message, ...(details ? { meta: details } : {}) };
  return new Response(JSON.stringify(body), { status: code, headers: { 'Content-Type': 'application/json' } });
}

export function safePct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function mapStageBucket(code: StageCode): keyof typeof STAGE_CODES | 'UNKNOWN' {
  for (const [bucket, codes] of Object.entries(STAGE_CODES)) {
    if ((codes as readonly string[]).includes(code)) return bucket as keyof typeof STAGE_CODES;
  }
  return 'UNKNOWN';
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  const contentType = res.headers.get('content-type') || '';
  const bodyText = await res.text();

  // Try to parse JSON when appropriate; otherwise keep raw text
  let payload: any = undefined;
  if (contentType.includes('application/json')) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      // fall through; will treat as unexpected
    }
  }

  if (!res.ok) {
    const message = payload?.error || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  if (payload && payload.success === false) {
    throw new Error(payload.error || 'Unknown error');
  }

  if (payload !== undefined) {
    return (payload.data ?? payload) as T;
  }

  // Non-JSON successful response (unexpected for our API)
  throw new Error('Unexpected non-JSON response');
}

function sortArray<T>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
}

export function serializeFilters(filters: FilterOptions): string {
  const normalized = {
    timeRange: filters.timeRange,
    banks: sortArray(filters.banks),
    cards: sortArray(filters.cards),
    users: sortArray(filters.users),
    stages: sortArray(filters.stages as unknown as string[]),
    applicationQuality: sortArray(filters.applicationQuality),
    qualityStages: sortArray((filters as any).qualityStages ?? []),
    search: filters.search ?? '',
  };
  return encodeURIComponent(JSON.stringify(normalized));
}
