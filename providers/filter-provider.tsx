"use client";
import React from 'react';
import { FiltersSchema, type FilterOptions } from '@/lib/validations';
import { getMonthsRange } from '@/lib/utils';
import { CONFIG } from '@/lib/config';

type TimePreset = 'current' | 'last3' | 'last6';

type FilterContextValue = {
  filters: FilterOptions;
  setTimePreset: (preset: TimePreset) => void;
  setCustomRange: (start: string, end: string) => void;
  setCustomDayRange: (from: string, to: string) => void;
  setBanks: (banks: string[]) => void;
  setCards: (cards: string[]) => void;
  setQuality: (q: string[]) => void;
  setSearch: (s: string) => void;
  validationError?: string;
};

export const FilterContext = React.createContext<FilterContextValue | undefined>(undefined);

const defaultFilters: FilterOptions = {
  timeRange: { start: CONFIG.CURRENT_DATA_MAX_MONTH, end: CONFIG.CURRENT_DATA_MAX_MONTH, preset: 'current_month' },
  banks: [],
  cards: [],
  users: [],
  stages: [],
  applicationQuality: [],
  qualityStages: [],
  search: '',
};

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<FilterOptions>(defaultFilters);
  const [validationError, setValidationError] = React.useState<string | undefined>(undefined);

  const setTimePreset = (preset: TimePreset) => {
    if (preset === 'current') {
      const m = CONFIG.CURRENT_DATA_MAX_MONTH;
      setFilters(f => ({ ...f, timeRange: { start: m, end: m, preset: 'current_month' } }));
    } else if (preset === 'last3') {
      const end = CONFIG.CURRENT_DATA_MAX_MONTH;
      const [ey, em] = end.split('-').map(Number);
      const startDate = new Date(ey, (em - 1) - (3 - 1), 1);
      const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      setFilters(f => ({ ...f, timeRange: { start, end, preset: 'last_3_months' } }));
    } else if (preset === 'last6') {
      const end = CONFIG.CURRENT_DATA_MAX_MONTH;
      const [ey, em] = end.split('-').map(Number);
      const startDate = new Date(ey, (em - 1) - (6 - 1), 1);
      const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      setFilters(f => ({ ...f, timeRange: { start, end, preset: 'last_6_months' } }));
    }
  };

  const setCustomRange = (start: string, end: string) => {
    const schema = FiltersSchema.shape.timeRange.pick({ start: true, end: true });
    const parsed = schema.safeParse({ start, end });
    if (!parsed.success) {
      setValidationError('Invalid date format. Use YYYY-MM.');
      return;
    }
    if (start > end) {
      setValidationError('Start must be before or equal to end.');
      return;
    }
    setValidationError(undefined);
    setFilters(f => ({ ...f, timeRange: { start, end, preset: 'custom' } }));
  };

  const setCustomDayRange = (from: string, to: string) => {
    const schema = (FiltersSchema.shape as any).customRange;
    const parsed = schema?.safeParse?.({ from, to });
    if (parsed && !parsed.success) {
      setValidationError('Invalid date format. Use YYYY-MM-DD.');
      return;
    }
    setValidationError(undefined);
    setFilters(f => ({ ...f, timeRange: { start: from.slice(0,7), end: to.slice(0,7), preset: 'custom' }, customRange: { from, to } as any }));
  };

  const setBanks = (banks: string[]) => setFilters(f => ({ ...f, banks }));
  const setCards = (cards: string[]) => setFilters(f => ({ ...f, cards }));
  const setQuality = (applicationQuality: string[]) => setFilters(f => ({ ...f, applicationQuality }));
  const setSearch = (search: string) => setFilters(f => ({ ...f, search }));

  const value: FilterContextValue = {
    filters,
    setTimePreset,
    setCustomRange,
    setCustomDayRange,
    setBanks,
    setCards,
    setQuality,
    setSearch,
    validationError,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

