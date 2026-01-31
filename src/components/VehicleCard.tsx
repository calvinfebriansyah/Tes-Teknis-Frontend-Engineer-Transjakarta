import type { VehicleResource, RouteResource, TripResource } from '../types/api';

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function getStatusBadgeClass(status: string): string {
  const s = String(status).toUpperCase();
  if (s === 'STOPPED_AT') return 'bg-slate-100 text-slate-600';
  if (s === 'IN_TRANSIT_TO') return 'bg-emerald-50 text-emerald-700';
  if (s === 'INCOMING_AT') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

interface VehicleCardProps {
  vehicle: VehicleResource;
  route?: RouteResource | null;
  trip?: TripResource | null;
  onClick: () => void;
}

export function VehicleCard({ vehicle, route, trip, onClick }: VehicleCardProps) {
  const attrs = vehicle.attributes;
  const label = attrs.label ?? vehicle.id;
  const status = attrs.current_status ?? '—';
  const lat = attrs.latitude ?? '—';
  const lng = attrs.longitude ?? '—';
  const updated = formatTime(attrs.updated_at);
  const routeLabel = route?.attributes?.long_name ?? route?.attributes?.short_name ?? route?.id ?? null;
  const tripLabel = trip?.attributes?.headsign ?? trip?.attributes?.name ?? trip?.id ?? null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base font-bold text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700">
            {String(label).slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {label}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {routeLabel ?? 'Kendaraan'}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(status)}`}
        >
          {status}
        </span>
      </div>

      {(routeLabel || tripLabel) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {routeLabel && (
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
              Rute: {routeLabel}
            </span>
          )}
          {tripLabel && (
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              Trip: {tripLabel}
            </span>
          )}
        </div>
      )}

      <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <div className="flex justify-between gap-2 text-sm">
          <dt className="text-slate-500">Latitude</dt>
          <dd className="font-medium text-slate-800 tabular-nums">
            {typeof lat === 'number' ? lat.toFixed(5) : lat}
          </dd>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <dt className="text-slate-500">Longitude</dt>
          <dd className="font-medium text-slate-800 tabular-nums">
            {typeof lng === 'number' ? lng.toFixed(5) : lng}
          </dd>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <dt className="text-slate-500">Update terakhir</dt>
          <dd className="font-medium text-slate-800 text-slate-700">{updated}</dd>
        </div>
      </dl>

      <p className="mt-5 flex items-center gap-1.5 text-sm font-medium text-amber-600 group-hover:text-amber-700">
        Lihat detail
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </p>
    </article>
  );
}
