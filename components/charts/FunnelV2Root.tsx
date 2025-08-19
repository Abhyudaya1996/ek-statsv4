'use client';
import React from 'react';
import FunnelV2 from './FunnelV2';

export default function FunnelV2Root() {
  const [mode, setMode] = React.useState<'both' | 'count' | 'percent'>('both');
  React.useEffect(() => {
    const node = document.querySelector('[data-funnel-root]');
    if (node) (node as any).__setMode = setMode;
  }, []);
  return (
    <div data-funnel-root="">
      <FunnelV2 mode={mode} />
    </div>
  );
}


