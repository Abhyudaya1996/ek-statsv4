"use client";
import React from 'react';
import { CommissionChart } from '@/components/charts/commission-chart';
import { FilterBar } from '@/components/filters/filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { KPICard } from '@/components/ui/kpi-card';
import { useFilters } from '@/hooks/use-filters';
import { useDashboardKpis, useCommission } from '@/hooks/use-leads';
import { Users, IndianRupee, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function Page() {
  const { filters } = useFilters();
  const kpisQ = useDashboardKpis(filters as any);
  const commissionQ = useCommission(filters as any);

  const isLoading = kpisQ.isLoading || commissionQ.isLoading;
  const isError = kpisQ.isError || commissionQ.isError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="kpi-card">
                <div className="skeleton h-4 w-24 mb-4" />
                <div className="skeleton h-9 w-32" />
              </div>
            ))}
          </div>
          <div className="card p-6">
            <div className="skeleton h-6 w-48 mb-4" />
            <div className="skeleton h-[300px] md:h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !kpisQ.data || !commissionQ.data) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <EmptyState 
          title="Unable to load dashboard data" 
          message={(kpisQ.error || commissionQ.error)?.message ?? 'Please try again later.'} 
          showRetry
        />
      </div>
    );
  }

  const k = (kpisQ.data as any) ?? {};
  const c = (commissionQ.data as any) ?? {};

  return (
    <div className="space-y-6">
      <FilterBar />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">EK Stats Dashboard</h1>
        <p className="text-gray-600 leading-relaxed">
          Lead Management & Analytics Platform. Unlock the power of smart analytics to drive better lead
          performance and make informed, data‑driven decisions.
        </p>
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          emphasis 
          icon={<Users className="w-5 h-5" />}
          title="Total Leads" 
          value={k.totalLeads ?? 0} 
          format="number"
          tooltip="Total number of leads in the selected time period"
          trend={{ direction: 'up', percentage: 12.5, period: 'vs last month' }}
        />
        <KPICard 
          emphasis 
          icon={<IndianRupee className="w-5 h-5" />}
          title="Potential Commission" 
          value={k.potentialCommission ?? 0} 
          format="currency"
          tooltip="Estimated commission based on current lead performance"
          trend={{ direction: 'up', percentage: 8.3, period: 'vs last month' }}
        />
        <KPICard 
          icon={<TrendingUp className="w-5 h-5" />}
          title="Approval Rate" 
          value={k.approvalRate ?? 0} 
          format="percentage"
          tooltip="Percentage of leads that have been approved"
          trend={{ direction: 'down', percentage: 2.1, period: 'vs last month' }}
        />
        <KPICard 
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Incomplete" 
          value={k.incomplete ?? 0} 
          format="number"
          tooltip="Number of leads with incomplete applications"
          trend={{ direction: 'neutral', percentage: 0.5, period: 'vs last month' }}
        />
      </section>

      {/* Commission Breakdown */}
      <section>
        <CommissionChart data={c} title="Commission Breakdown" />
      </section>

      {/* Recent Activity */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600">Latest updates on your leads</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { id: 4503, bank: 'HDFC Bank', card: 'Regalia', amount: 1300, time: '10 mins ago' },
            { id: 4502, bank: 'Axis Bank', card: 'Magnus', amount: 1200, time: '25 mins ago' },
            { id: 4501, bank: 'ICICI Bank', card: 'Sapphiro', amount: 1100, time: '1 hour ago' }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lead #{item.id} Approved</p>
                  <p className="text-xs text-gray-500">{item.bank} - {item.card}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-600">+₹{item.amount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}