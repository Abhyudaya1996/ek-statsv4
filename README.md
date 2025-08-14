# EK Stats V4

See `docs/PRD_updated.md` for product requirements (v4.1).

## Local development (when you're ready)
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open `http://localhost:3000`

- Env: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- Optional: `NEXT_PUBLIC_POTENTIAL_RATE` (default 0.10)

## MOCK / REAL toggle
- Default mock mode: `USE_MOCK=1` or leave Supabase env unset.
- Real mode: create `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL=`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
  - `USE_MOCK=0`
- Restart `npm run dev` after changing env.

## Mock-first routes
- `/` Dashboard: 4 KPI cards + commission donut from `mock-data/dashboard.json` (loading/empty/error states)
- `/funnel`: Horizontal funnel, Quality Analysis table, insights from `mock-data/funnel.json`
- `/leads/detailed`: Search (debounced), tabs, pagination, export stubs from `mock-data/leads.json`
- `/reports/approval`: KPIs + combo chart + sortable table from `mock-data/reports_approval.json`
- `/reports/rejection`: KPIs + bank-wise chart + reasons table from `mock-data/reports_rejection.json`
- `/analytics/timeline`: Month table → day drill with numbers/% toggle from `mock-data/timeline.json`

Phase 2 will wire these to `/api/v1/*` per `tasks.txt`.
