'use client';
import * as React from 'react';
import { fetchJson } from '@/lib/api-helpers';
import { CONFIG } from '@/lib/config';

type DebugData = {
  server: {
    clampMonth: string;
    currency: string;
    env: Record<string, string | null>;
  };
};

export default function DebugConfigPage() {
  const [data, setData] = React.useState<DebugData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    fetchJson<DebugData>('/api/v1/debug/config')
      .then(d => { if (mounted) { setData(d); setLoading(false); } })
      .catch(e => { if (mounted) { setError(String(e.message || e)); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  const clientClamp = CONFIG.CURRENT_DATA_MAX_MONTH;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Debug: Config</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border p-3">
          <div className="font-medium">Client</div>
          <div className="text-sm">clampMonth: <span className="font-mono">{clientClamp}</span></div>
          <div className="text-sm">NEXT_PUBLIC_CURRENT_DATA_MAX_MONTH: <span className="font-mono">{process.env.NEXT_PUBLIC_CURRENT_DATA_MAX_MONTH ?? 'null'}</span></div>
        </div>
        <div className="rounded border p-3">
          <div className="font-medium">Server</div>
          {loading && <div className="text-sm">Loading…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {data && (
            <div className="space-y-1 text-sm">
              <div>clampMonth: <span className="font-mono">{data.server.clampMonth}</span></div>
              <div>env.NEXT_PUBLIC_CURRENT_DATA_MAX_MONTH: <span className="font-mono">{String(data.server.env.NEXT_PUBLIC_CURRENT_DATA_MAX_MONTH)}</span></div>
              <div>env.CURRENT_DATA_MAX_MONTH: <span className="font-mono">{String(data.server.env.CURRENT_DATA_MAX_MONTH)}</span></div>
              <div>env.USE_MOCK: <span className="font-mono">{String(data.server.env.USE_MOCK)}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


