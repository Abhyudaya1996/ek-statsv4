"use client";
import React from 'react';
import { CommissionChart } from '@/components/charts/commission-chart';
import { CommissionKpiCards } from '@/components/dashboard/CommissionKpiCards';
import { FilterBar } from '@/components/filters/filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { useFilters } from '@/hooks/use-filters';
import { useDashboardKpis, useCommission } from '@/hooks/use-leads';
import { Users, IndianRupee, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Page() {
  const { filters } = useFilters();
  const kpisQ = useDashboardKpis(filters as any);
  const commissionQ = useCommission(filters as any);

  const isLoading = kpisQ.isLoading || commissionQ.isLoading;
  const isError = kpisQ.isError || commissionQ.isError;

  if (isLoading) {
    return (
      <>
        <FilterBar />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="mt-6 h-[300px] md:h-[400px] animate-pulse rounded-xl bg-gray-200" />
      </>
    );
  }

  if (isError || !kpisQ.data || !commissionQ.data) {
    return <EmptyState title="Unable to load data" message={(kpisQ.error || commissionQ.error)?.message ?? 'Please try again later.'} />;
  }

  const k = (kpisQ.data as any) ?? {};
  const c = (commissionQ.data as any) ?? {};

  const KPI = ({ bg, Icon, title, value, trend, emphasis = false }: { bg: string; Icon: any; title: string; value: string; trend?: string; emphasis?: boolean }) => (
    <div className={`flex items-center space-x-4 rounded-xl border border-gray-200 ${emphasis ? 'bg-emerald-50' : 'bg-white'} p-4 shadow-sm tap-anim`}>
      <div className="flex-shrink-0">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-500">{title}</p>
        <p className={`truncate ${emphasis ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900`}>{value}</p>
        {trend && (
          <p className="flex items-center text-xs text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" /> {trend}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <FilterBar />

      <h1 className="mt-2 text-lg font-bold text-gray-900 md:text-xl">EK Stats Dashboard</h1>
      <p className="mt-1 text-sm leading-5 text-gray-600">
        <strong>Track Leads & Commission Analytics</strong>
      </p>

      {/* KPI Grid - upgraded commission metrics */}
      <div className="mt-3">
        <CommissionKpiCards />
      </div>

      {/* Commission Breakdown */}
      <section className="mt-6">
        <CommissionChart data={c} title="Commission Breakdown" />
      </section>

      {/* Recent Activity (static sample) */}
      <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Lead #{4500 + i} Approved</p>
                  <p className="text-xs text-gray-500">HDFC Bank - Regalia</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">+₹{(1000 + i * 100).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">10 mins ago</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
