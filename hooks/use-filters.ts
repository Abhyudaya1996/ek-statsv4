"use client";
import React from 'react';
import { FilterContext } from '@/providers/filter-provider';

export function useFilters() {
  const ctx = React.useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return ctx;
}

