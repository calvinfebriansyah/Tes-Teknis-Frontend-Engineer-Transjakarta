import { useState, useEffect, useCallback } from 'react';
import { fetchVehicles, ApiError } from '../services/api';
import type { VehicleResource, RouteResource, TripResource } from '../types/api';

export interface UseVehiclesState {
  vehicles: VehicleResource[];
  included: { routes: RouteResource[]; trips: TripResource[] };
  total: number;
  loading: boolean;
  error: string | null;
}

/** Jumlah maksimal data yang di-fetch sekali dari API (untuk pagination client-side). */
export const VEHICLES_FETCH_LIMIT = 100;

export interface UseVehiclesOptions {
  filterRoute: string[];
  filterTrip: string[];
}

export function useVehicles(options: UseVehiclesOptions) {
  const [state, setState] = useState<UseVehiclesState>({
    vehicles: [],
    included: { routes: [], trips: [] },
    total: 0,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchVehicles({
        pageLimit: VEHICLES_FETCH_LIMIT,
        pageOffset: 0,
        filterRoute: options.filterRoute.length ? options.filterRoute : undefined,
        filterTrip: options.filterTrip.length ? options.filterTrip : undefined,
      });

      const routes: RouteResource[] = [];
      const trips: TripResource[] = [];
      (res.included || []).forEach((inc) => {
        if (inc.type === 'route') routes.push(inc as RouteResource);
        if (inc.type === 'trip') trips.push(inc as TripResource);
      });

      setState({
        vehicles: res.data,
        included: { routes, trips },
        total: res.data.length,
        loading: false,
        error: null,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Gagal memuat data kendaraan. Periksa koneksi atau coba lagi.';
      setState((s) => ({
        ...s,
        loading: false,
        error: msg,
      }));
    }
  }, [options.filterRoute.join(','), options.filterTrip.join(',')]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
