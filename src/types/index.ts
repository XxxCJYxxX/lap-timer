export interface Route {
  id?: number;
  name: string;
  startLat: number;
  startLng: number;
  finishLat: number;
  finishLng: number;
  createdAt: number;
}

export interface LapRecord {
  id?: number;
  routeId: number;
  timeMs: number;
  timestamp: number;
}

export type TimerStatus = 'idle' | 'running' | 'stopped';

export type RecordColor = 'purple' | 'green' | 'yellow' | null;

export type TileProvider = 'osm' | 'amap';
