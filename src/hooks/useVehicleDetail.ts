import { useState, useCallback, useEffect } from 'react';
import { fetchVehicleById, ApiError } from '../services/api';
import type { VehicleResource, RouteResource, TripResource } from '../types/api';

export interface VehicleDetailState {
  vehicle: VehicleResource | null;
  route: RouteResource | null;
  trip: TripResource | null;
  loading: boolean;
  error: string | null;
}

export function useVehicleDetail(vehicleId: string | null) {
  const [state, setState] = useState<VehicleDetailState>({
    vehicle: null,
    route: null,
    trip: null,
    loading: false,
    error: null,
  });

  const load = useCallback(async (id: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetchVehicleById(id);
      let route: RouteResource | null = null;
      let trip: TripResource | null = null;
      (res.included || []).forEach((inc) => {
        if (inc.type === 'route') route = inc as RouteResource;
        if (inc.type === 'trip') trip = inc as TripResource;
      });
      setState({
        vehicle: res.data,
        route,
        trip,
        loading: false,
        error: null,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Gagal memuat detail kendaraan.';
      setState((s) => ({
        ...s,
        loading: false,
        error: msg,
      }));
    }
  }, []);

  useEffect(() => {
    if (vehicleId) load(vehicleId);
    else setState({ vehicle: null, route: null, trip: null, loading: false, error: null });
  }, [vehicleId, load]);

  return state;
}
