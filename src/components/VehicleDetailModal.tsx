import { useEffect, useRef } from 'react';
import type { VehicleResource, RouteResource, TripResource } from '../types/api';

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/** URL peta statis OpenStreetMap (tidak bisa digerakkan), terpusat di lat,lng */
function staticMapEmbedUrl(lat: number, lng: number): string {
  const delta = 0.012;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',');
  const marker = `${lat},${lng}`;
  const params = new URLSearchParams({
    bbox,
    layer: 'mapnik',
    marker,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

interface VehicleDetailModalProps {
  vehicle: VehicleResource | null;
  route: RouteResource | null;
  trip: TripResource | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function VehicleDetailModal({
  vehicle,
  route,
  trip,
  loading,
  error,
  onClose,
}: VehicleDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      dialog.close();
    };
  }, []);

  const lat = vehicle?.attributes?.latitude ?? null;
  const lng = vehicle?.attributes?.longitude ?? null;
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="w-[95vw] max-w-4xl rounded-xl border border-slate-200 bg-white p-0 shadow-2xl"
      style={{ maxHeight: '90vh' }}
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
          Detail Kendaraan
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Tutup"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex max-h-[calc(90vh-4rem)] flex-col overflow-hidden p-4 sm:p-5">
        {loading && (
          <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-4 text-slate-500">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />
            <span className="text-sm font-medium">Memuat detail kendaraan…</span>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            <p className="font-medium">Gagal memuat detail</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && vehicle && (
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Informasi Kendaraan
                </h3>
                <dl className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="text-xs font-medium uppercase text-slate-500">Label</dt>
                    <dd className="mt-0.5 truncate font-semibold text-slate-900">
                      {vehicle.attributes?.label ?? vehicle.id}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
                    <dd className="mt-0.5 truncate font-semibold text-slate-900">
                      {vehicle.attributes?.current_status ?? '—'}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="text-xs font-medium uppercase text-slate-500">Latitude</dt>
                    <dd className="mt-0.5 font-mono text-sm text-slate-800">
                      {lat != null ? Number(lat).toFixed(5) : '—'}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="text-xs font-medium uppercase text-slate-500">Longitude</dt>
                    <dd className="mt-0.5 font-mono text-sm text-slate-800">
                      {lng != null ? Number(lng).toFixed(5) : '—'}
                    </dd>
                  </div>
                  <div className="col-span-2 rounded-lg bg-slate-50 p-2.5">
                    <dt className="text-xs font-medium uppercase text-slate-500">Waktu update</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800">
                      {formatTime(vehicle.attributes?.updated_at ?? null)}
                    </dd>
                  </div>
                </dl>
              </section>

              {(route || trip) && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rute & Trip
                  </h3>
                  <dl className="grid grid-cols-2 gap-2">
                    {route && (
                      <div className="rounded-lg bg-amber-50 p-2.5">
                        <dt className="text-xs font-medium uppercase text-amber-700">Rute</dt>
                        <dd className="mt-0.5 truncate text-sm font-medium text-slate-900">
                          {route.attributes?.long_name ??
                            route.attributes?.short_name ??
                            route.id}
                        </dd>
                      </div>
                    )}
                    {trip && (
                      <div className="rounded-lg bg-amber-50 p-2.5">
                        <dt className="text-xs font-medium uppercase text-amber-700">Trip</dt>
                        <dd className="mt-0.5 truncate text-sm font-medium text-slate-900">
                          {trip.attributes?.headsign ??
                            trip.attributes?.name ??
                            trip.id}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}
            </div>

            {hasCoords && (
              <section className="flex shrink-0 flex-col">
                <h3 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Posisi di Peta
                </h3>
                <div
                  className="relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  style={{ height: 300, width: '100%' }}
                >
                  <iframe
                    title="Posisi kendaraan di peta"
                    src={staticMapEmbedUrl(lat, lng)}
                    className="pointer-events-none h-full w-full border-0"
                    style={{ display: 'block' }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Koordinat: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
