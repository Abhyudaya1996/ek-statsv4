"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { formatPercentageSafe, formatCurrencyINR } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { KPICard } from '@/components/ui/kpi-card';
import { useFilters } from '@/hooks/use-filters';
import { useFunnel } from '@/hooks/use-leads';
import { BarChart3, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';

export default function FunnelPage() {
  const { filters } = useFilters();
  const q = useFunnel(filters as any);

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="kpi-card">
                <div className="skeleton h-4 w-24 mb-4" />
                <div className="skeleton h-9 w-32" />
              </div>
            ))}
          </div>
          <div className="card p-6">
            <div className="skeleton h-6 w-48 mb-4" />
            <div className="skeleton h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <EmptyState 
          title="Unable to load funnel data" 
          message={(q.error as Error)?.message ?? 'Please try again.'} 
          showRetry
        />
      </div>
    );
  }

  const { clicks, leads, stages, quality } = q.data as any;

  const approvalRate = Number(formatPercentageSafe(stages.approved, leads).replace('%', '')) || 0;
  const rejectionRate = Number(formatPercentageSafe(stages.rejected, leads).replace('%', '')) || 0;

  const FunnelBar = ({ 
    label, 
    value, 
    pct, 
    color, 
    isSubItem = false 
  }: { 
    label: string; 
    value: number; 
    pct: string; 
    color: string; 
    isSubItem?: boolean;
  }) => (
    <div className={`flex items-center ${isSubItem ? 'ml-8' : ''}`}>
      <div className="w-32 text-sm font-medium text-gray-700">{label}</div>
      <div className="flex-1 ml-4">
        <div className="w-full rounded-full bg-gray-100 overflow-hidden">
          <div 
            className={`funnel-bar h-10 rounded-full flex items-center px-4 text-white text-sm font-medium ${color}`}
            style={{ width: `${Math.max(5, Math.min(100, Number(pct.replace('%',''))))}%` }}
          >
            <span className="whitespace-nowrap">
              {value.toLocaleString()} {pct && `(${pct})`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <FilterBar />

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Lead Funnel Report</h1>
        <p className="text-gray-600 leading-relaxed">
          Gain insight into your lead conversion funnel. Track progression from clicks to approvals and identify bottlenecks.
        </p>
      </div>

      {/* Top KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={<Users className="w-5 h-5" />}
          title="Total Clicks"
          value={clicks}
          format="number"
          tooltip="Total number of clicks that generated leads"
        />
        <KPICard
          icon={<Target className="w-5 h-5" />}
          title="Total Leads"
          value={leads}
          format="number"
          tooltip="Total number of leads generated from clicks"
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Approval Rate"
          value={approvalRate}
          format="percentage"
          tooltip="Percentage of leads that have been approved"
        />
        <KPICard
          icon={<TrendingDown className="w-5 h-5" />}
          title="Rejection Rate"
          value={rejectionRate}
          format="percentage"
          tooltip="Percentage of leads that have been rejected"
        />
      </section>

      {/* Funnel Visualization */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lead Conversion Funnel</h2>
            <p className="text-sm text-gray-600">Visual representation of lead progression through stages</p>
          </div>
        </div>
        
        <div className="funnel-container">
          <div className="space-y-4">
            <FunnelBar 
              label="Clicks" 
              value={clicks} 
              pct="100%" 
              color="bg-blue-500 hover:bg-blue-600" 
            />
            <FunnelBar 
              label="Leads" 
              value={leads} 
              pct={formatPercentageSafe(leads, clicks)} 
              color="bg-emerald-500 hover:bg-emerald-600" 
            />
            <FunnelBar 
              label="├ Incomplete" 
              value={stages.incomplete} 
              pct={formatPercentageSafe(stages.incomplete, leads)} 
              color="bg-gray-400 hover:bg-gray-500" 
              isSubItem 
            />
            <FunnelBar 
              label="├ KYC" 
              value={stages.kyc} 
              pct={formatPercentageSafe(stages.kyc, leads)} 
              color="bg-amber-500 hover:bg-amber-600" 
              isSubItem 
            />
            <FunnelBar 
              label="├ Verification" 
              value={stages.verification} 
              pct={formatPercentageSafe(stages.verification, leads)} 
              color="bg-purple-500 hover:bg-purple-600" 
              isSubItem 
            />
            <FunnelBar 
              label="├ Cardouts" 
              value={stages.approved} 
              pct={formatPercentageSafe(stages.approved, leads)} 
              color="bg-emerald-600 hover:bg-emerald-700" 
              isSubItem 
            />
            <FunnelBar 
              label="├ Rejected" 
              value={stages.rejected} 
              pct={formatPercentageSafe(stages.rejected, leads)} 
              color="bg-red-500 hover:bg-red-600" 
              isSubItem 
            />
            <FunnelBar 
              label="└ Expired" 
              value={stages.expired} 
              pct={formatPercentageSafe(stages.expired, leads)} 
              color="bg-gray-500 hover:bg-gray-600" 
              isSubItem 
            />
          </div>
        </div>
      </section>

      {/* Quality Analysis */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quality Analysis</h2>
          <p className="text-sm text-gray-600">Performance breakdown by lead quality categories</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(quality ?? []).map((row: any, idx: number) => {
            const getQualityStyles = (label: string) => {
              switch (label) {
                case 'Good':
                  return {
                    border: 'border-emerald-200',
                    bg: 'bg-emerald-50',
                    badge: 'quality-badge good',
                    icon: '✓'
                  };
                case 'Avg':
                  return {
                    border: 'border-amber-200',
                    bg: 'bg-amber-50',
                    badge: 'quality-badge avg',
                    icon: '⚠'
                  };
                case 'Bad':
                  return {
                    border: 'border-red-200',
                    bg: 'bg-red-50',
                    badge: 'quality-badge bad',
                    icon: '✗'
                  };
                default:
                  return {
                    border: 'border-gray-200',
                    bg: 'bg-gray-50',
                    badge: 'quality-badge unknown',
                    icon: '?'
                  };
              }
            };

            const styles = getQualityStyles(row.label);

            return (
              <div key={idx} className={`card ${styles.border} ${styles.bg} p-6 fade-in`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{styles.icon}</span>
                    <span className={styles.badge}>{row.label ?? 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{row.leads ?? 0} leads</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Cardout Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {row.cardoutRate != null ? `${Number(row.cardoutRate).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Earnings</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrencyINR(row.earnings ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Rejections</p>
                      <p className="text-sm font-semibold text-gray-900">{row.rejections ?? 0}</p>
                    </div>
                  </div>
                  
                  {/* Progress bar for cardout rate */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Performance</span>
                      <span>{row.cardoutRate != null ? `${Number(row.cardoutRate).toFixed(1)}%` : '0%'}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          row.label === 'Good' ? 'bg-emerald-500' : 
                          row.label === 'Avg' ? 'bg-amber-500' : 
                          row.label === 'Bad' ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, row.cardoutRate ?? 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}