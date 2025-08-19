"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
// import { EmptyState } from '@/components/ui/empty-state';
// import { useFilters } from '@/hooks/use-filters';
import QualityAnalysis from '@/components/quality/QualityAnalysis';
import FunnelV2Root from '@/components/charts/FunnelV2Root';

export default function FunnelPage() {
  

  return (
    <>
      <FilterBar />

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">Lead Funnel Report</h1>
      <p className="mt-1 text-sm leading-5 text-gray-600">
        Gain insight into your lead conversion funnel. Track progression from clicks to approvals and identify bottlenecks.
      </p>

      <section className="mt-4">
        <FunnelV2Root />
      </section>

      <div className="mt-6">
        <QualityAnalysis />
      </div>
    </>
  );
}
