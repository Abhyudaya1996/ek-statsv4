"use client";
import React from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X } from 'lucide-react';

export type DateRange = { from: string; to: string };

type Props = {
  isOpen: boolean;
  initial?: DateRange;
  onClose: () => void;
  onChange: (range: DateRange) => void;
};

export default function DateRangePickerModal({ isOpen, initial, onClose, onChange }: Props) {
  const [from, setFrom] = React.useState<Date | null>(initial ? new Date(initial.from) : null);
  const [to, setTo] = React.useState<Date | null>(initial ? new Date(initial.to) : null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (from && to && from > to) setError('Start date must not be after end date');
    else setError(null);
  }, [from, to]);

  if (!isOpen) return null;

  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-base font-semibold">Select Date Range</h3>
          </div>
          <button aria-label="Close" className="rounded p-1 hover:bg-gray-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">From</label>
            <DatePicker
              selected={from}
              onChange={(d: Date | null) => setFrom(d)}
              dateFormat="yyyy-MM-dd"
              maxDate={to ?? undefined}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholderText="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">To</label>
            <DatePicker
              selected={to}
              onChange={(d: Date | null) => setTo(d)}
              dateFormat="yyyy-MM-dd"
              minDate={from ?? undefined}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholderText="YYYY-MM-DD"
            />
          </div>
        </div>

        {error && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded px-3 py-2 text-sm ring-1 ring-gray-300" onClick={onClose}>Cancel</button>
          <button
            className="rounded bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-60"
            onClick={() => {
              if (!from || !to || error) return;
              onChange({ from: toIso(from), to: toIso(to) });
              onClose();
            }}
            disabled={!from || !to || Boolean(error)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}


