import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export class SupabaseEnvError extends Error {
  constructor(message = 'Supabase env missing') {
    super(message);
    this.name = 'SupabaseEnvError';
  }
}

function getServerEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

function hasPublicEnv() {
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
  if (!hasPublicEnv()) return createStub();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}

export function getServerClient(): SupabaseClient {
  const env = getServerEnv();
  if (!env) return createStub();
  const cookieStore = cookies();
  // Bind Next.js cookies so Supabase can read/write the auth session
  return createServerClient(
    env.url,
    env.anonKey,
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

export function serverHasEnv(): boolean {
  return getServerEnv() !== null;
}

