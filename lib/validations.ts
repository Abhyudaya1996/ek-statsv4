import { z } from 'zod';
import { STAGE_CODES, type StageCode } from './constants';

const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const StageCodeSchema = z.enum(
  (Object.values(STAGE_CODES).flat() as StageCode[]).map(c => c) as [StageCode, ...StageCode[]]
);

export const FiltersSchema = z.object({
  timeRange: z.object({
    start: z.string().regex(monthRegex),
    end: z.string().regex(monthRegex),
    preset: z.enum(['current_month', 'last_3_months', 'last_6_months', 'custom']).optional(),
  }),
  banks: z.array(z.string()).default([]),
  cards: z.array(z.string()).default([]),
  users: z.array(z.number().int().positive()).default([]),
  stages: z.array(StageCodeSchema).default([]),
  applicationQuality: z.array(z.string()).default([]),
  qualityStages: z.array(z.string()).default([]),
  search: z.string().optional().default(''),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type FilterOptions = z.infer<typeof FiltersSchema>;

export function sanitizeSearch(input: string | undefined): string {
  const s = (input ?? '').slice(0, 100);
  return s.replace(/[\n\r\t\0<>`"'\\]/g, ' ').trim();
}
