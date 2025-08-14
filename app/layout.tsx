import '../styles/globals.css';
import React from 'react';
import Link from 'next/link';
import { QueryProvider } from '@/providers/query-provider';
import { FilterProvider } from '@/providers/filter-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { LayoutDashboard, Filter, LineChart, List, BarChart3, CircleSlash2, Menu } from 'lucide-react';
import { DesktopMenu } from '@/components/layout/desktop-menu';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>EK Stats - Lead Management & Analytics</title>
        <meta name="description" content="Professional lead management and analytics platform for EarnKaro influencers" />
      </head>
      <body className="min-h-svh bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          <QueryProvider>
            <FilterProvider>
              {/* Enhanced Header */}
              <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm">
                      EK
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-emerald-600">EK Stats</h1>
                      <p className="text-xs text-gray-500 hidden sm:block">Lead Analytics Platform</p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <DesktopMenu />
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 with-bottom-nav-padding">
                {children}
              </main>

              {/* Enhanced Mobile Navigation */}
              <nav
                className="mobile-nav fixed inset-x-0 bottom-0 z-[9999] xl:hidden"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
                aria-label="Primary navigation"
              >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 h-20 mobile-nav-scroll">
                  <Link href="/" className="mobile-nav-item" aria-label="Dashboard">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-xs font-medium">Home</span>
                    <span className="tooltip">Dashboard</span>
                  </Link>
                  <Link href="/funnel" className="mobile-nav-item" aria-label="Funnel Analysis">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-xs font-medium">Funnel</span>
                    <span className="tooltip">Funnel Analysis</span>
                  </Link>
                  <Link href="/leads/detailed" className="mobile-nav-item" aria-label="Detailed Leads">
                    <List className="h-6 w-6" />
                    <span className="text-xs font-medium">Leads</span>
                    <span className="tooltip">Lead Reports</span>
                  </Link>
                  <Link href="/reports/approvals" className="mobile-nav-item" aria-label="Approval Reports">
                    <Filter className="h-6 w-6" />
                    <span className="text-xs font-medium">Approvals</span>
                    <span className="tooltip">Approval Reports</span>
                  </Link>
                  <Link href="/reports/rejection" className="mobile-nav-item" aria-label="Rejection Analysis">
                    <CircleSlash2 className="h-6 w-6" />
                    <span className="text-xs font-medium">Rejection</span>
                    <span className="tooltip">Rejection Analysis</span>
                  </Link>
                  <Link href="/analytics/timeline" className="mobile-nav-item" aria-label="Timeline Analytics">
                    <LineChart className="h-6 w-6" />
                    <span className="text-xs font-medium">Timeline</span>
                    <span className="tooltip">Timeline Analytics</span>
                  </Link>
                </div>
              </nav>
            </FilterProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}