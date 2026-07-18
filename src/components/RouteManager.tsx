import { useEffect } from 'react';
import { useRouteStore } from '../stores/routeStore';

// Legacy component — active UI is in BottomPanel.tsx
export default function RouteManager() {
  const { routes, activeRouteId, isCreating, loadRoutes, setActiveRoute, startCreate, cancelCreate, deleteRoute } = useRouteStore();

  useEffect(() => { loadRoutes(); }, [loadRoutes]);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider">路线</div>
        <button onClick={isCreating ? cancelCreate : startCreate} className={`text-xs px-2 py-1 rounded transition-colors ${isCreating ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
          {isCreating ? '取消' : '+ 新建'}
        </button>
      </div>
      {routes.length === 0 && !isCreating ? (
        <p className="text-xs text-gray-600">暂无路线</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {routes.map((route) => (
            <div key={route.id} onClick={() => setActiveRoute(route.id!)} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${activeRouteId === route.id ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-gray-800 border border-transparent'}`}>
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate">{route.name}</div>
                <div className="text-[10px] text-gray-500">{new Date(route.createdAt).toLocaleDateString('zh-CN')} · {route.waypoints?.length ?? '?'} 个点</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); if (confirm(`删除"${route.name}"？`)) deleteRoute(route.id!); }} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs ml-2">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
