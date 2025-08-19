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


