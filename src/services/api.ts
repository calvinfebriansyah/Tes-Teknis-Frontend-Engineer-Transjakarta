/**
 * MBTA V3 API client.
 * Di development: pakai /api (di-proxy Vite ke api-v3.mbta.com) agar tidak kena CORS.
 * Di production: langsung ke api-v3.mbta.com (perlu backend proxy atau API yang allow CORS).
 * Optional: set VITE_MBTA_API_KEY di .env untuk limit lebih tinggi.
 */

const BASE_URL = import.meta.env.DEV ? '/api' : 'https://api-v3.mbta.com'; /** */

function getHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_MBTA_API_KEY as string | undefined;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };
  if (key) headers['x-api-key'] = key;
  return headers;
}

export class ApiError extends Error {
  status: number | undefined;
  body: unknown;
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {/** */
  const text = await res.text();
  let json: T | { errors?: Array<{ title?: string; detail?: string }> } = null as T;
  try {
    json = JSON.parse(text) as T;
  } catch {
    if (!res.ok) throw new ApiError(text || res.statusText, res.status);
    throw new ApiError('Invalid JSON response', res.status);
  }

  if (!res.ok) {
    const err = json as { errors?: Array<{ title?: string; detail?: string }> };
    const msg =
      err?.errors?.[0]?.detail ||
      err?.errors?.[0]?.title ||
      (json as { message?: string })?.message ||
      res.statusText;
    throw new ApiError(msg, res.status, json);
  }

  return json as T;
}

export interface FetchVehiclesParams {
  pageLimit?: number;
  pageOffset?: number;
  filterRoute?: string[];
  filterTrip?: string[];
}

function buildQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

export async function fetchVehicles(
  params: FetchVehiclesParams = {}
): Promise<import('../types/api').VehiclesResponse> {
  const q: Record<string, string> = {
    'page[limit]': String(params.pageLimit ?? 10),
    'page[offset]': String(params.pageOffset ?? 0),
    include: 'route,trip',
  };
  if (params.filterRoute?.length) {
    q['filter[route]'] = params.filterRoute.join(',');
  }
  if (params.filterTrip?.length) {
    q['filter[trip]'] = params.filterTrip.join(',');
  }
  const query = buildQuery(q);
  const res = await fetch(`${BASE_URL}/vehicles?${query}`, { /** */
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function fetchVehicleById(
  id: string
): Promise<{
  data: import('../types/api').VehicleResource;
  included?: (import('../types/api').RouteResource | import('../types/api').TripResource)[];
}> {
  const res = await fetch(
    `${BASE_URL}/vehicles/${encodeURIComponent(id)}?include=route,trip`,
    { headers: getHeaders() }
  );
  return handleResponse(res);
}

export interface FetchRoutesParams {
  pageLimit?: number;
  pageOffset?: number;
}

export async function fetchRoutes(
  params: FetchRoutesParams = {}
): Promise<import('../types/api').RoutesResponse> {
  const query = buildQuery({
    'page[limit]': String(params.pageLimit ?? 20),
    'page[offset]': String(params.pageOffset ?? 0),
  });
  const res = await fetch(`${BASE_URL}/routes?${query}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export interface FetchTripsParams {
  pageLimit?: number;
  pageOffset?: number;
  filterRoute?: string[];
}

export async function fetchTrips(
  params: FetchTripsParams = {}
): Promise<import('../types/api').TripsResponse> {
  const q: Record<string, string> = {
    'page[limit]': String(params.pageLimit ?? 20),
    'page[offset]': String(params.pageOffset ?? 0),
  };
  if (params.filterRoute?.length) {
    q['filter[route]'] = params.filterRoute.join(',');
  }
  const query = buildQuery(q);
  const res = await fetch(`${BASE_URL}/trips?${query}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}
