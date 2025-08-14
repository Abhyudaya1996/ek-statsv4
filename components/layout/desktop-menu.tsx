"use client";
import React from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, BarChart3, List, Filter, LineChart, CircleSlash2 } from 'lucide-react';
import { useFilters } from '@/hooks/use-filters';

export function DesktopMenu() {
  const [open, setOpen] = React.useState(false);
  const { setTimePreset } = useFilters();
  return (
    <div className="block">
      <button
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        className="inline-flex items-center gap-2 rounded px-3 py-1 text-sm focus:outline-none focus-visible:ring-2"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="hidden md:inline">Menu</span>
      </button>
      {open && (
        <aside
          role="dialog"
          aria-label="Navigation"
          className="fixed left-0 top-0 z-40 h-full w-[85%] max-w-sm md:w-64 border-r bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-emerald-600 font-semibold">EK Stats</span>
            <button aria-label="Close navigation" onClick={() => setOpen(false)} className="p-1 focus:outline-none focus-visible:ring-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-3">
            <ul className="space-y-1">
              <li>
                <Link href="/" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" /> Home
                </Link>
              </li>
              <li>
                <Link href="/funnel" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  <BarChart3 className="h-4 w-4" /> Funnel
                </Link>
              </li>
              <li>
                <Link href="/leads/detailed" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  <List className="h-4 w-4" /> Lead Reports
                </Link>
              </li>
              <li>
                <Link href="/reports/approvals" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  <Filter className="h-4 w-4" /> Approvals
                </Link>
              </li>
              <li>
                <Link href="/reports/rejection" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  <CircleSlash2 className="h-4 w-4" /> Rejection Report
                </Link>
              </li>
              <li>
                <Link href="/analytics/timeline" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  <LineChart className="h-4 w-4" /> Timeline
                </Link>
              </li>
            </ul>
            <div className="mt-4 border-t pt-3">
              <p className="mb-2 text-xs font-semibold text-gray-500">Time Range</p>
              <div className="flex gap-2">
                <button onClick={() => { setTimePreset('current'); setOpen(false); }} className="rounded-full bg-emerald-600 px-3 py-1 text-xs text-white">Current</button>
                <button onClick={() => { setTimePreset('last3'); setOpen(false); }} className="rounded-full border px-3 py-1 text-xs">Last 3</button>
                <button onClick={() => { setTimePreset('last6'); setOpen(false); }} className="rounded-full border px-3 py-1 text-xs">Last 6</button>
              </div>
            </div>
          </nav>
        </aside>
      )}
    </div>
  );
}
