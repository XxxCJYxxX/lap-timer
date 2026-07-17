import { create } from 'zustand';
import { db } from '../db/db';
import type { LapRecord } from '../types';

interface RecordsState {
  records: LapRecord[];
  loadRecords: (routeId: number) => Promise<void>;
}

export const useRecordsStore = create<RecordsState>((set) => ({
  records: [],
  loadRecords: async (routeId: number) => {
    const records = await db.records.where('routeId').equals(routeId).reverse().sortBy('timestamp');
    set({ records });
  },
}));
