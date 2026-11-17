'use client';

import { useEffect, useRef, useState } from 'react';
import { STATUS_URL } from './links';

type StatusState =
  | 'operational'
  | 'degraded'
  | 'downtime'
  | 'maintenance'
  | 'unknown';

const LABELS: Record<StatusState, string> = {
  operational: 'All systems operational',
  degraded: 'Degraded performance',
  downtime: 'Service disruption',
  maintenance: 'Under maintenance',
  unknown: 'System status',
};

function isStatusState(value: unknown): value is StatusState {
  return typeof value === 'string' && value in LABELS;
}

/**
 * Live status light for the footer, linking to the status page.
 *
 * The state comes from /api/status (a Pages Function on our own domain that
 * reads Better Stack server-side), fetched only once the footer is about to
 * scroll into view. Until then, or if the request fails, it shows a neutral
 * grey "System status" link: the light is never green on a guess.
 */
export function StatusIndicator() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [state, setState] = useState<StatusState>('unknown');

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/status');
        const body: unknown = response.ok ? await response.json() : null;
        const next = (body as { state?: unknown } | null)?.state;
        if (!cancelled && isStatusState(next)) {
          setState(next);
        }
      } catch {
        // Keep the neutral link.
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  if (!STATUS_URL) {
    return null;
  }

  return (
    <a
      className="status-indicator"
      data-state={state}
      href={STATUS_URL}
      ref={ref}
      rel="noopener"
      target="_blank"
    >
      <span aria-hidden="true" className="status-dot" />
      {LABELS[state]}
    </a>
  );
}
