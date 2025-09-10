export interface ApiMeta {
  version: 'v1';
  currency: 'INR';
  rounding: { money: 'rupees0' | 'rupees2'; percent: '2dp' };
  clampMonth: string;
  generatedAt: string;
  generatedAtIST: string;
  timezone: 'Asia/Kolkata';
  // Optional pagination fields for list endpoints
  page?: number;
  limit?: number;
  total?: number;
  // Optional range descriptor for aggregated endpoints
  range?: { startMonth: string; endMonth: string };
}

// Keep existing API success envelope while allowing strong typing of payload merged with meta at top-level of data
export type ApiResponse<T extends Record<string, any>> = {
  success: true;
  data: T;
  meta: ApiMeta;
} | {
  success: false;
  error: string;
  meta: ApiMeta;
};


