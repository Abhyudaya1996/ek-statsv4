import { STAGE_CODES, type StageCode } from './constants';
import type { FilterOptions } from './validations';
import type { ApiMeta, ApiResponse as StrongApiResponse } from '@/lib/types/api';
import { CONFIG, nowTimestamps } from '@/lib/config';

export type ApiResponse<T extends Record<string, any>> = StrongApiResponse<T>;

export function buildMeta(overrides?: Partial<ApiMeta>): ApiMeta {
  const ts = nowTimestamps();
  return {
    version: 'v1',
    currency: 'INR',
    rounding: { money: 'rupees0', percent: '2dp' },
    clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH,
    generatedAt: ts.iso,
    generatedAtIST: ts.ist,
    timezone: ts.timezone,
    ...(overrides || {}),
  };
}

export function ok<T extends Record<string, any>>(data: T, metaOverrides?: Partial<ApiMeta>): ApiResponse<T> {
  return { success: true, data, meta: buildMeta(metaOverrides) } as const;
}

export function fail(code: number, message: string, details?: Record<string, unknown>): Response {
  const body = { success: false, error: message, meta: buildMeta(details as Partial<ApiMeta>) };
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

export async function fetchJson<T>(url: string, options?: { timeoutMs?: number }): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.max(3000, options?.timeoutMs ?? 12000));
  const res = await fetch(url, { cache: 'no-store', signal: controller.signal }).finally(() => clearTimeout(t));
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

// Variant that preserves meta and success wrapper for callers that need meta
export async function fetchJsonWithMeta<T = any>(url: string): Promise<{ success?: boolean; data: T; meta?: any }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  const res = await fetch(url, { cache: 'no-store', signal: controller.signal }).finally(() => clearTimeout(t));
  const contentType = res.headers.get('content-type') || '';
  const bodyText = await res.text();

  let payload: any = undefined;
  if (contentType.includes('application/json')) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      // fall through
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
    return payload as { success?: boolean; data: T; meta?: any };
  }

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
