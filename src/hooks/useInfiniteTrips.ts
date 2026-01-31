import { useState, useCallback, useRef } from 'react';
import { fetchTrips, ApiError } from '../services/api';
import type { TripResource } from '../types/api';

const PAGE_SIZE = 20;

export function useInfiniteTrips(filterRouteIds: string[]) {
  const [trips, setTrips] = useState<TripResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const filterKey = filterRouteIds.join(',');

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    // MBTA Trips API membutuhkan setidaknya satu filter (mis. filter[route])
    if (filterRouteIds.length === 0) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTrips({
        pageLimit: PAGE_SIZE,
        pageOffset: offsetRef.current,
        filterRoute: filterRouteIds,
      });
      setTrips((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTrips = res.data.filter((t) => !existingIds.has(t.id));
        return newTrips.length === 0 ? prev : [...prev, ...newTrips];
      });
      offsetRef.current += res.data.length;
      setHasMore(res.data.length === PAGE_SIZE);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Gagal memuat daftar trip.';
      setError(msg);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, filterKey]);

  const reset = useCallback(() => {
    setTrips([]);
    offsetRef.current = 0;
    setHasMore(true);
    setError(null);
  }, []);

  return { trips, loading, error, hasMore, loadMore, reset };
}
