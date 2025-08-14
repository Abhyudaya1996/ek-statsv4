"use client";
import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

type Props = {
  title: string;
  message?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
  showRetry?: boolean;
};

export function EmptyState({ 
  title, 
  message, 
  ctaLabel, 
  onCtaClick, 
  icon,
  showRetry = false 
}: Props) {
  return (
    <section role="status" aria-live="polite" className="empty-state fade-in">
      <div className="empty-icon">
        {icon || <Inbox className="w-full h-full" />}
      </div>
      <h2 className="empty-title">{title}</h2>
      {message && <p className="empty-message">{message}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {showRetry && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
            aria-label="Retry loading data"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        )}
        {ctaLabel && onCtaClick && (
          <button
            type="button"
            onClick={onCtaClick}
            className="btn btn-primary"
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </section>
  );
}