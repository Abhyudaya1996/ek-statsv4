"use client";
import Link from 'next/link';
import { LayoutDashboard, BarChart3, List, CheckSquare, CircleSlash2, LineChart } from 'lucide-react';

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[9999] border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-md xl:hidden mobile-nav"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 h-20 mobile-nav-scroll">
        <Link href="/" className="mobile-nav-item focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Home">
          <LayoutDashboard className="h-7 w-7" />
          <span className="tooltip">Home</span>
        </Link>
        <Link href="/funnel" className="mobile-nav-item focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Funnel">
          <BarChart3 className="h-7 w-7" />
          <span className="tooltip">Funnel</span>
        </Link>
        <Link href="/leads/detailed" className="mobile-nav-item focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Lead Reports">
          <List className="h-7 w-7" />
          <span className="tooltip">Lead Reports</span>
        </Link>
        <Link href="/reports/approvals" className="mobile-nav-item focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Approvals">
          <CheckSquare className="h-7 w-7" />
          <span className="tooltip">Approvals</span>
        </Link>
        <Link href="/reports/rejection" className="mobile-nav-item focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Rejection">
          <CircleSlash2 className="h-7 w-7" />
          <span className="tooltip">Rejection</span>
        </Link>
        <Link href="/analytics/timeline" className="mobile-nav-item focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Timeline">
          <LineChart className="h-7 w-7" />
          <span className="tooltip">Timeline</span>
        </Link>
      </div>
    </nav>
  );
}


