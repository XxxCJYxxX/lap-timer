export interface GeocoderResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search places via Nominatim (OSM geocoder).
 * Free, no API key. Rate limit: 1 req/s.
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocoderResult[]> {
  if (!query.trim()) return [];

  const url = new URL(`${NOMINATIM_URL}/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '6');
  url.searchParams.set('accept-language', 'zh,en');
  url.searchParams.set('addressdetails', '0');

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      'User-Agent': 'LapTimer/0.1 (local dev)',
    },
  });

  if (!res.ok) throw new Error(`Geocoder error: ${res.status}`);
  return res.json();
}

/**
 * Reverse geocode: coordinates → place name
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string | null> {
  const url = new URL(`${NOMINATIM_URL}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('accept-language', 'zh,en');
  url.searchParams.set('zoom', '16');

  const res = await fetch(url.toString(), {
    signal,
    headers: { 'User-Agent': 'LapTimer/0.1 (local dev)' },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.display_name ?? null;
}

/** Format a geocoder result for display — extract city/district/name */
export function formatGeocoderLabel(result: GeocoderResult): string {
  // display_name is usually "Place, City, State, Country"
  // Just take the first 3 comma-separated parts
  const parts = result.display_name.split(',').map((s) => s.trim());
  return parts.slice(0, 3).join(', ');
}
