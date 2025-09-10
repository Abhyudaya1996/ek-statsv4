'use client';

import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { useFilters } from '@/hooks/use-filters';
import { useRejectionReport } from '@/hooks/use-leads';
import { AlertCircle, TrendingUp, XCircle, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

// Responsive hook for mobile/tablet/desktop breakpoints
function useResponsive() {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth || 0);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { isMobile: width < 640, isTablet: width >= 640 && width < 768, isDesktop: width >= 768 } as const;
}

type RejectionRow = { bank: string; total: number; rejected: number; rejectionRate: number };

function ResponsiveRejectionChart({ data }: { data: RejectionRow[] }) {
  const { isMobile, isTablet } = useResponsive();

  const config = React.useMemo(() => {
    const legendPosition: 'top' | 'bottom' = isMobile ? 'bottom' : 'top';
    return {
      heightClass: isMobile ? 'h-72' : isTablet ? 'h-72' : 'h-80',
      margins: { top: isMobile ? 12 : 20, right: isMobile ? 12 : 30, bottom: isMobile ? 32 : 20, left: isMobile ? 12 : 20 },
      barCategoryGap: isMobile ? '25%' : isTablet ? '28%' : '30%',
      barGap: isMobile ? 4 : 6,
      maxBarSize: isMobile ? 18 : isTablet ? 25 : 32,
      fontSize: { tick: isMobile ? 9 : isTablet ? 11 : 12, legend: isMobile ? 11 : 13, tooltip: isMobile ? 11 : 13 },
      xAxis: { tickMargin: isMobile ? 3 : 8, angle: (isMobile ? -35 : 0) as any, textAnchor: (isMobile ? 'end' : 'middle') as any, height: isMobile ? 50 : 35 },
      yAxisWidth: { left: isMobile ? 25 : 35, right: isMobile ? 25 : 30 },
      line: { strokeWidth: isMobile ? 2 : 2.5, dotRadius: isMobile ? 3 : 4, activeDotRadius: isMobile ? 4 : 5 },
      legend: { height: isMobile ? 28 : 35, padding: 6, position: legendPosition },
    };
  }, [isMobile, isTablet]);

  return (
    <div className={`w-full ${config.heightClass} min-h-0`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={config.margins as any} barCategoryGap={config.barCategoryGap as any} barGap={config.barGap as any}>
          <CartesianGrid strokeDasharray="2 2" opacity={0.4} />
          <XAxis dataKey="bank" tickMargin={config.xAxis.tickMargin} tick={{ fontSize: config.fontSize.tick, fill: '#6B7280' }} interval={0} angle={config.xAxis.angle} textAnchor={config.xAxis.textAnchor} height={config.xAxis.height} axisLine={{ stroke: '#D1D5DB' }} />
          <YAxis yAxisId="left" tick={{ fontSize: config.fontSize.tick, fill: '#6B7280' }} width={config.yAxisWidth.left} axisLine={{ stroke: '#D1D5DB' }} label={isMobile ? undefined : { value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: config.fontSize.tick } } as any} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: config.fontSize.tick, fill: '#6B7280' }} width={config.yAxisWidth.right} axisLine={{ stroke: '#D1D5DB' }} label={isMobile ? undefined : { value: 'Rejection Rate %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: config.fontSize.tick } } as any} />
          <Tooltip contentStyle={{ fontSize: `${config.fontSize.tooltip}px`, padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 600, marginBottom: '4px' }} formatter={(v: any, name: string) => [name === 'rejectionRate' ? `${v}%` : v, name === 'rejectionRate' ? 'Rejection Rate' : name === 'total' ? 'Total Leads' : 'Rejected']} />
          <Legend 
            verticalAlign={config.legend.position}
            height={config.legend.height} 
            wrapperStyle={{ 
              paddingTop: config.legend.position === 'bottom' ? 6 : 0, 
              paddingBottom: config.legend.position === 'top' ? 6 : 0, 
              fontSize: config.fontSize.legend, fontWeight: 500 
            } as any} 
            iconType="rect" 
          />
          <Bar yAxisId="left" dataKey="total" name="Total Leads" fill="#60A5FA" maxBarSize={config.maxBarSize} radius={[1,1,0,0]} stroke="#3B82F6" strokeWidth={0.5} />
          <Bar yAxisId="left" dataKey="rejected" name="Rejected" fill="#EF4444" maxBarSize={config.maxBarSize} radius={[1,1,0,0]} stroke="#DC2626" strokeWidth={0.5} />
          <Line yAxisId="right" type="monotone" dataKey="rejectionRate" name="Rejection Rate %" stroke="#F59E0B" strokeWidth={config.line.strokeWidth} dot={{ r: config.line.dotRadius, fill: '#F59E0B', stroke: '#D97706', strokeWidth: 1 }} activeDot={{ r: config.line.activeDotRadius, fill: '#D97706', stroke: '#92400E', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RejectionReport() {
  const { filters } = useFilters();
  const q = useRejectionReport(filters) as any;

  type Kpis = { totalRejections: number; topReason: string; rejectionRate: number; worstBank: string };
  type Bank = { bank: string; total: number; rejected: number; rate?: number };
  type Reason = { category: string; reason: string; count: number; pctOfTotal: number };

  const kpis: Kpis = (q?.data?.kpis as Kpis) ?? { totalRejections: 0, topReason: '—', rejectionRate: 0, worstBank: '—' };
  const bankData: Array<{ bank: string; rejected: number; total: number; rejectionRate: number }> = ((q?.data?.banks as Bank[]) ?? []).map((b) => ({ bank: b.bank, rejected: Number(b.rejected ?? 0), total: Number(b.total ?? 0), rejectionRate: Number(b.rate ?? ((Number(b.rejected ?? 0) / Math.max(1, Number(b.total ?? 0))) * 100)) }));
  const reasons: Array<{ category: string; reason: string; count: number; percentage: number }> = ((q?.data?.reasons as Reason[]) ?? []).map((r) => ({ category: r.category, reason: r.reason, count: Number(r.count ?? 0), percentage: Number(r.pctOfTotal ?? 0) }));

  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  // Derive quality per bank using rejection rate; add lead mix
  const banksWithQuality = bankData.map((b: { bank: string; total: number; rejected: number; rejectionRate: number }) => {
    const approvals = Math.max(0, (b.total ?? 0) - (b.rejected ?? 0));
    const rejectionRate = typeof b.rejectionRate === 'number' ? b.rejectionRate : (Math.max(0, b.rejected ?? 0) / Math.max(1, b.total)) * 100;
    let quality: 'Good' | 'Avg' | 'Bad' | 'Unknown';
    if (!b.total) quality = 'Unknown';
    else if (rejectionRate < 25) quality = 'Good';
    else if (rejectionRate < 50) quality = 'Avg';
    else quality = 'Bad';
    return { ...b, approvals, rejectionRate, quality };
  });
  const [qualityFilter, setQualityFilter] = React.useState<'all' | 'Good' | 'Avg' | 'Bad' | 'Unknown'>('all');
  const filteredBanks = React.useMemo(() => (
    qualityFilter === 'all' ? banksWithQuality : banksWithQuality.filter(b => b.quality === qualityFilter)
  ), [banksWithQuality, qualityFilter]);

  if (q.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <FilterBar />
        <div className="px-4 py-6 space-y-4">
          <div className="skeleton h-8 w-40" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl bg-white p-4 shadow-sm"><div className="skeleton h-16" /></div>)}
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="skeleton h-64" /></div>
        </div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <FilterBar />
        <div className="px-4 py-6">
          <p className="text-sm text-red-600">Failed to load rejection report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <FilterBar />
      <div className="px-4 py-6">
        <h1 className="mb-1 text-lg font-bold text-gray-900 md:text-xl">Lead Rejection Report</h1>
        <p className="mb-4 text-sm leading-5 text-gray-600">
          Understand lead rejection patterns — identify trends and reduce rejects by focusing on key categories.
        </p>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Rejection Report</h1>

        {/* Time chips are already provided by FilterBar at the top */}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <XCircle className="h-8 w-8 text-red-500" />
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xs text-gray-500">Total Rejections</p>
            <p className="text-xl font-bold text-gray-900">{kpis.totalRejections}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <AlertCircle className="mb-2 h-8 w-8 text-orange-500" />
            <p className="text-xs text-gray-500">Top Reason</p>
            <p className="text-sm font-bold text-gray-900">{kpis.topReason}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Rejection Rate</p>
            <p className="text-xl font-bold text-red-600">{kpis.rejectionRate}%</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Bank with Most Rejects</p>
            <p className="text-lg font-bold text-gray-900">{kpis.worstBank}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Leads vs Rejected (by Bank)</h2>
          <ResponsiveRejectionChart data={banksWithQuality.map(b => ({ bank: b.bank, total: b.total, rejected: b.rejected, rejectionRate: Number(b.rejectionRate?.toFixed ? b.rejectionRate.toFixed(1) : b.rejectionRate) }))} />

          {/* Quality table */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bank quality overview</h3>
              <label className="text-sm text-gray-600 inline-flex items-center gap-2">
                Quality
                <select value={qualityFilter} onChange={(e)=> setQualityFilter(e.target.value as any)} className="rounded border px-2 py-1 text-sm">
                  <option value="all">All</option>
                  <option value="Good">Good</option>
                  <option value="Avg">Avg</option>
                  <option value="Bad">Bad</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto pb-1">
              <table className="w-full text-sm align-middle">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">Bank</th>
                    <th className="px-3 py-2 text-right">Leads</th>
                    <th className="px-3 py-2 text-right">Rejected</th>
                    <th className="px-3 py-2 text-right">Rejection Rate</th>
                    <th className="px-3 py-2 text-right">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanks.map((b) => (
                    <tr 
                      key={b.bank}
                      onClick={() => {
                        // Future: Navigate to bank rejection detail view
                        console.log('Bank clicked:', b.bank);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          console.log('Bank selected:', b.bank);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
                    >
                      <td className="px-3 py-2">{b.bank}</td>
                      <td className="px-3 py-2 text-right">{b.total}</td>
                      <td className="px-3 py-2 text-right">{b.rejected}</td>
                      <td className="px-3 py-2 text-right">{b.rejectionRate.toFixed(1)}%</td>
                      <td className={`px-3 py-2 text-right font-semibold ${b.quality==='Bad'?'text-red-600': b.quality==='Avg'?'text-amber-600': b.quality==='Good'?'text-emerald-600':'text-gray-600'}`}>{b.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reasons - mobile-friendly, tappable rows */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">Rejection Analysis</h2>
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y">
            {reasons.map((reason: { category: string; reason: string; count: number; percentage: number }, i: number) => {
              const isOpen = openIdx === i;
              return (
                <button
                  key={i}
                  className="w-full px-4 py-3 text-left tap-anim"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${reason.category === 'Policy' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{reason.category}</span>
                      <span className="text-sm font-medium text-gray-900">{reason.reason}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{reason.count}</p>
                      <p className="text-xs text-red-600">{Number(reason.percentage ?? 0).toFixed(1)}%</p>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
                      Tap insights: This category represents {Number(reason.percentage ?? 0).toFixed(1)}% of total leads. Focus on documentation and policy alignment to reduce rejects.
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
