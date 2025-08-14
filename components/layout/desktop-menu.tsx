"use client";
import React from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, BarChart3, List, Filter, LineChart, CircleSlash2, Clock } from 'lucide-react';
import { useFilters } from '@/hooks/use-filters';

export function DesktopMenu() {
  const [open, setOpen] = React.useState(false);
  const { setTimePreset } = useFilters();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        className="btn btn-ghost"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="hidden lg:inline ml-2">Menu</span>
      </button>
      
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Menu Panel */}
          <aside
            role="dialog"
            aria-label="Navigation menu"
            className="fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm bg-white shadow-2xl slide-up"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm">
                  EK
                </div>
                <span className="font-semibold text-gray-900">EK Stats</span>
              </div>
              <button 
                aria-label="Close navigation" 
                onClick={() => setOpen(false)} 
                className="btn btn-ghost p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="p-6">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                
                <Link 
                  href="/" 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                
                <Link 
                  href="/funnel" 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Funnel Analysis</span>
                </Link>
                
                <Link 
                  href="/leads/detailed" 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <List className="h-5 w-5" />
                  <span className="font-medium">Lead Reports</span>
                </Link>
                
                <Link 
                  href="/reports/approvals" 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <Filter className="h-5 w-5" />
                  <span className="font-medium">Approval Reports</span>
                </Link>
                
                <Link 
                  href="/reports/rejection" 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <CircleSlash2 className="h-5 w-5" />
                  <span className="font-medium">Rejection Analysis</span>
                </Link>
                
                <Link 
                  href="/analytics/timeline" 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors" 
                  onClick={() => setOpen(false)}
                >
                  <LineChart className="h-5 w-5" />
                  <span className="font-medium">Timeline Analytics</span>
                </Link>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quick Filters
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => { setTimePreset('current'); setOpen(false); }} 
                    className="w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    Current Month
                  </button>
                  <button 
                    onClick={() => { setTimePreset('last3'); setOpen(false); }} 
                    className="w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    Last 3 Months
                  </button>
                  <button 
                    onClick={() => { setTimePreset('last6'); setOpen(false); }} 
                    className="w-full text-left rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    Last 6 Months
                  </button>
                </div>
              </div>
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}