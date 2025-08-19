// mock-data/funnel-quality.ts
export type FunnelNode = {
  id: string;
  label: string;
  value: number;      // count
  percent: number;    // display percent (precomputed)
  parent?: string;    // for hierarchy/indent
};

// exact values
export const FUNNEL: FunnelNode[] = [
  { id: 'clicks',     label: 'Clicks',                    value: 60000, percent: 100 },
  { id: 'leads',      label: 'Leads',                     value: 5000,  percent: 100 },

  { id: 'incomplete', label: 'Incomplete Applications',   value: 1993,  percent: 39.03, parent: 'leads' },
  { id: 'kyc',        label: 'KYC',                       value: 106,   percent: 2.08,  parent: 'leads' },
  { id: 'kyc-done',   label: '— KYC Done',                value: 30,    percent: 28.30, parent: 'kyc'   },
  { id: 'kyc-pend',   label: '— KYC Pending',             value: 76,    percent: 71.70, parent: 'kyc'   },
  { id: 'verify',     label: 'Verification',              value: 41,    percent: 0.80,  parent: 'leads' },
  { id: 'reject',     label: 'Rejected',                  value: 1702,  percent: 33.33, parent: 'leads' },
  { id: 'expired',    label: 'Expired',                   value: 610,   percent: 11.95, parent: 'leads' },
  { id: 'approved',   label: 'Approved',                  value: 548,   percent: 10.73, parent: 'leads' },
];



// UI-oriented data for the horizontal bar flowchart
export const FUNNEL_BAR_DATA = [
  {
    id: 'clicks',
    label: 'Clicks',
    value: 60000,
    percent: 100.0,
    color: '#10B981',
  },
  {
    id: 'leads',
    label: 'Leads',
    value: 5000,
    percent: 100.0,
    color: '#10B981',
  },
  {
    id: 'incomplete',
    label: 'Incomplete Applications',
    value: 1990,
    percent: 39.8,
    color: '#F59E0B',
  },
  {
    id: 'kyc',
    label: 'KYC',
    value: 106,
    percent: 2.08,
    color: '#EF4444',
  },
  {
    id: 'kyc-done',
    label: 'KYC Done',
    value: 85,
    percent: 1.70,
    color: '#10B981',
    parent: 'kyc',
    isChild: true,
  },
  {
    id: 'kyc-pending',
    label: 'KYC Pending',
    value: 21,
    percent: 0.42,
    color: '#F59E0B',
    parent: 'kyc',
    isChild: true,
  },
  {
    id: 'verification',
    label: 'Verification',
    value: 41,
    percent: 0.80,
    color: '#8B5CF6',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    value: 17,
    percent: 0.33,
    color: '#EF4444',
  },
  {
    id: 'expired',
    label: 'Expired',
    value: 61,
    percent: 1.19,
    color: '#F59E0B',
  },
  {
    id: 'approved',
    label: 'Approved',
    value: 54,
    percent: 1.07,
    color: '#10B981',
  },
];

// Card-based conversion flow mock
export const conversionFlow = [
  {
    stage: 'Clicks',
    count: 60000,
    percentage: 100,
    baselinePercentage: 100,
    color: '#10B981',
    description: 'Total clicks from your content',
  },
  {
    stage: 'Leads',
    count: 5000,
    percentage: 8.33,
    baselinePercentage: 100,
    color: '#10B981',
    description: 'People who showed interest',
  },
  {
    stage: 'Incomplete Applications',
    count: 1990,
    percentage: 39.8,
    baselinePercentage: 40.0,
    color: '#F59E0B',
    description: "Started but didn't finish",
  },
  {
    stage: 'KYC',
    count: 106,
    percentage: 2.08,
    baselinePercentage: 2.08,
    color: '#10B981',
    description: 'Completed applications',
    breakdown: [
      { label: 'KYC Done', count: 85, percentage: 80.2, color: '#10B981' },
      { label: 'KYC Pending', count: 21, percentage: 19.8, color: '#F59E0B' },
    ],
  },
  {
    stage: 'Verification',
    count: 41,
    percentage: 0.82,
    color: '#8B5CF6',
    description: 'Identity verified',
  },
  {
    stage: 'Rejected',
    count: 17,
    percentage: 0.34,
    color: '#EF4444',
    description: 'Applications declined',
  },
  {
    stage: 'Approved',
    count: 54,
    percentage: 1.08,
    color: '#10B981',
    description: 'Successfully approved',
  },
];