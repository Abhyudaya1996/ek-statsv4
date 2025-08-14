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
  const handler: ProxyHandler<any> = {
    get() {
      throw new SupabaseEnvError();
    },
    apply() {
      throw new SupabaseEnvError();
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as any, handler) as unknown as SupabaseClient;
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

