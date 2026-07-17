import { create } from 'zustand';
import { db } from '../db/db';
import { computeColor } from '../utils/color';
import { useRouteStore } from './routeStore';
import type { TimerStatus, LapRecord } from '../types';

type AutoPhase = 'waiting_start' | 'leaving_start' | 'heading_to_finish';

interface TimerState {
  status: TimerStatus;
  startTime: number | null;
  elapsed: number;
  lastRecord: LapRecord | null;
  lastRecordColor: string | null;
  autoMode: boolean;
  autoPhase: AutoPhase;
  distanceToTarget: number | null;

  start: () => void;
  tick: () => void;
  stop: () => Promise<LapRecord | null>;
  reset: () => void;
  toggleAutoMode: () => void;
  setDistance: (d: number | null) => void;
  setAutoPhase: (p: AutoPhase) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  status: 'idle',
  startTime: null,
  elapsed: 0,
  lastRecord: null,
  lastRecordColor: null,
  autoMode: false,
  autoPhase: 'waiting_start',
  distanceToTarget: null,

  start: () => {
    set({
      status: 'running', startTime: performance.now(), elapsed: 0,
      lastRecord: null, lastRecordColor: null,
      autoPhase: 'leaving_start',
    });
  },

  tick: () => {
    const { status, startTime } = get();
    if (status !== 'running' || !startTime) return;
    set({ elapsed: performance.now() - startTime });
  },

  stop: async () => {
    const { startTime } = get();
    if (!startTime) return null;

    const elapsed = performance.now() - startTime;
    const timeMs = Math.round(elapsed);

    const activeId = useRouteStore.getState().activeRouteId;
    if (!activeId) {
      set({ status: 'idle', startTime: null, elapsed: 0, autoPhase: 'waiting_start' });
      return null;
    }

    const existing = await db.records.where('routeId').equals(activeId).toArray();
    const color = existing.length === 0 ? 'purple' : computeColor(existing, timeMs);

    const record: LapRecord = { routeId: activeId, timeMs, timestamp: Date.now() };
    const id = await db.records.add(record);
    set({
      status: 'stopped', startTime: null, elapsed,
      lastRecord: { ...record, id }, lastRecordColor: color,
      autoPhase: 'waiting_start',
    });

    return { ...record, id };
  },

  reset: () => {
    set({
      status: 'idle', startTime: null, elapsed: 0,
      lastRecord: null, lastRecordColor: null,
      distanceToTarget: null, autoPhase: 'waiting_start',
    });
  },

  toggleAutoMode: () => {
    const next = !get().autoMode;
    set({ autoMode: next, distanceToTarget: next ? 0 : null, autoPhase: 'waiting_start' });
  },

  setDistance: (d) => set({ distanceToTarget: d }),

  setAutoPhase: (p) => set({ autoPhase: p }),
}));
