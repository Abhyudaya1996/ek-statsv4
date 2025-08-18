"use client";
import React from 'react';
import { useFilters } from '@/hooks/use-filters';
import DateRangePickerModal, { type DateRange } from '@/components/ui/DateRangePicker';

type FilterBarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchSuggestions?: string[];
  stages?: string[];
  onStagesChange?: (values: string[]) => void;
  quality?: string[];
  onQualityChange?: (values: string[]) => void;
  banks?: string[];
  onBanksChange?: (values: string[]) => void;
  availableBanks?: string[];
  onApply?: () => void;
};

const STAGE_OPTIONS = ['Incomplete', 'KYC', 'Verification', 'Approved', 'Rejected'] as const;
const QUALITY_OPTIONS = ['Good', 'Avg', 'Bad', 'Unknown'] as const;

export function FilterBar(props: FilterBarProps) {
  const { filters, setTimePreset, setCustomRange, validationError } = useFilters();
  const [showDateModal, setShowDateModal] = React.useState(false);
  const [applicationMonth, setApplicationMonth] = React.useState<string>('');
  const {
    search,
    onSearchChange,
    searchSuggestions = [],
    stages,
    onStagesChange,
    quality,
    onQualityChange,
    banks,
    onBanksChange,
    availableBanks = ['HDFC', 'Axis'],
    onApply,
  } = props;

  type MultiSelectDropdownProps = {
    label: string;
    ariaLabel: string;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
  };

  const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, ariaLabel, options, selected, onChange }) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) setOpen(false);
      };
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onEsc);
      return () => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
      };
    }, []);

    const toggleValue = (value: string) => {
      const exists = selected.includes(value);
      const next = exists ? selected.filter(v => v !== value) : [...selected, value];
      onChange(next);
    };

    const summary = selected.length ? `${label} (${selected.length})` : label;

    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={() => setOpen(v => !v)}
          className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2"
        >
          {summary}
        </button>
        {open && (
          <div
            role="listbox"
            aria-label={ariaLabel}
            className="absolute left-0 z-20 mt-2 w-56 max-h-56 overflow-auto rounded-lg border bg-white p-2 shadow-lg"
          >
            <div className="flex flex-col gap-1">
              {options.map(opt => {
                const id = `${label}-${opt}`;
                const checked = selected.includes(opt);
                return (
                  <label key={opt} htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50">
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(opt)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <section aria-label="Filters" className="sticky top-0 z-10 w-full bg-white/80 p-3 backdrop-blur">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Time:</span>
          <button
            type="button"
            onClick={() => setTimePreset('current')}
            className={`rounded-md px-3 py-1 text-sm ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 ${
              filters.timeRange.preset === 'current_month' ? 'bg-emerald-600 text-white' : 'bg-white'
            }`}
          >
            Current
          </button>
          <button
            type="button"
            onClick={() => setTimePreset('last3')}
            className={`rounded-md px-3 py-1 text-sm ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 ${
              filters.timeRange.preset === 'last_3_months' ? 'bg-emerald-600 text-white' : 'bg-white'
            }`}
          >
            Last 3
          </button>
          <button
            type="button"
            onClick={() => setTimePreset('last6')}
            className={`rounded-md px-3 py-1 text-sm ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 ${
              filters.timeRange.preset === 'last_6_months' ? 'bg-emerald-600 text-white' : 'bg-white'
            }`}
          >
            Last 6
          </button>

          {/* Application Month dropdown */}
          <select
            aria-label="Application Month"
            value={applicationMonth}
            onChange={e => {
              const m = e.target.value;
              setApplicationMonth(m);
              if (!m) return;
              // Update month range to single month
              // Expect YYYY-MM
              // Keep preset as custom to indicate explicit selection
              (setTimePreset as any)('noop');
              // Update via custom setter exposed in provider
              setCustomRange(m, m);
            }}
            className="rounded-md border px-3 py-1 text-sm"
          >
            <option value="">Application Month…</option>
            {/* Basic recent list: current, last-5 months */}
            {Array.from({ length: 6 }).map((_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const val = `${d.getFullYear()}-${month}`;
              return (
                <option key={val} value={val}>{val}</option>
              );
            })}
          </select>

          {/* Custom date range */}
          <button
            type="button"
            onClick={() => setShowDateModal(true)}
            className="rounded-md px-3 py-1 text-sm ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 bg-white"
          >
            Custom Range…
          </button>
          {filters.timeRange.preset === 'custom' && (filters as any).customRange && (
            <span className="text-xs text-gray-600">
              {(filters as any).customRange.from} → {(filters as any).customRange.to}
            </span>
          )}
        </div>

        {(onSearchChange || onStagesChange || onQualityChange || onBanksChange) && (
          <div className="flex flex-wrap items-center gap-2">
            {onSearchChange && (
              <>
                <input
                  aria-label="Search leads"
                  placeholder="Search by ID, name, bank, card"
                  value={search ?? ''}
                  onChange={e => onSearchChange(e.target.value)}
                  className="w-64 rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
                  list="lead-search-suggestions"
                />
                {searchSuggestions.length > 0 && (
                  <datalist id="lead-search-suggestions">
                    {searchSuggestions.slice(0, 8).map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                )}
              </>
            )}

            {onStagesChange && (
              <MultiSelectDropdown
                label="Stage"
                ariaLabel="Stage filter"
                options={[...STAGE_OPTIONS]}
                selected={stages ?? []}
                onChange={onStagesChange}
              />
            )}

            {onQualityChange && (
              <MultiSelectDropdown
                label="Quality"
                ariaLabel="Quality filter"
                options={[...QUALITY_OPTIONS]}
                selected={quality ?? []}
                onChange={onQualityChange}
              />
            )}

            {onBanksChange && (
              <MultiSelectDropdown
                label="Bank"
                ariaLabel="Bank filter"
                options={Array.from(new Set(availableBanks)).filter(Boolean)}
                selected={banks ?? []}
                onChange={onBanksChange}
              />
            )}
          </div>
        )}

        {onApply && (
          <div className="flex justify-start">
            <button
              aria-label="Apply Filters"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white focus:outline-none focus-visible:ring-2"
              onClick={onApply}
            >
              Apply Filters
            </button>
          </div>
        )}

        <div className="text-xs text-red-600" role="alert" aria-live="assertive">
          {validationError}
        </div>
      </div>
    </section>
    <DateRangePickerModal
      isOpen={showDateModal}
      onClose={() => setShowDateModal(false)}
      onChange={(range: DateRange) => {
        setCustomRange(range.from.slice(0,7), range.to.slice(0,7));
        (filters as any).customRange = range as any;
      }}
    />
    </>
  );
}

