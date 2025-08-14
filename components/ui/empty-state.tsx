"use client";
import React from 'react';
import { Inbox } from 'lucide-react';

type Props = {
  title: string;
  message?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

export function EmptyState({ title, message, ctaLabel, onCtaClick }: Props) {
  return (
    <section role="status" aria-live="polite" className="w-full py-10 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Inbox aria-hidden="true" className="h-6 w-6 text-gray-500" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-900">{title}</h2>
      {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
      {ctaLabel && (
        <button
          type="button"
          onClick={onCtaClick}
          className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={ctaLabel}
        >
          {ctaLabel}
        </button>
      )}
    </section>
  );
}

