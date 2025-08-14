"use client";
import Link from 'next/link';

export default function ReportsHub() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/reports/approvals" className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50">
            <h2 className="text-lg font-semibold">Approvals</h2>
            <p className="text-sm text-gray-600">Bank performance, rates, and averages</p>
          </Link>
          <Link href="/reports/rejection" className="rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50">
            <h2 className="text-lg font-semibold">Rejection Report</h2>
            <p className="text-sm text-gray-600">Bank-wise rejections and reasons</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
