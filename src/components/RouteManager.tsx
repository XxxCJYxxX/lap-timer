import { useEffect, useRef, useState } from 'react';
import { useRouteStore } from '../stores/routeStore';

export default function RouteManager() {
  const {
    routes,
    activeRouteId,
    isCreating,
    createStep,
    draftStart,
    draftFinish,
    loadRoutes,
    setActiveRoute,
    startCreate,
    saveRoute,
    cancelCreate,
    deleteRoute,
  } = useRouteStore();

  const [routeName, setRouteName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    if (createStep === 'name' && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [createStep]);

  const handleSave = () => {
    const name = routeName.trim();
    if (!name) return;
    saveRoute(name);
    setRouteName('');
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider">路线</div>
        <button
          onClick={isCreating ? cancelCreate : startCreate}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            isCreating
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          }`}
        >
          {isCreating ? '取消' : '+ 新建'}
        </button>
      </div>

      {/* Create route flow */}
      {isCreating && (
        <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
          {createStep === 'start' && (
            <p className="text-xs text-amber-400">点击地图设置 <strong>发车点</strong></p>
          )}
          {createStep === 'finish' && (
            <p className="text-xs text-amber-400">点击地图设置 <strong>终点</strong></p>
          )}
          {createStep === 'name' && (
            <div className="space-y-2">
              <p className="text-xs text-green-400">发车点和终点已设置</p>
              <input
                ref={nameInputRef}
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="路线名称..."
                className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                maxLength={30}
              />
              <button
                onClick={handleSave}
                disabled={!routeName.trim()}
                className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold transition-colors"
              >
                保存路线
              </button>
            </div>
          )}
        </div>
      )}

      {/* Route list */}
      {routes.length === 0 && !isCreating ? (
        <p className="text-xs text-gray-600">暂无路线，点击"+ 新建"创建第一条</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {routes.map((route) => (
            <div
              key={route.id}
              onClick={() => setActiveRoute(route.id!)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                activeRouteId === route.id
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'hover:bg-gray-800 border border-transparent'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate">{route.name}</div>
                <div className="text-[10px] text-gray-500">
                  {new Date(route.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`删除路线 "${route.name}"？`)) deleteRoute(route.id!);
                }}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
