import '../styles/globals.css';
import '@/styles/tooltip.css';
import React from 'react';
import Link from 'next/link';
import { Public_Sans } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { FilterProvider } from '@/providers/filter-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { DesktopMenu } from '@/components/layout/desktop-menu';
import { BottomNav } from '@/components/layout/bottom-nav';

const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export const metadata = {
  title: 'EK Stats',
  icons: { icon: '/favicon.svg' },
};

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
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                  {/* Desktop: hamburger at far-left */}
                  <div className="hidden md:block">
                    <DesktopMenu />
                  </div>
                  <h1 className="text-lg font-semibold text-emerald-600">EK Stats</h1>
                  <div className="ml-auto" />
                </div>
              </header>
              <main className="mx-auto max-w-6xl px-4 py-4 md:px-6 lg:px-8 with-bottom-nav-padding xl:pb-8">{children}</main>

              <BottomNav />
            </FilterProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

