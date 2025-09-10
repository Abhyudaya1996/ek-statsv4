const coerceMonth = (raw: string | undefined, fallback: string): string => {
  const v = (raw ?? fallback).slice(0, 7);
  return /^\d{4}-\d{2}$/.test(v) ? v : fallback.slice(0, 7);
};

const now = new Date();
const NOW_YYYY_MM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const CONFIG = {
  USE_MOCK: process.env.USE_MOCK === '1',
  POTENTIAL_COMMISSION_RATE: Number(process.env.POTENTIAL_COMMISSION_RATE ?? 0.1),
  IS_MOCK_MODE:
    process.env.USE_MOCK === '1' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // HARDCODED to August until env issue resolved
  CURRENT_DATA_MAX_MONTH: '2025-08',
  CURRENCY: 'INR',
} as const;

export const monthStartIso = (ym: string) => `${ym}-01`;
export const nextMonthStartIso = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 1).toISOString().slice(0, 10);
};
export const clampEndMonth = (ym: string) =>
  ym > CONFIG.CURRENT_DATA_MAX_MONTH ? CONFIG.CURRENT_DATA_MAX_MONTH : ym;

export const nowTimestamps = () => {
  const iso = new Date().toISOString();
  const ist = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(new Date());
  return { iso, ist, timezone: 'Asia/Kolkata' as const };
};

// Log clamp once on server to verify env pickup
if (typeof window === 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[CONFIG] clampMonth =', CONFIG.CURRENT_DATA_MAX_MONTH);
}


