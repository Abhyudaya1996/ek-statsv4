"use client";
import React from 'react';

type LeadFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStages: string[];
  onStagesChange: (values: string[]) => void;
  quality: string[];
  onQualityChange: (values: string[]) => void;
  banks: string[];
  onBanksChange: (values: string[]) => void;
  availableBanks: string[];
  onApply: () => void;
};

const STAGE_OPTIONS = ['Incomplete', 'KYC', 'Verification', 'Approved', 'Rejected'] as const;

export function LeadFilters(props: LeadFiltersProps) {
  const {
    search,
    onSearchChange,
    selectedStages,
    onStagesChange,
    quality,
    onQualityChange,
    banks,
    onBanksChange,
    availableBanks,
    onApply,
  } = props;

  return (
    <section className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Search leads"
          placeholder="Search by ID, name, bank, card"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-64 rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
        />

        <select
          aria-label="Stage filter"
          multiple
          value={selectedStages}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions).map(o => o.value);
            onStagesChange(options);
          }}
          className="min-w-[160px] rounded-lg border px-2 py-2 text-sm"
        >
          {STAGE_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          aria-label="Quality Stage"
          multiple
          value={quality}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions).map(o => o.value);
            onQualityChange(options);
          }}
          className="min-w-[160px] rounded-lg border px-2 py-2 text-sm"
        >
          {['Good','Avg','Bad','Unknown'].map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <select
          aria-label="Bank filter"
          multiple
          value={banks}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions).map(o => o.value);
            onBanksChange(options);
          }}
          className="min-w-[140px] rounded-lg border px-2 py-2 text-sm"
        >
          {availableBanks.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <button
          aria-label="Apply Filters"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          onClick={onApply}
        >
          Apply Filters
        </button>
      </div>
    </section>
  );
}


