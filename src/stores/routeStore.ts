import { create } from 'zustand';
import { db } from '../db/db';
import { toStorageCoords } from '../utils/coord';
import type { Route } from '../types';

interface RouteState {
  routes: Route[];
  activeRouteId: number | null;
  isCreating: boolean;
  createStep: 'start' | 'finish' | 'name';
  draftStart: [number, number] | null;
  draftFinish: [number, number] | null;

  loadRoutes: () => Promise<void>;
  setActiveRoute: (id: number) => void;
  startCreate: () => void;
  setStart: (lng: number, lat: number) => void;
  setFinish: (lng: number, lat: number) => void;
  saveRoute: (name: string) => Promise<Route>;
  cancelCreate: () => void;
  deleteRoute: (id: number) => Promise<void>;
  getActiveRoute: () => Route | undefined;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  activeRouteId: null,
  isCreating: false,
  createStep: 'start',
  draftStart: null,
  draftFinish: null,

  loadRoutes: async () => {
    const routes = await db.routes.orderBy('createdAt').reverse().toArray();
    set({ routes });
  },

  setActiveRoute: (id) => {
    set({ activeRouteId: id, isCreating: false, createStep: 'start', draftStart: null, draftFinish: null });
  },

  startCreate: () => {
    set({ isCreating: true, createStep: 'start', draftStart: null, draftFinish: null, activeRouteId: null });
  },

  setStart: (lng, lat) => {
    const [slng, slat] = toStorageCoords(lng, lat);
    set({ draftStart: [slat, slng], createStep: 'finish' });
  },

  setFinish: (lng, lat) => {
    const [flng, flat] = toStorageCoords(lng, lat);
    set({ draftFinish: [flat, flng], createStep: 'name' });
  },

  saveRoute: async (name) => {
    const { draftStart, draftFinish } = get();
    if (!draftStart || !draftFinish) throw new Error('Missing start or finish');
    const route: Route = {
      name,
      startLat: draftStart[0],
      startLng: draftStart[1],
      finishLat: draftFinish[0],
      finishLng: draftFinish[1],
      createdAt: Date.now(),
    };
    const id = await db.routes.add(route);
    const saved = { ...route, id };
    set((s) => ({
      routes: [saved, ...s.routes],
      isCreating: false,
      createStep: 'start',
      draftStart: null,
      draftFinish: null,
      activeRouteId: id,
    }));
    return saved;
  },

  cancelCreate: () => {
    set({ isCreating: false, createStep: 'start', draftStart: null, draftFinish: null });
  },

  deleteRoute: async (id) => {
    await db.routes.delete(id);
    await db.records.where('routeId').equals(id).delete();
    set((s) => ({
      routes: s.routes.filter((r) => r.id !== id),
      activeRouteId: s.activeRouteId === id ? null : s.activeRouteId,
    }));
  },

  getActiveRoute: () => {
    const { routes, activeRouteId } = get();
    return routes.find((r) => r.id === activeRouteId);
  },
}));
