import L from 'leaflet';

/** OSM default tile layer */
export const osmLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }
);

/** 高德地图 — 矢量路网 + 地名标注 */
export const amapRoadLayer = L.tileLayer(
  'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  {
    subdomains: ['1', '2', '3', '4'],
    attribution: '&copy; 高德地图',
    maxZoom: 18,
  }
);

/** 高德卫星图 — 纯影像无标注 */
const amapSatelliteLayer = L.tileLayer(
  'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  {
    subdomains: ['1', '2', '3', '4'],
    attribution: '&copy; 高德地图',
    maxZoom: 18,
  }
);

/** 高德路网标注层 — 透明底，只有道路线条 + 地名，用于叠在卫星图上 */
const amapRoadOverlay = L.tileLayer(
  'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
  {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    opacity: 0.9,
  }
);

/** 高德卫星 + 路网标注（组合图层） */
export const amapHybridLayer = L.layerGroup([amapSatelliteLayer, amapRoadOverlay]);

export const BASE_LAYERS: Record<string, L.Layer> = {
  'OpenStreetMap': osmLayer,
  '高德地图': amapRoadLayer,
  '高德卫星+路网': amapHybridLayer,
  '高德卫星图': amapSatelliteLayer,
};
