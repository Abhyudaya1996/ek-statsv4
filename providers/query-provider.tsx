"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => {
    if (queryClient) return queryClient;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes for dashboard
          gcTime: 10 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });
    return queryClient;
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

