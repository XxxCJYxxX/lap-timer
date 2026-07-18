import { create } from 'zustand';
import { db } from '../db/db';
import { computeColor } from '../utils/color';
import { fetchWeather } from '../utils/weather';
import { useRouteStore } from './routeStore';
import type { TimerStatus, LapRecord, Weather } from '../types';

type AutoPhase = 'waiting_start' | 'leaving_start' | 'heading_to_finish';
export type LightPhase = 'idle' | 'light1' | 'light2' | 'light3' | 'light4' | 'light5' | 'go';

interface TimerState {
  status: TimerStatus;
  startTime: number | null;
  elapsed: number;
  lastRecord: LapRecord | null;
  lastRecordColor: string | null;
  autoMode: boolean;
  autoPhase: AutoPhase;
  distanceToTarget: number | null;
  currentSpeed: number | null;
  maxSpeed: number | null;
  lightPhase: LightPhase;
  followMode: boolean;
  splits: number[];
  splitStartTime: number | null;
  weather: Weather | null;

  start: () => void;
  tick: () => void;
  captureSplit: () => void;
  stop: () => Promise<LapRecord | null>;
  reset: () => void;
  toggleAutoMode: () => void;
  setDistance: (d: number | null) => void;
  setAutoPhase: (p: AutoPhase) => void;
  setSpeed: (kmh: number) => void;
  setLightPhase: (p: LightPhase) => void;
  setFollowMode: (v: boolean) => void;
  beginStartSequence: () => void;
  _fetchWeather: () => Promise<void>;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const useTimerStore = create<TimerState>((set, get) => ({
  status: 'idle',
  startTime: null,
  elapsed: 0,
  lastRecord: null,
  lastRecordColor: null,
  autoMode: false,
  autoPhase: 'waiting_start',
  distanceToTarget: null,
  currentSpeed: null,
  maxSpeed: null,
  lightPhase: 'idle',
  followMode: false,
  splits: [],
  splitStartTime: null,
  weather: null,

  start: () => {
    get()._fetchWeather();
    set({
      status: 'running', startTime: performance.now(), elapsed: 0,
      lastRecord: null, lastRecordColor: null,
      autoPhase: 'leaving_start', currentSpeed: null, maxSpeed: null,
      lightPhase: 'idle', followMode: true,
      splits: [], splitStartTime: performance.now(), weather: null,
    });
  },

  tick: () => {
    const { status, startTime } = get();
    if (status !== 'running' || !startTime) return;
    set({ elapsed: performance.now() - startTime });
  },

  captureSplit: () => {
    const { status, splitStartTime } = get();
    if (status !== 'running' || !splitStartTime) return;
    const now = performance.now();
    set((s) => ({
      splits: [...s.splits, Math.round(now - splitStartTime)],
      splitStartTime: now,
    }));
  },

  stop: async () => {
    const { startTime, splits, splitStartTime, weather } = get();
    if (!startTime) return null;

    const elapsed = performance.now() - startTime;
    const timeMs = Math.round(elapsed);

    // Capture final split if there's an active segment
    const finalSplits = [...splits];
    if (splitStartTime !== null) {
      finalSplits.push(Math.round(performance.now() - splitStartTime));
    }

    const activeId = useRouteStore.getState().activeRouteId;
    if (!activeId) {
      set({ status: 'idle', startTime: null, elapsed: 0, autoPhase: 'waiting_start', followMode: false, splits: [], splitStartTime: null });
      return null;
    }

    const existing = await db.records.where('routeId').equals(activeId).toArray();
    const color = existing.length === 0 ? 'purple' : computeColor(existing, timeMs);

    const record: LapRecord = { routeId: activeId, timeMs, splits: finalSplits, weather: weather ?? undefined, timestamp: Date.now() };
    const id = await db.records.add(record);
    set({
      status: 'stopped', startTime: null, elapsed,
      lastRecord: { ...record, id }, lastRecordColor: color,
      autoPhase: 'waiting_start', followMode: false,
      splits: finalSplits, splitStartTime: null,
    });

    return { ...record, id };
  },

  reset: () => {
    set({
      status: 'idle', startTime: null, elapsed: 0,
      lastRecord: null, lastRecordColor: null,
      distanceToTarget: null, autoPhase: 'waiting_start',
      lightPhase: 'idle', followMode: false,
      splits: [], splitStartTime: null, weather: null,
    });
  },

  toggleAutoMode: () => {
    const next = !get().autoMode;
    set({ autoMode: next, distanceToTarget: next ? 0 : null, autoPhase: 'waiting_start' });
  },

  setDistance: (d) => set({ distanceToTarget: d }),
  setAutoPhase: (p) => set({ autoPhase: p }),

  setSpeed: (kmh) => set((s) => ({
    currentSpeed: kmh,
    maxSpeed: s.maxSpeed === null ? kmh : Math.max(s.maxSpeed, kmh),
  })),

  setLightPhase: (p) => set({ lightPhase: p }),
  setFollowMode: (v) => set({ followMode: v }),

  beginStartSequence: async () => {
    const phases: LightPhase[] = ['light1', 'light2', 'light3', 'light4', 'light5'];
    get().setLightPhase('light1');
    for (let i = 1; i < phases.length; i++) {
      await sleep(600);
      get().setLightPhase(phases[i]);
    }
    await sleep(500 + Math.random() * 1500);
    get().setLightPhase('go');
    await sleep(80);
    get().start();
  },

  _fetchWeather: async () => {
    const route = useRouteStore.getState().getActiveRoute();
    if (!route || route.waypoints.length === 0) return;
    const wp = route.waypoints[0];
    const w = await fetchWeather(wp.lat, wp.lng);
    if (w) set({ weather: w });
  },
}));
