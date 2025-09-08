"use client";
import React from 'react';

const STATES = [
  'All States', 'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat',
  'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh'
];

export function StateFilter({ value = 'All States', onChange, className = '' }: { value?: string; onChange?: (v: string) => void; className?: string }) {
  const [internal, setInternal] = React.useState<string>(value);

  // Load persisted state on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('ek:selected_state');
      if (saved) setInternal(saved);
    } catch {}
  }, []);

  // Sync external value prop
  React.useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  const handleChange = (next: string) => {
    setInternal(next);
    try { localStorage.setItem('ek:selected_state', next); } catch {}
    onChange?.(next);
  };

  const isActive = internal && internal !== 'All States';

  return (
    <div className={className} aria-label="Select State">
      <label className="sr-only" htmlFor="state-select">Select State</label>
      <select
        id="state-select"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-[160px] rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
          isActive
            ? 'bg-emerald-50 border-emerald-600 text-emerald-700 focus:ring-emerald-600'
            : 'bg-white border-gray-300 text-gray-700 focus:ring-emerald-600'
        }`}
        aria-label="Select State"
      >
        {STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

export default StateFilter;


