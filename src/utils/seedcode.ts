import type { Waypoint } from '../types';

/**
 * Google Polyline encoding — compact waypoint serialization.
 * Turns [{lat, lng}, ...] into a ~30-char string like "s`seFi~rjOp..."
 */
export function encodePolyline(waypoints: Waypoint[]): string {
  let prevLat = 0, prevLng = 0, out = '';
  for (const { lat, lng } of waypoints) {
    out += encodeNumber(Math.round(lat * 1e5) - prevLat);
    out += encodeNumber(Math.round(lng * 1e5) - prevLng);
    prevLat = Math.round(lat * 1e5);
    prevLng = Math.round(lng * 1e5);
  }
  return out;
}

export function decodePolyline(str: string): Waypoint[] {
  let i = 0, lat = 0, lng = 0;
  const out: Waypoint[] = [];
  while (i < str.length) {
    let b: number, shift = 0, result = 0;
    do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    lng += dlng;
    out.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return out;
}

function encodeNumber(num: number): string {
  let v = num < 0 ? ~(num << 1) : (num << 1);
  let out = '';
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  out += String.fromCharCode(v + 63);
  return out;
}
