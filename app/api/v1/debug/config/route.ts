import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-helpers';
import { CONFIG } from '@/lib/config';

export async function GET(_req: NextRequest) {
  try {
    const payload = {
      server: {
        clampMonth: CONFIG.CURRENT_DATA_MAX_MONTH,
        currency: CONFIG.CURRENCY,
        env: {
          NEXT_PUBLIC_CURRENT_DATA_MAX_MONTH: process.env.NEXT_PUBLIC_CURRENT_DATA_MAX_MONTH ?? null,
          CURRENT_DATA_MAX_MONTH: process.env.CURRENT_DATA_MAX_MONTH ?? null,
          USE_MOCK: process.env.USE_MOCK ?? null,
        },
      },
    } as const;

    return new Response(
      JSON.stringify(ok(payload)),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return fail(500, 'Unexpected error');
  }
}


