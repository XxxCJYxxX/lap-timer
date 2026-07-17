import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useRouteStore } from '../stores/routeStore';
import { COLOR_MAP } from '../utils/color';

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;

  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const xxx = String(millis).padStart(3, '0');

  return `${hh}:${mm}:${ss}.${xxx}`;
}

export default function Timer() {
  const { status, elapsed, lastRecord, lastRecordColor, start, stop, tick, reset } = useTimerStore();
  const activeRoute = useRouteStore((s) => s.routes.find((r) => r.id === s.activeRouteId));

  const rafRef = useRef<number>(0);

  // rAF loop for smooth timer display
  useEffect(() => {
    if (status !== 'running') return;
    const loop = () => {
      tick();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, tick]);

  const colorMeta = lastRecordColor ? COLOR_MAP[lastRecordColor] : null;

  return (
    <div className="px-4 py-3 border-t border-gray-800">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">计时器</div>

      {!activeRoute ? (
        <p className="text-sm text-gray-500">选择或创建路线后开始计时</p>
      ) : (
        <>
          {/* Route info */}
          <div className="text-xs text-gray-400 mb-2 truncate">{activeRoute.name}</div>

          {/* Timer display */}
          <div className={`font-mono text-4xl font-bold tracking-tighter mb-3 tabular-nums ${
            status === 'running' ? 'text-white' : 'text-gray-400'
          }`}>
            {formatTime(elapsed)}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {status === 'idle' && (
              <button
                onClick={start}
                className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                启表
              </button>
            )}
            {status === 'running' && (
              <button
                onClick={() => stop()}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
              >
                停表
              </button>
            )}
            {(status === 'stopped') && (
              <button
                onClick={reset}
                className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors"
              >
                重置
              </button>
            )}
          </div>

          {/* Last record result */}
          {lastRecord && colorMeta && (
            <div className={`mt-3 p-3 rounded-lg ${colorMeta.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${colorMeta.text}`}>{colorMeta.label}</span>
                <span className="font-mono text-sm text-gray-300">{formatTime(lastRecord.timeMs)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
