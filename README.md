# 🏎️ LapTimer

> F1 风格 GPS 圈速计时器 · 在地图上设置发车点与终点，毫秒级计时，三色标记成绩，支持 GPS 自动启停

**An F1-style GPS lap timer for the web.** Set start/finish on a map, time your runs with millisecond precision, scored with F1-style color codes — purple for PB, green for faster, yellow for slower. GPS auto start/stop built in.

![Tech](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TS](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss) ![license](https://img.shields.io/badge/license-MIT-green)

---

## 功能 · Features

| 功能 Feature | 说明 Description |
|-------------|-----------------|
| 🗺️ 交互地图 | Leaflet + OSM / 高德卫星图，底图一键切换 |
| 📍 GPS 定位 | 蓝色脉冲点 + 精度圈，Apple Maps 风格 |
| 🔍 地名搜索 | Nominatim 地理编码，输入地名 → 地图飞过去 |
| 🚩 路线管理 | 点地图或用当前位置设发车点/终点 |
| ⏱ 毫秒计时 | `performance.now()` 精度，`requestAnimationFrame` 刷屏 |
| 🟣🟢🟡 三色标记 | 紫（PB / 个人最佳）、绿（比上次快）、黄（比上次慢） |
| 🤖 自动启停 | GPS 靠近发车点自动启表，靠近终点自动停表 |
| 💾 纯本地存储 | IndexedDB + Dexie.js，无需服务器 |
| 🌓 暗色界面 | Apple HIG 设计语言，玻璃面板，系统字体 |
| 🇨🇳 国内适配 | 高德卫星瓦片 + GCJ-02 ↔ WGS-84 坐标转换 |

## 技术栈 · Tech Stack

| 层 Layer | 选型 Choice |
|-----------|-------------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 地图 | Leaflet + react-leaflet 4 |
| 状态管理 | Zustand 5 |
| 存储 | Dexie.js (IndexedDB) |
| 坐标系 | gcoord (GCJ-02 ↔ WGS-84) |
| 地理编码 | Nominatim (OSM, 免费) |

## 快速开始 · Quick Start

```bash
git clone https://github.com/XxxCJYxxX/lap-timer.git
cd lap-timer
npm install
npm run dev
```

打开 / Open `http://localhost:5173`

## 使用 · Usage

1. **创建路线** — 路线页签 → 「新建路线」→ 点地图发车点 → 点终点 → 命名 → 保存
2. **手动计时** — 选中路线 → 计时页签 → 「启表」→ 跑完 → 「停表」
3. **自动模式** — 先授权 GPS 定位 → 打开「自动启停」开关 → 走到发车点自动启表，到终点自动停表

## 里程碑 · Milestones

| 版本 | 内容 |
|------|------|
| v0.1 ✅ | 地图、路线、计时、三色判定、GPS 自动启停、地名搜索、本地存储 |
| v0.2 | 用时趋势图、数据导出、明暗切换 |
| v0.3 | GPS 轨迹回放、GPX 导入导出、路线编辑 |
| v1.0 | 国际化、PWA、测试、云端同步 |

## 许可 · License

MIT
