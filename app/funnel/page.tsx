"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
// import { EmptyState } from '@/components/ui/empty-state';
// import { useFilters } from '@/hooks/use-filters';
import QualityAnalysis from '@/components/quality/QualityAnalysis';
import { FunnelChart, type FunnelRow } from '@/components/charts/funnel-chart';

export default function FunnelPage() {
  const totalClicks = 60000; // 100%
  const leads = 5000; // 100% relative to leads

  const rows: FunnelRow[] = [
    { key: 'clicks', label: 'Clicks', count: totalClicks, pct: 100, color: '#14532d' },
    { key: 'leads', label: 'Leads', count: 5000, pct: 100, color: '#2563eb' },
    { key: 'incomplete', label: 'Incomplete Applications', count: 1993, pct: (1993 / leads) * 100, level: 1 },
    { key: 'kyc', label: 'KYC', count: 106, pct: (106 / leads) * 100, level: 1, color: '#0ea5e9' },
    { key: 'kyc_done', label: '—  KYC Done', count: 30, pct: (30 / 106) * 100, level: 2, color: '#16a34a' },
    { key: 'kyc_pending', label: '—  KYC Pending', count: 76, pct: (76 / 106) * 100, level: 2, color: '#eab308' },
    { key: 'verification', label: 'Verification', count: 41, pct: (41 / leads) * 100, level: 1 },
    { key: 'rejected', label: 'Rejected', count: 1702, pct: (1702 / leads) * 100, level: 1 },
    { key: 'expired', label: 'Expired', count: 610, pct: (610 / leads) * 100, level: 1 },
    { key: 'approved', label: 'Approved', count: 548, pct: (548 / leads) * 100, level: 1 },
  ];

  return (
    <>
      <FilterBar />

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">Lead Funnel Report</h1>
      <p className="mt-1 text-sm leading-5 text-gray-600">
        Gain insight into your lead conversion funnel. Track progression from clicks to approvals and identify bottlenecks.
      </p>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Lead Conversion Funnel</h2>
        <FunnelChart rows={rows} />
      </div>

      <div className="mt-6">
        <QualityAnalysis />
      </div>
    </>
  );
}
