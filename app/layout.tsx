import '../styles/globals.css';
import React from 'react';
import Link from 'next/link';
import { Public_Sans } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { FilterProvider } from '@/providers/filter-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { LayoutDashboard, Filter, LineChart, List, BarChart3, CircleSlash2 } from 'lucide-react';
import { DesktopMenu } from '@/components/layout/desktop-menu';

const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${publicSans.className} min-h-svh bg-gray-50 text-gray-900 antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <FilterProvider>
              <header className="sticky top-0 z-20 border-b bg-white px-4 py-3 md:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                  <h1 className="text-lg font-semibold text-emerald-600">EK Stats</h1>
                  <div className="hidden md:block">
                    <DesktopMenu />
                  </div>
                </div>
              </header>
              <main className="mx-auto max-w-6xl px-4 py-4 md:px-6 lg:px-8 with-bottom-nav-padding xl:pb-8">{children}</main>

              {/* Mobile bottom navigation */}
              {/* Mobile bottom navigation (visible on small screens) */}
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
                    <Filter className="h-7 w-7" />
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
            </FilterProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

