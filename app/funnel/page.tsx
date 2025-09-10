"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { useFilters } from '@/hooks/use-filters';
import { useFunnel } from '@/hooks/use-leads';
import ConversionFlowCards, { type ConversionStage } from '@/components/charts/ConversionFlowCards';
import QualityAnalysis from '@/components/quality/QualityAnalysis';
// import { conversionFlow } from '@/mock-data/funnel-quality';

export default function FunnelPage() {
  const { filters } = useFilters();
  const funnelQ = useFunnel(filters as any);

  const d: any = funnelQ.data ?? {};
  const stages: ConversionStage[] = [
    {
      stage: 'Clicks',
      count: Number(d.clicks ?? 0),
      percentage: 100,
      color: '#2563eb',
      description: 'Total clicks from your content',
    },
    {
      stage: 'Leads',
      count: Number(d.leads ?? 0),
      percentage: Number(d.clicks ? ((d.leads ?? 0) / d.clicks) * 100 : 0),
      color: '#16a34a',
      description: 'Users who submitted an application with the bank.',
    },
    {
      stage: 'Incomplete Applications',
      count: Number(d.stages?.incomplete ?? 0),
      percentage: Number(d.leads ? ((d.stages?.incomplete ?? 0) / d.leads) * 100 : 0),
      color: '#f59e0b',
      description: 'Users who started the form but dropped off.',
    },
    {
      stage: 'KYC',
      count: Number(d.stages?.kyc ?? 0),
      percentage: Number(d.leads ? ((d.stages?.kyc ?? 0) / d.leads) * 100 : 0),
      color: '#06b6d4',
      description: 'Applicants currently at the KYC stage.',
    },
    {
      stage: 'Verification',
      count: Number(d.stages?.verification ?? 0),
      percentage: Number(d.leads ? ((d.stages?.verification ?? 0) / d.leads) * 100 : 0),
      color: '#a855f7',
      description: 'Bank is verifying documents/KYC — final decision pending.',
    },
    {
      stage: 'Approved',
      count: Number(d.stages?.approved ?? 0),
      percentage: Number(d.leads ? ((d.stages?.approved ?? 0) / d.leads) * 100 : 0),
      color: '#22c55e',
      description: 'Successfully approved.',
    },
    {
      stage: 'Rejected',
      count: Number(d.stages?.rejected ?? 0),
      percentage: Number(d.leads ? ((d.stages?.rejected ?? 0) / d.leads) * 100 : 0),
      color: '#ef4444',
      description: 'Applications declined.',
    },
  ];

  return (
    <>
      <FilterBar />

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">Lead Funnel Report</h1>
      <p className="mt-1 text-sm leading-5 text-gray-600">
        Gain insight into your lead conversion funnel. Track progression from clicks to approvals and identify bottlenecks.
      </p>

      <section className="mt-4">
        <ConversionFlowCards data={stages} />
      </section>

      <div className="mt-6">
        <QualityAnalysis />
      </div>
    </>
  );
}
