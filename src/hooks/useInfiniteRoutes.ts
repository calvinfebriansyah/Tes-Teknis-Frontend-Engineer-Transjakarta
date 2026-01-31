import { useState, useCallback, useRef } from 'react';
import { fetchRoutes, ApiError } from '../services/api';
import type { RouteResource } from '../types/api';

const PAGE_SIZE = 100;

export function useInfiniteRoutes() {
  const [routes, setRoutes] = useState<RouteResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRoutes({
        pageLimit: PAGE_SIZE,
        pageOffset: offsetRef.current,
      });
      setRoutes((prev) => [...prev, ...res.data]);
      offsetRef.current += res.data.length;
      setHasMore(res.data.length === PAGE_SIZE);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Gagal memuat daftar rute.';
      setError(msg);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setRoutes([]);
    offsetRef.current = 0;
    setHasMore(true);
    setError(null);
  }, []);

  return { routes, loading, error, hasMore, loadMore, reset };
}
