# 🏎️ LapTimer

**F1-style GPS lap timer for the web.** Set start/finish points on a map, create routes, and time your runs with millisecond precision. Auto-timing via GPS proximity in auto mode.

![Tech](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TS](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## Features (v0.1 MVP)

- 🗺️ **Interactive map** — Leaflet + OpenStreetMap / Amap satellite tiles, layer switcher
- 📍 **GPS location tracking** — Pulsing blue dot with accuracy circle, Apple Maps style
- 🔍 **Place search** — Nominatim geocoder, type a name → fly to location
- 🚩 **Route management** — Set start/finish by clicking map or using current GPS position
- ⏱ **Millisecond timer** — `performance.now()` precision, `requestAnimationFrame` display
- 🟣🟢🟡 **F1-style three-color scoring** — Purple (PB), Green (faster), Yellow (slower)
- 🤖 **Auto start/stop** — GPS proximity triggers timer within 20m of start/finish
- 💾 **Local-first storage** — IndexedDB via Dexie.js, zero server required
- 🌓 **Dark UI** — Apple HIG design language, glass panels, system fonts
- 🇨🇳 **China tile support** — Amap satellite tiles with GCJ-02 ↔ WGS-84 coordinate conversion

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Map | Leaflet + react-leaflet 4 |
| State | Zustand 5 |
| Storage | Dexie.js (IndexedDB) |
| Coordinates | gcoord (GCJ-02 ↔ WGS-84) |
| Geocoding | Nominatim (OSM, free) |

## Quick Start

```bash
git clone https://github.com/XxxCJYxxX/lap-timer.git
cd lap-timer
npm install
npm run dev
```

Open `http://localhost:5173`.

## Usage

1. **Create a route** — Routes tab → "新建路线" → click start point on map → click finish → name → save
2. **Start timing** — Select a route → Timer tab → "启表" → drive the route → "停表"
3. **Auto mode** — Enable location → toggle "自动启停" → GPS auto-starts within 20m of start, auto-stops at finish

## Milestones

| Version | Features |
|---------|----------|
| v0.1 ✅ | Map, routes, timer, three-color scoring, GPS auto-timing, search, local storage |
| v0.2 | Trend charts, data export, light mode toggle |
| v0.3 | GPS track replay, GPX import/export, route editing |
| v1.0 | i18n, PWA, tests, cloud sync |

## License

MIT
