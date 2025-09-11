import { getServerClient } from '@/lib/supabase';

let cached: 'application_date' | 'application_month' | null = null;

export async function resolveDateColumn(): Promise<'application_date' | 'application_month'> {
  if (cached) return cached;
  try {
    const supabase = getServerClient();
    // Probe for application_date first
    const probe = await (supabase
      .from('ek_applications_v')
      .select('application_date', { head: true, count: 'exact' }) as any);
    if (!probe.error) {
      cached = 'application_date';
      return cached;
    }
  } catch {}
  cached = 'application_month';
  return cached;
}



