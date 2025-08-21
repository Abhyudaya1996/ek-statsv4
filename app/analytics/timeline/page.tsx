'use client';

import React, { useState } from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TimelinePage() {
  const [view, setView] = useState<'month' | 'day' | 'breakdown'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [mode, setMode] = useState<'count' | 'pct'>('count');
  const [breakdownType, setBreakdownType] = useState<'bank' | 'quality'>('bank');
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>('monthly');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'good' | 'avg' | 'bad' | 'unknown'>('all');

  const monthlyData = [
    { month: 'Jul 2025', clicks: 3200, leads: 800, approved: 100, rejected: 100, kyc: 150 },
    { month: 'Jun 2025', clicks: 2800, leads: 700, approved: 90, rejected: 80, kyc: 140 },
    { month: 'May 2025', clicks: 3000, leads: 750, approved: 95, rejected: 85, kyc: 145 },
  ];

  const dailyData = [
    { date: '01 Jul', clicks: 356, leads: 89, approved: 23, rejected: 18, kyc: 48 },
    { date: '02 Jul', clicks: 304, leads: 76, approved: 19, rejected: 15, kyc: 42 },
    { date: '03 Jul', clicks: 408, leads: 102, approved: 28, rejected: 24, kyc: 50 },
    { date: '04 Jul', clicks: 376, leads: 94, approved: 22, rejected: 21, kyc: 51 },
    { date: '05 Jul', clicks: 348, leads: 87, approved: 25, rejected: 16, kyc: 46 },
    { date: '06 Jul', clicks: 372, leads: 93, approved: 21, rejected: 19, kyc: 53 },
    { date: '07 Jul', clicks: 312, leads: 78, approved: 18, rejected: 14, kyc: 46 },
  ];

  // Filter data based on quality
  const filterDataByQuality = (data: any[]) => {
    if (qualityFilter === 'all') return data;
    
    // For demo purposes, we'll simulate quality filtering
    // In real implementation, this would filter based on bank quality metrics
    const qualityMultipliers = {
      good: 0.8, // Good quality banks contribute more
      avg: 0.6,  // Average quality banks
      bad: 0.3,  // Bad quality banks contribute less
      unknown: 0.5 // Unknown quality banks
    };
    
    const multiplier = qualityMultipliers[qualityFilter];
    return data.map(item => ({
      ...item,
      leads: Math.round(item.leads * multiplier),
      approved: Math.round(item.approved * multiplier),
      rejected: Math.round(item.rejected * multiplier),
      kyc: Math.round((item.kyc || 0) * multiplier),
      clicks: Math.round((item.clicks || 0) * multiplier)
    }));
  };

  const chartData = filterDataByQuality(granularity === 'monthly' ? monthlyData : dailyData);
  const xAxisKey = granularity === 'monthly' ? 'month' : 'date';

  const breakdownData = {
    bank: [
      { name: 'HDFC', leads: 28, approved: 8, rejected: 5 },
      { name: 'Axis', leads: 24, approved: 6, rejected: 4 },
      { name: 'ICICI', leads: 20, approved: 5, rejected: 3 },
      { name: 'SBI', leads: 17, approved: 4, rejected: 2 },
    ],
    quality: [
      { name: 'Good', leads: 20, approved: 14, rejected: 2 },
      { name: 'Avg', leads: 50, approved: 10, rejected: 10 },
      { name: 'Bad', leads: 19, approved: 0, rejected: 6 },
    ],
  } as const;

  if (view === 'month') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <div className="px-4 py-6">
          <FilterBar />
          <h1 className="mb-1 mt-2 text-lg font-bold text-gray-900 md:text-xl">Timeline View</h1>
          <p className="mb-2 text-sm leading-5 text-gray-600">
            Track lead progression over time — analyze monthly and daily trends to adjust strategy.
          </p>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Timeline View</h1>

          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Granularity Toggle */}
              <div className="inline-flex rounded-md border overflow-hidden">
                <button 
                  onClick={() => setGranularity('daily')} 
                  className={`px-3 py-1 text-sm ${granularity === 'daily' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setGranularity('monthly')} 
                  className={`px-3 py-1 text-sm ${granularity === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                >
                  Monthly
                </button>
              </div>

              {/* Quality Filter */}
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value as typeof qualityFilter)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Quality</option>
                <option value="good">Good</option>
                <option value="avg">Avg</option>
                <option value="bad">Bad</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {/* Numbers/% Toggle */}
            <div className="inline-flex rounded-md border overflow-hidden">
              <button onClick={() => setMode('count')} className={`px-3 py-1 text-sm ${mode === 'count' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>Numbers</button>
              <button onClick={() => setMode('pct')} className={`px-3 py-1 text-sm ${mode === 'pct' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>%</button>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">
              {granularity === 'monthly' ? 'Monthly' : 'Daily'} Trend
              {qualityFilter !== 'all' && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({qualityFilter.charAt(0).toUpperCase() + qualityFilter.slice(1)} Quality)
                </span>
              )}
            </h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2} name="Leads" />
                  <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} name="Approvals" />
                  <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} name="Rejections" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px] overflow-y-auto max-h-[420px] rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                    {granularity === 'monthly' ? 'Month' : 'Date'}
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Clicks</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Leads</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Approved</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {chartData.map(row => (
                  <tr
                    key={row.month || row.date}
                    onClick={() => {
                      if (granularity === 'monthly') {
                        setSelectedMonth(row.month);
                        setView('day');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (granularity === 'monthly' && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedMonth(row.month);
                        setView('day');
                      }
                    }}
                    role={granularity === 'monthly' ? "button" : undefined}
                    tabIndex={granularity === 'monthly' ? 0 : undefined}
                    className={granularity === 'monthly' ? "cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150" : ""}
                  >
                    <td className="px-3 py-3 text-sm font-medium">{row.month || row.date}</td>
                    <td className="px-3 py-3 text-right text-sm">{mode === 'pct' ? '100%' : (row.clicks || 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-sm">{mode === 'pct' ? `${(((row.leads || 0) / (row.clicks || 1)) * 100).toFixed(1)}%` : (row.leads || 0)}</td>
                    <td className="px-3 py-3 text-right text-sm text-green-600">{mode === 'pct' ? `${(((row.approved || 0) / (row.leads || 1)) * 100).toFixed(1)}%` : (row.approved || 0)}</td>
                    <td className="px-3 py-3 text-right text-sm text-red-600">{mode === 'pct' ? `${(((row.rejected || 0) / (row.leads || 1)) * 100).toFixed(1)}%` : (row.rejected || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'day') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <div className="px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => setView('month')} className="flex items-center gap-2 text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h2 className="text-lg font-bold">{selectedMonth || 'December 2024'}</h2>
            <div className="inline-flex rounded-md border overflow-hidden">
              <button onClick={() => setMode('count')} className={`px-3 py-1 text-sm ${mode === 'count' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>Numbers</button>
              <button onClick={() => setMode('pct')} className={`px-3 py-1 text-sm ${mode === 'pct' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>%</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px] overflow-y-auto max-h-[420px] rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Approved</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">Rejected</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">KYC</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailyData.map(row => (
                  <tr
                    key={row.date}
                    onClick={() => {
                      setSelectedDay(row.date);
                      setView('breakdown');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDay(row.date);
                        setView('breakdown');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-150"
                  >
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium">{row.date}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-semibold">{row.leads}</td>
                    <td className="px-3 py-3 text-right text-sm">
                      <span className="font-medium text-green-600">{row.approved}</span>
                      {mode === 'pct' && <span className="ml-1 text-xs text-gray-500">({((row.approved / row.leads) * 100).toFixed(0)}%)</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-sm">
                      <span className="font-medium text-red-600">{row.rejected}</span>
                      {mode === 'pct' && <span className="ml-1 text-xs text-gray-500">({((row.rejected / row.leads) * 100).toFixed(0)}%)</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-sm">
                      <span className="font-medium text-blue-600">{row.kyc}</span>
                      {mode === 'pct' && <span className="ml-1 text-xs text-gray-500">({((row.kyc / row.leads) * 100).toFixed(0)}%)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => setView('day')} className="flex items-center gap-2 text-blue-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-base font-bold">{selectedDay || 'Dec 01'}</h2>
          <select
            value={breakdownType}
            onChange={e => setBreakdownType(e.target.value as 'bank' | 'quality')}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            <option value="bank">By Bank</option>
            <option value="quality">By Quality</option>
          </select>
        </div>

        <div className="space-y-3">
          {(breakdownType === 'bank' ? breakdownData.bank : breakdownData.quality).map(item => (
            <div key={item.name} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <span className="text-sm font-bold text-gray-900">{item.leads} leads</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{item.leads}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-2 text-center">
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-lg font-bold text-green-600">{item.approved}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-2 text-center">
                  <p className="text-xs text-gray-500">Rejected</p>
                  <p className="text-lg font-bold text-red-600">{item.rejected}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Approval Rate</span>
                  <span>{((item.approved / item.leads) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${(item.approved / item.leads) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
