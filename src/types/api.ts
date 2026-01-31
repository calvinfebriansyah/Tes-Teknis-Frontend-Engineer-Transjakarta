/**
 * MBTA V3 API uses JSON:API format.
 * Docs: https://api-v3.mbta.com/docs/swagger/index.html
 */

export type VehicleStatus =
  | 'IN_TRANSIT_TO'
  | 'STOPPED_AT'
  | 'INCOMING_AT'
  | string;

export interface JsonApiResource<T, R = string> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<R, { data: { id: string; type: string } | Array<{ id: string; type: string }> | null }>;
}

export interface VehicleAttributes {
  label: string | null;
  current_status: VehicleStatus | null;
  latitude: number | null;
  longitude: number | null;
  updated_at: string | null;
  bearing?: number | null;
  speed?: number | null;
  occupancy_status?: string | null;
}

export type VehicleResource = JsonApiResource<VehicleAttributes, 'route' | 'trip'>;

export interface RouteAttributes {
  long_name: string | null;
  short_name: string | null;
  description: string | null;
  type: number;
  color: string | null;
  text_color: string | null;
  sort_order: number;
}

export type RouteResource = JsonApiResource<RouteAttributes>;

export interface TripAttributes {
  name: string | null;
  headsign: string | null;
  direction_id: number | null;
  block_id: string | null;
  wheelchair_accessible: number | null;
  bikes_allowed: number | null;
}

export type TripResource = JsonApiResource<TripAttributes, 'route'>;

export interface JsonApiResponse<T> {
  data: T;
  included?: Array<JsonApiResource<Record<string, unknown>>>;
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    total?: number;
  };
}

export interface VehiclesResponse {
  data: VehicleResource[];
  included?: (RouteResource | TripResource)[];
  links?: { first?: string; last?: string; prev?: string | null; next?: string | null };
  meta?: { total?: number };
}

export interface RoutesResponse {
  data: RouteResource[];
  links?: { first?: string; last?: string; prev?: string | null; next?: string | null };
}

export interface TripsResponse {
  data: TripResource[];
  links?: { first?: string; last?: string; prev?: string | null; next?: string | null };
}

export interface ApiError {
  errors?: Array<{ title?: string; detail?: string; status?: string }>;
  message?: string;
}
