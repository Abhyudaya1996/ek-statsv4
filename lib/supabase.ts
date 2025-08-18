import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}

