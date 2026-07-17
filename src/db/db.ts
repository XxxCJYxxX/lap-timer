import Dexie, { type Table } from 'dexie';
import type { Route, LapRecord } from '../types';

class LapTimerDB extends Dexie {
  routes!: Table<Route, number>;
  records!: Table<LapRecord, number>;

  constructor() {
    super('LapTimerDB');
    this.version(1).stores({
      routes: '++id, name, createdAt',
      records: '++id, routeId, timestamp',
    });
  }
}

export const db = new LapTimerDB();
