import { useCallback, useEffect, useState } from 'react';

import { api, type Health } from './api';

/** UI state lives in the URL so a restart (or a shared link) keeps scope, tab, and tool. */
export function useUrlState() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search));

  const update = useCallback((patch: Record<string, string | null>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === '') next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
      return next;
    });
  }, []);

  return [params, update] as const;
}

/** Polls /api/health. bootId changes whenever tsx restarts the server after a toolkit edit. */
export function useHealth(intervalMs = 2000) {
  const [health, setHealth] = useState<Health | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const next = await api.health();
        if (!alive) return;
        setOffline(false);
        setHealth((prev) => (prev?.bootId === next.bootId ? prev : next));
      } catch {
        if (alive) setOffline(true);
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), intervalMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return { health, offline };
}
