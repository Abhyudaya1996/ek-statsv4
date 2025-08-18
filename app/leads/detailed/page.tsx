"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrencyINR } from '@/lib/utils';
import { useFilters } from '@/hooks/use-filters';
import { useDetailedLeads } from '@/hooks/use-leads';

// Stage filter options as labels to group into a single dropdown for compact UI
const STAGE_OPTIONS = ['Incomplete', 'KYC', 'Verification', 'Approved', 'Rejected'] as const;

type LeadRow = {
  applicationId: string;
  applicantName: string;
  applicationDate: string;
  bank: string;
  cardName: string;
  stageBucket: string;
  quality: string;
  description: string;
  commission: number;
  commissionStatus: 'pending' | 'paid';
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function DetailedLeadsPage() {
  const { filters } = useFilters();
  const [selectedStages, setSelectedStages] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [search, setSearchInput] = React.useState('');
  const [quality, setQuality] = React.useState<string[]>([]);
  const [banks, setBanks] = React.useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search, 300);

  const stageFilterMap: Record<string, string[]> = {
    Incomplete: ['a', 'b'],
    KYC: ['c', 'd'],
    Verification: ['e', 'f'],
    Approved: ['w', 'z'],
    Rejected: ['r', 'r2'],
  };

  const effectiveFilters = {
    ...filters,
    stages: (selectedStages.flatMap(s => stageFilterMap[s] ?? []) as string[]),
    search: debouncedSearch,
    qualityStages: quality,
    banks,
  } as any;

  const q = useDetailedLeads(effectiveFilters, { page, limit: 50, search: debouncedSearch });

  if (q.isLoading) {
    return (
      <>
        <FilterBar />
        <div className="mt-3 h-40 animate-pulse rounded-lg bg-gray-200" aria-busy="true" />
      </>
    );
  }

  if (q.isError || !q.data) {
    return <EmptyState title="Unable to load leads" message={(q.error as Error)?.message ?? 'Please try again.'} />;
  }

  const data = q.data as { data: LeadRow[]; meta: { page: number; limit: number; total: number } } | any;
  const list: LeadRow[] = Array.isArray((data as any).data) ? (data as any).data : (data as LeadRow[]);
  const total = (data as any).meta?.total ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / 50));

  const handleExport = (type: 'csv' | 'excel') => {
    alert(`Export ${type.toUpperCase()} coming in v1.1`);
  };

  return (
    <>
      <FilterBar
        search={search}
        onSearchChange={setSearchInput}
        stages={selectedStages}
        onStagesChange={setSelectedStages}
        quality={quality}
        onQualityChange={setQuality}
        banks={banks}
        onBanksChange={setBanks}
        availableBanks={Array.from(new Set(list.map((r: any) => String(r.bank ?? '')))).filter((b): b is string => Boolean(b))}
        onApply={() => { setPage(1); }}
      />

      {/* Mobile cards */}
      <div className="mt-3 space-y-3 md:hidden">
        {list.map(row => (
          <div key={row.applicationId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm tap-anim">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                  <span className="text-xs font-bold text-blue-600">{row.bank?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{row.bank}</p>
                  <p className="text-xs text-gray-500">{row.cardName}</p>
                </div>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${row.stageBucket === 'Approved' ? 'bg-green-100 text-green-800' : row.stageBucket === 'KYC' ? 'bg-amber-100 text-amber-800' : row.stageBucket === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{row.stageBucket}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{row.applicantName || '—'}</p>
              <p className="text-xs text-gray-500">ID: {row.applicationId}</p>
              <p className="text-xs text-gray-500">{(() => {
                const parts = (row.applicationDate || '').split('-');
                if (parts.length === 3) {
                  // Expecting DD-MM-YYYY already; if not, attempt swap
                  if (parts[0].length === 4) {
                    // YYYY-MM-DD -> DD-MM-YYYY
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                  }
                }
                return row.applicationDate || '—';
              })()}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className={`rounded px-2 py-1 text-xs ${row.quality === 'Good' ? 'bg-green-100 text-green-700' : row.quality === 'Avg' ? 'bg-amber-100 text-amber-700' : row.quality === 'Bad' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{row.quality}</span>
              <div className="text-right">
                <p className="text-sm font-bold">{formatCurrencyINR(row.commission)}</p>
                <p className={`text-xs ${row.commissionStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{row.commissionStatus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <section className="mt-3 hidden md:block">
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="px-3 py-2">Lead Information</th>
                <th className="px-3 py-2">Bank & Card</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Commission</th>
              </tr>
            </thead>
            <tbody>
              {list.map(row => (
                <tr key={row.applicationId} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.applicationId}</div>
                    <div className="text-xs text-gray-500">{row.applicationDate}</div>
                    <div className="text-xs">{row.applicantName}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.bank}</div>
                    <div className="text-xs text-gray-500">{row.cardName}</div>
                  </td>
                  <td className="px-3 py-2">{row.stageBucket}</td>
                  <td className="px-3 py-2">{row.description}</td>
                  <td className="px-3 py-2">
                    <div>{formatCurrencyINR(row.commission)}</div>
                    <div className="text-xs text-gray-500">{row.commissionStatus}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
        <button
          className="rounded-md px-3 py-1 text-sm ring-1 ring-gray-300 disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          className="rounded-md px-3 py-1 text-sm ring-1 ring-gray-300 disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </>
  );
}
