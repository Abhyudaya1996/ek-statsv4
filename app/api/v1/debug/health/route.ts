import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-helpers';
import { getServerClient, serverHasEnv, SupabaseEnvError } from '@/lib/supabase';
import { resolveDateColumn } from '@/lib/server/date-column';

export async function GET(_req: NextRequest) {
  try {
    const envOk = serverHasEnv();
    if (!envOk) {
      return new Response(
        JSON.stringify({ success: true, data: { envOk: false, reason: 'missing_env' } }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    const supabase = getServerClient();
    // Tiny metadata probe: fetch 0 rows quickly; table name is arbitrary but present in our queries
    const dateCol = await resolveDateColumn();
    const { error } = await (supabase
      .from('ek_applications_v')
      .select(dateCol, { count: 'exact', head: true }) as any);
    if (error) {
      return new Response(
        JSON.stringify({ success: true, data: { envOk: true, dbOk: false, error: error.message } }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ success: true, data: { envOk: true, dbOk: true, dateCol } }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    if (e instanceof SupabaseEnvError) {
      return new Response(
        JSON.stringify({ success: true, data: { envOk: false, reason: 'supabase_env' } }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    return fail(500, e?.message || 'health_error');
  }
}


