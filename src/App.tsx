import { useState, useEffect, useMemo, useCallback } from 'react';
import { useVehicles } from './hooks/useVehicles';
import { useInfiniteRoutes } from './hooks/useInfiniteRoutes';
import { useInfiniteTrips } from './hooks/useInfiniteTrips';
import { useVehicleDetail } from './hooks/useVehicleDetail';
import { VehicleCard } from './components/VehicleCard';
import { Pagination } from './components/Pagination';
import { FilterDropdown } from './components/FilterDropdown';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { PageLoading } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function App() {
  const [pageSize, setPageSize] = useState(12);
  const [pageIndex, setPageIndex] = useState(0);
  const [filterRouteIds, setFilterRouteIds] = useState<string[]>([]);
  /** Arah/tujuan trip (headsign), e.g. "Alewife", "Ashmont". Dipilih user; kita turunkan daftar trip ID ke API. */
  const [filterHeadsigns, setFilterHeadsigns] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { routes, loading: routesLoading, hasMore: routesHasMore, loadMore: loadMoreRoutes, error: routesError } = useInfiniteRoutes();
  const { trips, loading: tripsLoading, hasMore: tripsHasMore, loadMore: loadMoreTrips, reset: resetTrips, error: tripsError } = useInfiniteTrips(filterRouteIds);

  /** Vehicles API hanya difilter by route. Filter by arah (headsign) dilakukan di client dari trip di included. */
  const { vehicles: allVehicles, included, loading: vehiclesLoading, error: vehiclesError, refetch } = useVehicles({
    filterRoute: filterRouteIds,
    filterTrip: [],
  });

  const routeMap = useMemo(() => {
    const m = new Map(included.routes.map((r) => [r.id, r]));
    return m;
  }, [included.routes]);
  const tripMap = useMemo(() => {
    const m = new Map(included.trips.map((t) => [t.id, t]));
    return m;
  }, [included.trips]);

  const getRouteTrip = useCallback(
    (v: (typeof allVehicles)[0]) => {
      const routeData = v.relationships?.route?.data;
      const tripData = v.relationships?.trip?.data;
      const routeId = routeData && !Array.isArray(routeData) ? routeData.id : undefined;
      const tripId = tripData && !Array.isArray(tripData) ? tripData.id : undefined;
      return {
        route: routeId ? routeMap.get(routeId) : undefined,
        trip: tripId ? tripMap.get(tripId) : undefined,
      };
    },
    [routeMap, tripMap]
  );

  /** Filter by arah (headsign) di client: trip yang ada di response vehicles, bukan trip ID dari API trips. */
  const filteredByHeadsign =
    filterHeadsigns.length === 0
      ? allVehicles
      : allVehicles.filter((v) => {
          const { trip } = getRouteTrip(v);
          const h = trip?.attributes?.headsign ?? '';
          return filterHeadsigns.includes(h);
        });

  const filteredByStatus =
    filterStatuses.length === 0
      ? filteredByHeadsign
      : filteredByHeadsign.filter((v) => filterStatuses.includes(v.attributes?.current_status ?? ''));

  const vehicles = filteredByStatus.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const detailState = useVehicleDetail(selectedVehicleId);

  const statusOptions = useMemo(() => {
    const known: string[] = ['IN_TRANSIT_TO', 'STOPPED_AT', 'INCOMING_AT'];
    const fromData = [...new Set(allVehicles.map((v) => v.attributes?.current_status).filter(Boolean))] as string[];
    const combined = [...new Set([...known, ...fromData])].sort();
    return combined.map((s) => ({ id: s, label: s }));
  }, [allVehicles]);

  useEffect(() => {
    setFilterHeadsigns([]);
    resetTrips();
  }, [filterRouteIds.join(','), resetTrips]);

  useEffect(() => {
    setPageIndex(0);
  }, [filterRouteIds.join(','), filterHeadsigns.join(','), filterStatuses.join(',')]);

  useEffect(() => {
    if (routeDropdownOpen && !routesLoading && (routes.length === 0 || routes.length < 50)) {
      loadMoreRoutes();
    }
  }, [routeDropdownOpen, routes.length, routesLoading]);

  useEffect(() => {
    if (tripDropdownOpen && trips.length === 0 && !tripsLoading && filterRouteIds.length > 0) {
      loadMoreTrips();
    }
  }, [tripDropdownOpen, filterRouteIds.length]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  const routeOptions = routes.map((r) => ({
    id: r.id,
    label: r.attributes?.long_name ?? r.attributes?.short_name ?? r.id,
  }));
  /** Opsi arah (headsign): gabungan dari trip di response vehicles (included) + trip dari API trips, supaya Braintree dll muncul. */
  const tripOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: { id: string; label: string }[] = [];
    const add = (h: string) => {
      const trimmed = h.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        out.push({ id: trimmed, label: trimmed });
      }
    };
    for (const t of included.trips) {
      add(t.attributes?.headsign ?? t.attributes?.name ?? '');
    }
    for (const t of trips) {
      add(t.attributes?.headsign ?? t.attributes?.name ?? '');
    }
    return out.sort((a, b) => a.label.localeCompare(b.label));
  }, [included.trips, trips]);

  const displayTotal = filteredByStatus.length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Sistem Manajemen Armada
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Transjakarta · Pantau posisi kendaraan secara real-time
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter */}
        <section className="mb-8" aria-label="Filter kendaraan">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Filter
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saring kendaraan berdasarkan rute, arah (tujuan), dan status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <FilterDropdown
              label="Rute"
              options={routeOptions}
              selectedIds={filterRouteIds}
              onToggle={(id) => {
                setFilterRouteIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              }}
              loading={routesLoading}
              hasMore={routesHasMore}
              onLoadMore={loadMoreRoutes}
              error={routesError}
              open={routeDropdownOpen}
              onOpenChange={setRouteDropdownOpen}
              searchable
            />
            <FilterDropdown
              label="Arah / Trip"
              options={tripOptions}
              selectedIds={filterHeadsigns}
              onToggle={(id) => {
                setFilterHeadsigns((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              }}
              loading={tripsLoading}
              hasMore={tripsHasMore}
              onLoadMore={loadMoreTrips}
              error={tripsError}
              open={tripDropdownOpen}
              onOpenChange={setTripDropdownOpen}
              emptyStateMessage={
                filterRouteIds.length === 0
                  ? 'Pilih satu atau lebih rute terlebih dahulu untuk memuat daftar arah (tujuan).'
                  : undefined
              }
              searchable
            />
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selectedIds={filterStatuses}
              onToggle={(id) => {
                setFilterStatuses((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              }}
              loading={false}
              hasMore={false}
              onLoadMore={() => {}}
              error={null}
              open={statusDropdownOpen}
              onOpenChange={setStatusDropdownOpen}
            />
          </div>
        </section>

        {/* Daftar Kendaraan */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Daftar Kendaraan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Klik kartu untuk melihat detail dan posisi di peta
              </p>
            </div>
          </div>

          {vehiclesLoading && <PageLoading />}
          {vehiclesError && (
            <ErrorMessage message={vehiclesError} onRetry={refetch} />
          )}

          {!vehiclesLoading && !vehiclesError && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((v) => {
                  const { route, trip } = getRouteTrip(v);
                  return (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      route={route}
                      trip={trip}
                      onClick={() => setSelectedVehicleId(v.id)}
                    />
                  );
                })}
              </div>

              {vehicles.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-medium text-slate-800">
                    Tidak ada kendaraan
                  </h3>
                  <p className="mt-2 max-w-sm mx-auto text-sm text-slate-500">
                    Tidak ada data kendaraan untuk filter yang dipilih. Coba ubah filter Rute atau Trip, atau kosongkan filter.
                  </p>
                </div>
              )}

              {vehicles.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    total={displayTotal}
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    onPageChange={setPageIndex}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {selectedVehicleId && (
        <VehicleDetailModal
          vehicle={detailState.vehicle}
          route={detailState.route}
          trip={detailState.trip}
          loading={detailState.loading}
          error={detailState.error}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}
    </div>
  );
}
