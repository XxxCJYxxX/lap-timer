import { useState, useCallback } from 'react';
import MapView from './components/MapView';
import BottomPanel from './components/BottomPanel';
import SearchBar from './components/SearchBar';

interface FlyToTarget {
  lat: number;
  lng: number;
  label: string;
}

function App() {
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);

  const handleSearchSelect = useCallback((lat: number, lng: number, label: string) => {
    setFlyTo({ lat, lng, label });
  }, []);

  const handleFlyComplete = useCallback(() => {
    setFlyTo(null);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {/* Map - full screen, behind everything */}
      <main className="absolute inset-0">
        <MapView flyTo={flyTo} onFlyComplete={handleFlyComplete} />
      </main>

      {/* Top bar - glass, minimal, with search */}
      <header
        className="absolute top-0 left-0 right-0 h-11 flex items-center gap-3 px-4 z-[900] select-none"
        style={{
          background: 'rgba(28, 28, 30, 0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* App logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #BF5AF2, #0A84FF)' }}
          >
            <span className="text-[11px] font-black text-white">LT</span>
          </div>
          <h1 className="text-[14px] font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
            LapTimer
          </h1>
        </div>

        {/* Search bar */}
        <SearchBar onSelect={handleSearchSelect} />

        {/* Version badge */}
        <span className="text-[11px] font-medium text-[var(--text-tertiary)] shrink-0">v0.1</span>
      </header>

      {/* Bottom glass panel */}
      <div
        className="absolute bottom-4 left-4 right-4 z-[900] rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(28, 28, 30, 0.82)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div className="p-4">
          <BottomPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
