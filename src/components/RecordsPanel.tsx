import { useRecordsStore } from '../stores/recordStore';
export { useRecordsStore };

import { useEffect } from 'react';
import { useRouteStore } from '../stores/routeStore';
import { COLOR_MAP } from '../utils/color';
import type { RecordColor } from '../types';

function formatTime(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function getColor(records: { timeMs: number; id?: number }[], record: { timeMs: number; id?: number }): RecordColor {
  const times = records.map((r) => r.timeMs);
  const pb = Math.min(...times);
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx === -1) return null;
  if (record.timeMs === pb) return 'purple';
  const prev = records[idx + 1];
  if (prev && record.timeMs < prev.timeMs) return 'green';
  if (prev && record.timeMs > prev.timeMs) return 'yellow';
  return null;
}

// Kept for backward compatibility — BottomPanel.tsx is the active UI
export default function RecordsPanel() {
  const { activeRouteId } = useRouteStore();
  const { records, loadRecords } = useRecordsStore();

  useEffect(() => {
    if (activeRouteId) loadRecords(activeRouteId);
  }, [activeRouteId, loadRecords]);

  if (!activeRouteId) {
    return <p className="text-xs text-gray-600 px-4 py-3">选择路线查看记录</p>;
  }

  const pb = records.length > 0 ? Math.min(...records.map((r) => r.timeMs)) : null;

  return (
    <div className="px-4 py-3 border-t border-gray-800 flex-1 min-h-0 flex flex-col">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">记录</div>
      {pb !== null && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20">
          <span className="text-xs text-purple-400 font-semibold">PB</span>
          <span className="font-mono text-sm text-purple-300">{formatTime(pb)}</span>
        </div>
      )}
      <div className="overflow-y-auto flex-1 space-y-1">
        {records.map((record) => {
          const color = getColor(records, record);
          const meta = color ? COLOR_MAP[color] : null;
          return (
            <div
              key={record.id}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs ${meta ? meta.bg : 'bg-gray-800/30'}`}
            >
              <span className={`font-mono ${meta ? meta.text : 'text-gray-400'}`}>{formatTime(record.timeMs)}</span>
              <span className="text-gray-600">
                {new Date(record.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
