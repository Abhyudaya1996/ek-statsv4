"use client";
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchJson, fetchJsonWithMeta, serializeFilters } from '@/lib/api-helpers';
import type { FilterOptions } from '@/lib/validations';

function key(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

export function useDashboardKpis(filters: FilterOptions) {
  const qs = serializeFilters(filters ?? ({} as any));
  return useQuery({
    queryKey: ['dashboard', 'kpis', key(filters)],
    queryFn: () => fetchJson(`/api/v1/dashboard/kpis?filters=${qs}`),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCommission(filters: FilterOptions) {
  const qs = serializeFilters(filters ?? ({} as any));
  return useQuery({
    queryKey: ['dashboard', 'commission', key(filters)],
    queryFn: () => fetchJson(`/api/v1/dashboard/commission?filters=${qs}`),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFunnel(filters: FilterOptions) {
  const qs = serializeFilters(filters ?? ({} as any));
  return useQuery({
    queryKey: ['leads', 'funnel', key(filters)],
    queryFn: () => fetchJson(`/api/v1/leads/funnel?filters=${qs}`),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

type DetailedParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export function useDetailedLeads(filters: FilterOptions, params: DetailedParams) {
  const qs = serializeFilters(filters ?? ({} as any));
  const url = `/api/v1/leads/detailed?filters=${qs}&page=${params.page}&limit=${params.limit}` +
    (params.search ? `&search=${encodeURIComponent(params.search)}` : '') +
    (params.sortBy ? `&sortBy=${encodeURIComponent(params.sortBy)}` : '') +
    (params.sortOrder ? `&sortOrder=${params.sortOrder}` : '');

  return useQuery({
    queryKey: ['leads', 'detailed', key(filters), params.page, params.limit, params.search ?? '', params.sortBy ?? '', params.sortOrder ?? ''],
    queryFn: () => fetchJsonWithMeta(url),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    select: (payload: any) => payload, // keep data + meta
  });
}

export function useApprovalReport(filters: FilterOptions) {
  const qs = serializeFilters(filters ?? ({} as any));
  return useQuery({
    queryKey: ['reports', 'approval', key(filters)],
    queryFn: () => fetchJson(`/api/v1/reports/approval?filters=${qs}`),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRejectionReport(filters: FilterOptions) {
  const qs = serializeFilters(filters ?? ({} as any));
  return useQuery({
    queryKey: ['reports', 'rejection', key(filters)],
    queryFn: () => fetchJson(`/api/v1/reports/rejection?filters=${qs}`),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTimeline(
  view: 'month' | 'day',
  month: string,
  filters: FilterOptions,
  options?: { enabled?: boolean }
) {
  const qs = serializeFilters(filters);
  return useQuery({
    queryKey: ['analytics', 'timeline', view, month, key(filters)],
    queryFn: () => fetchJson(`/api/v1/analytics/timeline?view=${view}&month=${encodeURIComponent(month)}&filters=${qs}`, { timeoutMs: 10000 }),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    placeholderData: keepPreviousData,
  });
}

// Optional: stats hook that respects application-month vs custom range if needed elsewhere
export function useLeadStats(filters: FilterOptions) {
  // Reuse existing funnel/approval APIs depending on displayed stats; keeping a placeholder for future split.
  return useFunnel(filters);
}

