"use client";
import React from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

export type BankPerfRow = { bank: string; total: number; approved: number; rate: number; avgDays?: number };

// Responsive breakpoint hook (avoids SSR hydration issues by reading on effect)
function useResponsive() {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth || 0);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 768;
  const isDesktop = width >= 768;
  return { isMobile, isTablet, isDesktop } as const;
}

export function BankPerformanceChart({ data, title = 'Bank Performance' }: { data: BankPerfRow[]; title?: string }) {
  const { isMobile, isTablet } = useResponsive();
  const alt = `${title}: ` + data.map(d => `${d.bank} total ${d.total}, approved ${d.approved}, rate ${d.rate}%`).join('; ');

  // Responsive config derived from breakpoints
  const config = React.useMemo(() => ({
    heightClass: isMobile ? 'h-64' : isTablet ? 'h-72' : 'h-80',
    margins: {
      top: 20,
      right: isMobile ? 15 : 30,
      bottom: isMobile ? 25 : 20,
      left: isMobile ? 15 : 20,
    },
    barCategoryGap: isMobile ? '15%' : isTablet ? '25%' : '30%',
    barGap: isMobile ? 3 : 6,
    maxBarSize: isMobile ? 18 : isTablet ? 25 : 32,
    fontSize: {
      tick: isMobile ? 9 : isTablet ? 11 : 12,
      legend: isMobile ? 11 : 13,
      tooltip: isMobile ? 11 : 13,
    },
    xAxis: {
      tickMargin: isMobile ? 3 : 8,
      angle: isMobile ? -35 : 0 as any,
      textAnchor: isMobile ? 'end' : 'middle' as any,
      height: isMobile ? 50 : 35,
    },
    yAxisWidth: {
      left: isMobile ? 25 : 35,
      right: isMobile ? 25 : 30,
    },
    line: {
      strokeWidth: isMobile ? 2 : 2.5,
      dotRadius: isMobile ? 3 : 4,
      activeDotRadius: isMobile ? 4 : 5,
    },
    legend: {
      height: isMobile ? 25 : 35,
      paddingBottom: isMobile ? 3 : 6,
    },
  }), [isMobile, isTablet]);

  return (
    <div className={`w-full ${config.heightClass} min-h-0`}>
      <p className="sr-only" role="img" aria-label={alt} />
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={config.margins as any}
          barCategoryGap={config.barCategoryGap as any}
          barGap={config.barGap as any}
        >
          <CartesianGrid strokeDasharray="2 2" opacity={0.4} />
          <XAxis
            dataKey="bank"
            tickMargin={config.xAxis.tickMargin}
            tick={{ fontSize: config.fontSize.tick, fill: '#6B7280' }}
            interval={0}
            angle={config.xAxis.angle}
            textAnchor={config.xAxis.textAnchor}
            height={config.xAxis.height}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: config.fontSize.tick, fill: '#6B7280' }}
            width={config.yAxisWidth.left}
            axisLine={{ stroke: '#D1D5DB' }}
            label={isMobile ? undefined : { value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: config.fontSize.tick } } as any}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: config.fontSize.tick, fill: '#6B7280' }}
            width={config.yAxisWidth.right}
            axisLine={{ stroke: '#D1D5DB' }}
            label={isMobile ? undefined : { value: 'Rate %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: config.fontSize.tick } } as any}
          />
          <Tooltip
            contentStyle={{
              fontSize: `${config.fontSize.tooltip}px`,
              padding: isMobile ? '6px 8px' : '8px 12px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ fontWeight: '600', marginBottom: '4px' }}
          />
          <Legend
            verticalAlign="top"
            height={config.legend.height}
            wrapperStyle={{ paddingBottom: config.legend.paddingBottom, fontSize: config.fontSize.legend, fontWeight: 500 } as any}
            iconType="rect"
          />
          <Bar yAxisId="left" dataKey="total" name="Total" fill="#A7F3D0" maxBarSize={config.maxBarSize} radius={[1,1,0,0]} stroke="#6EE7B7" strokeWidth={0.5} />
          <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10B981" maxBarSize={config.maxBarSize} radius={[1,1,0,0]} stroke="#059669" strokeWidth={0.5} />
          <Line yAxisId="right" type="monotone" dataKey="rate" name="Rate %" stroke="#3B82F6" strokeWidth={config.line.strokeWidth}
            dot={{ r: config.line.dotRadius, fill: '#3B82F6', stroke: '#1E40AF', strokeWidth: 1 }}
            activeDot={{ r: config.line.activeDotRadius, fill: '#1D4ED8', stroke: '#1E3A8A', strokeWidth: 2 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

