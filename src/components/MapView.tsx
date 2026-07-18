import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouteStore } from '../stores/routeStore';
import { useTimerStore } from '../stores/timerStore';
import { useLocationStore } from '../stores/locationStore';
import { toDisplayCoords, getTileProvider, setTileProvider } from '../utils/coord';
import { osmLayer, BASE_LAYERS } from '../utils/tiles';
import { haversine } from '../utils/distance';
import type { TileProvider } from '../types';

// Fix Leaflet default icon paths
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const START_ICON = L.divIcon({
  className: 'start-marker',
  html: `
    <div style="width:36px;height:36px;border-radius:50%;background:var(--green);border:2.5px solid rgba(255,255,255,0.9);
      display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(48,209,88,0.4);">
      <span style="color:#000;font-size:14px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">S</span>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const FINISH_ICON = L.divIcon({
  className: 'finish-marker',
  html: `
    <div style="width:36px;height:36px;border-radius:50%;background:var(--red);border:2.5px solid rgba(255,255,255,0.9);
      display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(255,69,58,0.4);">
      <span style="color:#fff;font-size:14px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">F</span>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const LOCATION_ICON = L.divIcon({
  className: 'location-marker',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div class="location-dot-pulse" style="position:absolute;inset:-12px;border-radius:50%;background:rgba(10,132,255,0.2);"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:#0A84FF;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface Props {
  flyTo?: { lat: number; lng: number; label: string } | null;
  onFlyComplete?: () => void;
}

export default function MapView({ flyTo, onFlyComplete }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const locationWatchId = useRef<number | null>(null);
  const isFollowingRef = useRef(false);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const { isCreating, createStep, draftStart, draftFinish, activeRouteId, routes, setStart, setFinish } = useRouteStore();

  const [/* provider */, setProviderState] = useState<TileProvider>(getTileProvider());
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.9042, 116.4074],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      layers: [osmLayer],
    });

    // Glass-styled zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer switcher
    const layerControl = L.control.layers(BASE_LAYERS, undefined, { position: 'topright' });
    layerControl.addTo(map);

    map.on('baselayerchange', (e: any) => {
      const newProvider: TileProvider = e.name === '高德卫星图' ? 'amap' : 'osm';
      setTileProvider(newProvider);
      setProviderState(newProvider);
      refreshMarkers();
    });

    // Detect manual pan to disable follow
    map.on('dragstart', () => {
      if (isFollowingRef.current) {
        // User manually panned - we'll keep following but note the gesture
      }
    });

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      stopLocationWatch();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Refresh route markers when state changes
  const refreshMarkers = useCallback(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const activeRoute = routes.find((r) => r.id === activeRouteId);

    if (isCreating) {
      if (draftStart) {
        const [lng, lat] = toDisplayCoords(draftStart[1], draftStart[0]);
        L.marker([lat, lng], { icon: START_ICON }).addTo(group);
      }
      if (draftFinish) {
        const [lng, lat] = toDisplayCoords(draftFinish[1], draftFinish[0]);
        L.marker([lat, lng], { icon: FINISH_ICON }).addTo(group);
      }
      if (draftStart && draftFinish) {
        const [slng, slat] = toDisplayCoords(draftStart[1], draftStart[0]);
        const [flng, flat] = toDisplayCoords(draftFinish[1], draftFinish[0]);
        L.polyline(
          [[slat, slng], [flat, flng]],
          { color: '#BF5AF2', weight: 2.5, dashArray: '8 4', opacity: 0.8 }
        ).addTo(group);
      }
    } else if (activeRoute) {
      const [slng, slat] = toDisplayCoords(activeRoute.startLng, activeRoute.startLat);
      const [flng, flat] = toDisplayCoords(activeRoute.finishLng, activeRoute.finishLat);
      L.marker([slat, slng], { icon: START_ICON }).addTo(group);
      L.marker([flat, flng], { icon: FINISH_ICON }).addTo(group);
      L.polyline(
        [[slat, slng], [flat, flng]],
        { color: '#BF5AF2', weight: 2.5, opacity: 0.7 }
      ).addTo(group);

      const bounds = L.latLngBounds([[slat, slng], [flat, flng]]);
      map.fitBounds(bounds.pad(0.3));
    }
  }, [isCreating, createStep, draftStart, draftFinish, activeRouteId, routes]);

  useEffect(() => { refreshMarkers(); }, [refreshMarkers]);

  // Map click for route creation — separate effect to capture latest state
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      if (!isCreating) return;
      if (createStep === 'start') {
        setStart(e.latlng.lng, e.latlng.lat);
      } else if (createStep === 'finish') {
        setFinish(e.latlng.lng, e.latlng.lat);
      }
    };

    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [isCreating, createStep, setStart, setFinish]);

  // ── Location tracking ──

  const cleanupLocationUI = () => {
    if (locationMarkerRef.current) { locationMarkerRef.current.remove(); locationMarkerRef.current = null; }
    if (accuracyCircleRef.current) { accuracyCircleRef.current.remove(); accuracyCircleRef.current = null; }
  };

  const stopLocationWatch = () => {
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
    cleanupLocationUI();
    useLocationStore.getState().clearPosition();
    useTimerStore.getState().setDistance(null);
    setIsLocating(false);
    isFollowingRef.current = false;
  };

  const startLocationWatch = () => {
    if (!navigator.geolocation) { setLocationError('设备不支持定位'); return; }
    isFollowingRef.current = true;
    locationWatchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const map = mapRef.current;
        if (!map) return;
        const { latitude, longitude, accuracy } = pos.coords;
        const [lng, lat] = toDisplayCoords(longitude, latitude);
        if (!locationMarkerRef.current) {
          locationMarkerRef.current = L.marker([lat, lng], { icon: LOCATION_ICON, zIndexOffset: 1000 }).addTo(map);
        } else {
          locationMarkerRef.current.setLatLng([lat, lng]);
        }
        if (accuracy > 0) {
          if (!accuracyCircleRef.current) {
            accuracyCircleRef.current = L.circle([lat, lng], {
              radius: accuracy, color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: 0.06, weight: 0.5, interactive: false,
            }).addTo(map);
          } else {
            accuracyCircleRef.current.setLatLng([lat, lng]);
            accuracyCircleRef.current.setRadius(accuracy);
          }
        }
        if (isFollowingRef.current) map.panTo([lat, lng], { animate: true, duration: 0.3 });
        setIsLocating(true);
        setLocationError(null);

        // Update shared location for "use current location" feature
        useLocationStore.getState().setPosition(latitude, longitude, accuracy);

        // Auto start/stop based on GPS proximity with state machine
        const ts = useTimerStore.getState();
        if (ts.autoMode) {
          const rs = useRouteStore.getState();
          const route = rs.routes.find((r) => r.id === rs.activeRouteId);
          if (!route) return;

          const dStart = haversine(latitude, longitude, route.startLat, route.startLng);
          const dFinish = haversine(latitude, longitude, route.finishLat, route.finishLng);

          if (ts.autoPhase === 'waiting_start') {
            // Waiting near start → trigger auto-start
            ts.setDistance(dStart);
            if (dStart < 20) {
              ts.start(); // start() also sets autoPhase → leaving_start
            }
          } else if (ts.autoPhase === 'leaving_start') {
            // Must move >50m from start before stop can trigger
            ts.setDistance(dStart);
            if (dStart > 50) {
              ts.setAutoPhase('heading_to_finish');
            }
          } else if (ts.autoPhase === 'heading_to_finish') {
            // Heading toward finish — trigger stop when close
            ts.setDistance(dFinish);
            if (dFinish < 20 && ts.status === 'running') {
              ts.stop();
            }
          }
        }
      },
      (err) => {
        stopLocationWatch();
        if (err.code === 1) {
          setLocationError('定位权限被拒绝。请检查：macOS 系统设置 → 隐私与安全性 → 定位服务 → 确保浏览器权限已开启');
        } else if (err.code === 2) {
          setLocationError('无法获取位置，请确认已开启 WiFi 或 GPS');
        } else if (err.code === 3) {
          setLocationError('定位超时，请移至开阔区域重试');
        } else {
          setLocationError('定位失败，请检查系统定位服务是否开启');
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  };

  const toggleLocation = async () => {
    if (isLocating) { stopLocationWatch(); return; }
    if (!navigator.geolocation) { setLocationError('设备不支持定位'); return; }
    setLocationError(null);

    // Check Permissions API first for denied state
    try {
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm.state === 'denied') {
          setLocationError('定位权限已被系统拒绝。请前往 macOS 系统设置 → 隐私与安全性 → 定位服务 → 检查浏览器权限');
          return;
        }
        perm.addEventListener('change', () => {
          if (perm.state === 'denied') { stopLocationWatch(); setLocationError('定位权限已被撤销'); }
        });
      }
    } catch { /* Permissions API not available */ }

    // getCurrentPosition triggers browser permission prompt, then start watch
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => startLocationWatch(),
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('定位权限被拒绝。请在浏览器弹窗中允许位置访问，或检查 macOS 系统设置 → 隐私与安全性 → 定位服务');
        } else {
          startLocationWatch();
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  useEffect(() => { return () => stopLocationWatch(); }, []);

  // ── Search / flyTo ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;

    // Clean up previous search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }

    const { lat, lng, label } = flyTo;
    const [dlng, dlat] = toDisplayCoords(lng, lat);

    // Add search result marker
    const pinIcon = L.divIcon({
      className: 'search-pin',
      html: `
        <div style="position:relative;">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#FF453A"/>
            <circle cx="14" cy="14" r="5" fill="#fff" opacity="0.9"/>
          </svg>
          <span style="position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:700;color:#fff;">●</span>
        </div>`,
      iconSize: [28, 36],
      iconAnchor: [14, 36],
    });

    searchMarkerRef.current = L.marker([dlat, dlng], { icon: pinIcon, zIndexOffset: 900 })
      .addTo(map)
      .bindPopup(label, { closeButton: false, className: 'search-popup' })
      .openPopup();

    map.flyTo([dlat, dlng], 15, { duration: 0.8 });

    // Remove marker after 8 seconds
    const t = setTimeout(() => {
      if (searchMarkerRef.current) { searchMarkerRef.current.remove(); searchMarkerRef.current = null; }
    }, 8000);

    onFlyComplete?.();

    return () => clearTimeout(t);
  }, [flyTo]);

  // Reset flyTo completion callback ref
  useEffect(() => {
    if (!flyTo) return;
    // flyTo consumed
  }, [flyTo]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Locate button - floating on map */}
      <div className="absolute z-[1000] flex flex-col gap-2" style={{ bottom: 'calc(200px + env(safe-area-inset-bottom, 0px))', right: 'max(12px, env(safe-area-inset-right, 0px) + 4px)' }}>
        <button
          onClick={toggleLocation}
          className={`locate-btn ${isLocating ? 'active' : ''}`}
          title={isLocating ? '停止定位' : '定位我的位置'}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3.5" stroke={isLocating ? '#fff' : 'rgba(255,255,255,0.6)'} strokeWidth="1.8" />
            <circle cx="10" cy="10" r="1.2" fill={isLocating ? '#fff' : 'rgba(255,255,255,0.6)'} />
            <path d="M10 1v3M10 16v3M1 10h3M16 10h3" stroke={isLocating ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Location error toast */}
      {locationError && (
        <div className="absolute top-16 left-4 right-4 z-[1000] px-4 py-3 rounded-2xl glass-strong text-[13px] text-[#FF453A] font-medium shadow-lg text-center max-w-sm mx-auto leading-relaxed">
          {locationError}
        </div>
      )}
    </div>
  );
}
