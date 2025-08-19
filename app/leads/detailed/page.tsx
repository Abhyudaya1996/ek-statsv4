"use client";
import React from 'react';
import { FilterBar } from '@/components/filters/filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrencyINR } from '@/lib/utils';
import { useFilters } from '@/hooks/use-filters';
import { useDetailedLeads } from '@/hooks/use-leads';
import { Search, Download, ChevronLeft, ChevronRight, Building2, CreditCard } from 'lucide-react';

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

  const handleExport = (type: 'csv' | 'excel') => {
    // Show loading state
    const button = document.activeElement as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Exporting...';
      button.disabled = true;
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        alert(`Export ${type.toUpperCase()} feature coming in v1.1`);
      }, 1000);
    }
  };

  const getBadgeClass = (type: 'stage' | 'quality', value: string) => {
    if (type === 'stage') {
      switch (value.toLowerCase()) {
        case 'approved': return 'stage-badge approved';
        case 'kyc': return 'stage-badge kyc';
        case 'verification': return 'stage-badge verification';
        case 'rejected': return 'stage-badge rejected';
        default: return 'stage-badge incomplete';
      }
    } else {
      switch (value.toLowerCase()) {
        case 'good': return 'quality-badge good';
        case 'avg': return 'quality-badge avg';
        case 'bad': return 'quality-badge bad';
        default: return 'quality-badge unknown';
      }
    }
  };

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <FilterBar
          search={search}
          onSearchChange={setSearchInput}
          stages={selectedStages}
          onStagesChange={setSelectedStages}
          quality={quality}
          onQualityChange={setQuality}
          banks={banks}
          onBanksChange={setBanks}
          availableBanks={['HDFC', 'Axis', 'ICICI', 'SBI']}
          onApply={() => { setPage(1); }}
        />
        <div className="space-y-4">
          <div className="skeleton h-6 w-48" />
          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-4 w-24 mb-4" />
                <div className="skeleton h-16" />
              </div>
            ))}
          </div>
          <div className="hidden md:block card">
            <div className="skeleton h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="space-y-6">
        <FilterBar
          search={search}
          onSearchChange={setSearchInput}
          stages={selectedStages}
          onStagesChange={setSelectedStages}
          quality={quality}
          onQualityChange={setQuality}
          banks={banks}
          onBanksChange={setBanks}
          availableBanks={['HDFC', 'Axis', 'ICICI', 'SBI']}
          onApply={() => { setPage(1); }}
        />
        <EmptyState 
          title="Unable to load leads" 
          message={(q.error as Error)?.message ?? 'Please try again.'} 
          showRetry
        />
      </div>
    );
  }

  const data = q.data as { data: LeadRow[]; meta: { page: number; limit: number; total: number } } | any;
  const list: LeadRow[] = Array.isArray((data as any).data) ? (data as any).data : (data as LeadRow[]);
  // If no API data, fall back to provided mock of 10 items
  const fallbackList: LeadRow[] = [
    { applicantName:'MANISH E', applicationId:'25A21D78383320S2', bank:'HDFC', cardName:'Hdfc Diners Privilege Credit Card', applicationDate:'21-01-2025', quality:'Good Credit Score', commission:3220, stageBucket:'KYC Done', description:'', commissionStatus:'pending' },
    { applicantName:'AKHIL P M', applicationId:'25A28D87312490H3', bank:'HDFC', cardName:'Hdfc Bank Freedom Credit Card', applicationDate:'28-01-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Verification', description:'', commissionStatus:'pending' },
    { applicantName:'SUNITA MANDE', applicationId:'25A28D87359990W2', bank:'HDFC', cardName:'Hdfc Shoppers Stop Credit Card', applicationDate:'28-01-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Approved', description:'', commissionStatus:'paid' },
    { applicantName:'KOLA PENTAYYA VARMA', applicationId:'25A30D88990890UO', bank:'HDFC', cardName:'Hdfc Swiggy Credit Card', applicationDate:'30-01-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Rejected', description:'', commissionStatus:'pending' },
    { applicantName:'ANMOL MADAN', applicationId:'25A31D90116550S3', bank:'HDFC', cardName:'Hdfc Shoppers Stop Credit Card', applicationDate:'31-01-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Approved', description:'', commissionStatus:'paid' },
    { applicantName:'SHIKA SUDESH DESAI', applicationId:'25B04D93742190WD', bank:'HDFC', cardName:'Hdfc Moneyback Credit Card', applicationDate:'04-02-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Incomplete Application', description:'', commissionStatus:'pending' },
    { applicantName:'PRABHU MALLAPPA TALWAR', applicationId:'25B08D97881310W2', bank:'HDFC', cardName:'Hdfc Tata Neu Plus Credit Card', applicationDate:'08-02-2025', quality:'Good Credit Score', commission:2119, stageBucket:'KYC Pending', description:'', commissionStatus:'pending' },
    { applicantName:'VIKAS HARPHOOL', applicationId:'25B10D99691250QV', bank:'HDFC', cardName:'Hdfc Bank Business Regalia Gold Credit Card', applicationDate:'10-02-2025', quality:'Good Credit Score', commission:2542, stageBucket:'Verification', description:'', commissionStatus:'pending' },
    { applicantName:'PRACHI TOMAR', applicationId:'25B12D02364300W6', bank:'HDFC', cardName:'Hdfc Swiggy Credit Card', applicationDate:'12-02-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Incomplete Application', description:'', commissionStatus:'pending' },
    { applicantName:'KUNDAN NILKANTHRA DEKATE', applicationId:'25B17D07610100WC', bank:'HDFC', cardName:'Hdfc Swiggy Credit Card', applicationDate:'17-02-2025', quality:'Good Credit Score', commission:2119, stageBucket:'Incomplete Application', description:'', commissionStatus:'pending' },
  ];
  const normalizedList: LeadRow[] = (list && list.length ? list : fallbackList).map((r) => {
    const stageLower = (r.stageBucket || '').toLowerCase();
    const normalizedStage = stageLower.startsWith('kyc') ? 'KYC' : r.stageBucket;
    return { ...r, stageBucket: normalizedStage };
  });
  const total = (data as any).meta?.total ?? list.length;
  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="space-y-6">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Detailed Lead Reports</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of all leads with advanced filtering and export capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-secondary"
            aria-label="Export as CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="btn btn-secondary"
            aria-label="Export as Excel"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {list.length} of {total.toLocaleString()} leads</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {normalizedList.slice(0, 10).map(row => (
          <div key={row.applicationId} className="card card-interactive p-4 fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{row.bank}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {row.cardName}
                  </p>
                </div>
              </div>
              <span className={getBadgeClass('stage', row.stageBucket)}>
                {row.stageBucket}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="font-medium text-gray-900">{row.applicantName || '—'}</p>
              <p className="text-sm text-gray-600">ID: {row.applicationId}</p>
              <p className="text-sm text-gray-500">
                {(() => {
                  const parts = (row.applicationDate || '').split('-');
                  if (parts.length === 3) {
                    if (parts[0].length === 4) {
                      return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    if (parts[2].length === 4) {
                      return `${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}-${parts[2]}`;
                    }
                  }
                  return row.applicationDate || '—';
                })()}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className={getBadgeClass('quality', row.quality)}>
                {row.quality}
              </span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrencyINR(row.commission)}</p>
                <p className={`text-xs font-medium ${
                  row.commissionStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {row.commissionStatus}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <section className="hidden md:block">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Lead Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bank & Card
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {normalizedList.slice(0, 10).map(row => (
                  <tr key={row.applicationId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{row.applicationId}</div>
                        <div className="text-sm text-gray-600">{row.applicantName || '—'}</div>
                        <div className="text-xs text-gray-500">{row.applicationDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{row.bank}</div>
                          <div className="text-sm text-gray-500">{row.cardName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getBadgeClass('stage', row.stageBucket)}>
                        {row.stageBucket}
                      </span>
                      {row.description && (
                        <div className="text-xs text-gray-500 mt-1">{row.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getBadgeClass('quality', row.quality)}>
                        {row.quality}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {formatCurrencyINR(row.commission)}
                        </div>
                        <div className={`text-xs font-medium ${
                          row.commissionStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {row.commissionStatus}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pagination */}
      <nav className="flex items-center justify-between" aria-label="Pagination">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Page {page} of {totalPages}</span>
          <span>•</span>
          <span>{total.toLocaleString()} total leads</span>
        </div>
      </nav>
    </div>
  );
}