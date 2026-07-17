import L from 'leaflet';

/** OSM default tile layer */
export const osmLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }
);

/** 高德卫星图（⚠️ GCJ-02 坐标系，坐标由 coord.ts 转换层统一处理） */
export const amapLayer = L.tileLayer(
  'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  {
    subdomains: ['1', '2', '3', '4'],
    attribution: '&copy; 高德地图',
    maxZoom: 18,
  }
);

export const BASE_LAYERS: Record<string, L.TileLayer> = {
  'OpenStreetMap': osmLayer,
  '高德卫星图': amapLayer,
};
