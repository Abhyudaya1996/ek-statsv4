"use client";
import { useQuery } from '@tanstack/react-query';

export function useQuality(filters?: unknown) {
  const params = filters ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : '';
  return useQuery({
    queryKey: ['quality', filters],
    queryFn: async () => {
      const res = await fetch(`/api/v1/leads/quality${params}`, { cache: 'no-store' });
      const json = await res.json();
      return json?.data ?? json;
    },
  });
}




