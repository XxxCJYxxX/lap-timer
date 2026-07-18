# 更新日志 · Changelog

本文档记录 LapTimer 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [0.1.0] — 2026-07-17

### 🚀 初始发布

第一个可用的 v0.1 MVP 版本，通过 GitHub Pages 部署为纯前端 Web 工具。

#### 地图 · Map
- Leaflet + OpenStreetMap / 高德卫星 / 高德矢量路网多图层切换
- 默认底图：高德地图（中文路网 + 地名标注）
- 高德卫星 + 透明路网叠层（"高德卫星+路网"图层）
- GCJ-02 ↔ WGS-84 坐标转换（`gcoord`），标记点与底图自动对齐
- 定位按钮：GPS 持续追踪，蓝色脉冲点 + 精度圈（Apple Maps 风格）
- 计时开始后自动 zoom 到 18 级并用 `setView` 实时锁定 GPS 位置
- GPS 移动 < 5m 时跳过重绘（节流省电）

#### 路线 · Routes
- 多航点路线：自由点击地图添加航点，起点 S / 中间编号 / 终点 F
- 撤销航点、「使用当前位置」一键添加
- 「设为终点」锁定末点为终点，命名保存
- 路线导入/导出为 `.laproute.json` 种子文件
- 路线删除（含关联记录级联删除）

#### 计时 · Timer
- `performance.now()` 毫秒级精度，`requestAnimationFrame` 驱动显示
- 等宽字体（SF Mono / Menlo）确保数字稳定不跳动
- F1 五灯起跑序列：红灯逐一亮起（600ms/盏），全亮后随机 0.5~2s 延迟，全灭=起跑
- 手动启表 / 停表 / 重置

#### 自动模式 · Auto Mode
- 三段状态机：`waiting_start` → `leaving_start` → `heading_to_finish`
- 靠近发车点 20m 内自动启表，离开发车点 50m 以上才能触发终点停表
- 距终点 20m 内自动停表
- 实时显示当前阶段和距目标距离

#### 时速 · Speed
- GPS 连续位置计算实时时速（km/h）
- SVG 圆形时速表 + 最高时速记录
- 异常过滤：< 0.5s 间隔忽略，> 400km/h 舍弃

#### 搜索 · Search
- Nominatim 地理编码，输入地名 → 地图飞过去
- 300ms 防抖，AbortController 取消过期请求
- 结果下拉：地名 + 地址层级，键盘上下/回车选择

#### 记录 · Records
- 🟣 PB / 🟢 比上次快 / 🟡 比上次慢 — F1 风格三色标记
- PB 高亮展示，记录列表颜色标注
- 记录删除（hover 显示 ✕）

#### 数据 · Storage
- IndexedDB（Dexie.js）纯本地存储，零服务器依赖
- 路线表 v2 schema：`waypoints` 数组替代旧 start/finish 结构

#### UI · Design
- Apple HIG 设计语言：SF 字体栈、玻璃面板、系统颜色
- 全面适配移动端：`100dvh` 视口、`viewport-fit=cover`、safe-area-inset
- iPhone notch / Dynamic Island / home indicator 安全区
- `position: absolute` 替代 `fixed`（修复 iOS Safari 地址栏闪烁）
- 44pt 最小触控区域，`touch-action: none` 地图区域
- `prefers-reduced-motion` 尊重用户减弱动画设置
- 手机端玻璃模糊减半（`blur(12px)`）降 GPU 负载
- 响应式布局：手机 / 平板 / 桌面三级断点
- 加载中提示 + JS 错误兜底（防白屏）

#### 性能 · Performance
- CSS `contain` 隔离渲染，`content-visibility: auto` 懒渲染
- `transform: translateZ(0)` GPU 合成层
- DNS prefetch（高德瓦片 + Nominatim）
- `format-detection: telephone=no` 防 iOS 误识别
- 按钮 `transition` 仅限 `background` + `transform`（不插值 color/box-shadow）
- `backdrop-filter` 移动端降级

#### 部署 · Deployment
- GitHub Pages 静态托管（`gh-pages` 分支）
- Vite `base: '/lap-timer/'` 配置
- `apple-mobile-web-app-capable` / `theme-color` PWA 预备

---

## 技术栈 · Tech Stack

| 层 | 选型 | 版本 |
|----|------|------|
| 框架 | React | 18 |
| 构建 | Vite | 8 |
| 类型 | TypeScript | 5 |
| 样式 | Tailwind CSS | 4 |
| 地图 | Leaflet + react-leaflet | 1.9 / 4 |
| 状态管理 | Zustand | 5 |
| 存储 | Dexie.js (IndexedDB) | 4 |
| 坐标系 | gcoord | 1 |
| 地理编码 | Nominatim (OSM) | — |

---

## 许可 · License

MIT © 2026
