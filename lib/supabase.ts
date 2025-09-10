import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export class SupabaseEnvError extends Error {
  constructor(message = 'Supabase env missing') {
    super(message);
    this.name = 'SupabaseEnvError';
  }
}

function hasEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function createStub(): SupabaseClient {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get() {
      throw new SupabaseEnvError();
    },
    apply() {
      throw new SupabaseEnvError();
    },
  };
  return new Proxy({}, handler) as unknown as SupabaseClient;
}

export function getBrowserClient(): SupabaseClient {
  if (!hasEnv()) return createStub();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}

export function getServerClient(): SupabaseClient {
  if (!hasEnv()) return createStub();
  const cookieStore = cookies();
  // Bind Next.js cookies so Supabase can read/write the auth session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  ) as unknown as SupabaseClient;
}

