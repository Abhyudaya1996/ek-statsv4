"use client";
import React from 'react';
import { useFilters } from '@/hooks/use-filters';
import { Search, ChevronDown, X, Filter, Check } from 'lucide-react';

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
  const { filters, setTimePreset, validationError } = useFilters();
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
    availableBanks = ['HDFC', 'Axis', 'ICICI', 'SBI'],
    onApply,
  } = props;

  type MultiSelectDropdownProps = {
    label: string;
    ariaLabel: string;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    icon?: React.ReactNode;
  };

  const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ 
    label, 
    ariaLabel, 
    options, 
    selected, 
    onChange,
    icon 
  }) => {
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

    const clearAll = () => {
      onChange([]);
    };

    const summary = selected.length ? `${label} (${selected.length})` : label;

    return (
      <div ref={containerRef} className="dropdown">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={() => setOpen(v => !v)}
          className="dropdown-trigger"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="truncate">{summary}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        
        {open && (
          <div className="dropdown-content slide-up">
            {selected.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-100">
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto">
              {options.map(opt => {
                const id = `${label}-${opt}`;
                const checked = selected.includes(opt);
                return (
                  <label 
                    key={opt} 
                    htmlFor={id} 
                    className={`dropdown-item ${checked ? 'selected' : ''}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <input
                          id={id}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(opt)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          checked 
                            ? 'bg-emerald-600 border-emerald-600' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <span className="flex-1">{opt}</span>
                    </div>
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
    <section aria-label="Filters" className="filter-bar">
      <div className="filter-section">
        {/* Time Range Filters */}
        <div className="filter-row">
          <span className="filter-label">Time:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTimePreset('current')}
              className={`btn ${
                filters.timeRange.preset === 'current_month' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => setTimePreset('last3')}
              className={`btn ${
                filters.timeRange.preset === 'last_3_months' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Last 3
            </button>
            <button
              type="button"
              onClick={() => setTimePreset('last6')}
              className={`btn ${
                filters.timeRange.preset === 'last_6_months' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Last 6
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        {(onSearchChange || onStagesChange || onQualityChange || onBanksChange) && (
          <div className="space-y-3">
            {onSearchChange && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  aria-label="Search leads"
                  placeholder="Search by ID, name, bank, card..."
                  value={search ?? ''}
                  onChange={e => onSearchChange(e.target.value)}
                  className="input pl-11"
                  list="lead-search-suggestions"
                />
                {searchSuggestions.length > 0 && (
                  <datalist id="lead-search-suggestions">
                    {searchSuggestions.slice(0, 8).map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                )}
              </div>
            )}

            <div className="filter-row">
              {onStagesChange && (
                <MultiSelectDropdown
                  label="Stage"
                  ariaLabel="Stage filter"
                  options={[...STAGE_OPTIONS]}
                  selected={stages ?? []}
                  onChange={onStagesChange}
                  icon={<Filter className="w-4 h-4" />}
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
          </div>
        )}

        {/* Apply Button */}
        {onApply && (
          <div className="flex justify-start">
            <button
              aria-label="Apply Filters"
              className="btn btn-primary"
              onClick={onApply}
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </button>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3" role="alert" aria-live="assertive">
            {validationError}
          </div>
        )}
      </div>
    </section>
  );
}