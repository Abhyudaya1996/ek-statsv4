import { format } from 'date-fns';

export function formatNumberIN(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentageSafe(
  numerator: number | null | undefined,
  denominator: number | null | undefined
): string {
  if (!denominator || denominator === 0 || numerator == null) return '—';
  const value = (numerator / denominator) * 100;
  return `${value.toFixed(1)}%`;
}

export function formatDisplayDateDDMMYYYY(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd-MM-yyyy');
}

export function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getMonthsRange(months: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);
  const endMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;
  const startMonth = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  return { start: startMonth, end: endMonth };
}

