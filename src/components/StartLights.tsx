import { useTimerStore } from '../stores/timerStore';

export default function StartLights() {
  const lightPhase = useTimerStore((s) => s.lightPhase);

  if (lightPhase === 'idle') return null;

  const isGo = lightPhase === 'go';
  const activeCount = isGo ? 5 : parseInt(lightPhase.replace('light', ''));

  return (
    <div
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      {/* Lights row */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="relative">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full blur-md transition-opacity duration-300"
              style={{
                background: isGo ? '#30D158' : '#FF453A',
                opacity: n <= activeCount ? 0.6 : 0,
                transform: 'scale(1.4)',
              }}
            />
            {/* Light circle */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 relative"
              style={{
                background: isGo
                  ? '#30D158'
                  : n <= activeCount
                  ? `radial-gradient(circle at 40% 35%, #FF6B6B, #FF453A 60%, #8B0000)`
                  : 'rgba(255,255,255,0.06)',
                border: n <= activeCount
                  ? `2px solid ${isGo ? '#30D158' : '#FF6B6B'}`
                  : '2px solid rgba(255,255,255,0.1)',
                boxShadow: n <= activeCount
                  ? `0 0 20px ${isGo ? 'rgba(48,209,88,0.5)' : 'rgba(255,69,58,0.5)'}, inset 0 2px 4px rgba(255,255,255,0.1)`
                  : 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* Status text */}
      <div
        className="text-center font-bold tracking-wider transition-all duration-300"
        style={{
          fontSize: isGo ? '32px' : '18px',
          color: isGo ? '#30D158' : 'rgba(255,255,255,0.7)',
          textShadow: isGo ? '0 0 30px rgba(48,209,88,0.6)' : 'none',
        }}
      >
        {isGo ? 'GO!' : `灯 ${activeCount}/5`}
      </div>

      {isGo && (
        <div
          className="mt-3 text-[14px] font-medium animate-pulse"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          计时开始
        </div>
      )}
    </div>
  );
}
