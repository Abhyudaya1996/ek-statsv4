"use client";
import React from 'react';

export function Skeleton({ className, 'aria-label': ariaLabel }: { className?: string; 'aria-label'?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel ?? 'Loading'}
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className ?? ''}`}
    />
  );
}

