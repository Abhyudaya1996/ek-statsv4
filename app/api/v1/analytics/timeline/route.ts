import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-helpers';
import { FiltersSchema } from '@/lib/validations';
import mockData from '@/mock-data/timeline.json';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const view = (url.searchParams.get('view') || 'month') as 'month' | 'day';
    const month = (url.searchParams.get('month') || '').slice(0, 7);
    const filtersParam = url.searchParams.get('filters');

    // Validate filters for consistency with other endpoints (even though mock is returned)
    try {
      // Accept empty filters too
      if (filtersParam) FiltersSchema.parse(JSON.parse(filtersParam));
    } catch {
      return fail(400, 'Invalid filters');
    }

    const payload = mockData as any;

    if (view === 'day' && month && payload?.data?.days?.[month]) {
      return new Response(
        JSON.stringify({ success: true, data: { timeline: payload.data.days[month] }, meta: payload.meta }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Default monthly response
    return new Response(
      JSON.stringify({ success: true, data: { timeline: payload.data.months }, meta: payload.meta }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return fail(500, err?.message || 'Failed to load timeline');
  }
}


