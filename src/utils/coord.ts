import gcoord from 'gcoord';
import type { TileProvider } from '../types';

let currentProvider: TileProvider = 'osm';

export function getTileProvider(): TileProvider {
  return currentProvider;
}

export function setTileProvider(provider: TileProvider) {
  currentProvider = provider;
}

/**
 * Convert WGS-84 storage coordinates to display coordinates.
 * When using 高德 tiles (GCJ-02), markers must be shifted to align with tiles.
 */
export function toDisplayCoords(lng: number, lat: number): [number, number] {
  if (currentProvider === 'amap') {
    const result = gcoord.transform(
      [lng, lat],
      gcoord.WGS84,
      gcoord.GCJ02
    );
    return [result[0], result[1]];
  }
  return [lng, lat];
}

/**
 * Convert display coordinates (from map clicks) back to WGS-84 for storage.
 */
export function toStorageCoords(lng: number, lat: number): [number, number] {
  if (currentProvider === 'amap') {
    const result = gcoord.transform(
      [lng, lat],
      gcoord.GCJ02,
      gcoord.WGS84
    );
    return [result[0], result[1]];
  }
  return [lng, lat];
}
