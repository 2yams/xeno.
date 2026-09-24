import React, { useMemo } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { Lap } from '../../types/timer';
import { formatStopwatch } from '../../utils/time';

interface StopwatchDisplayProps {
  elapsedMs: number;
  isRunning: boolean;
  laps: Lap[];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onLap: () => void;
  onHaptic?: (type: 'light' | 'medium' | 'heavy') => void;
}

export const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  elapsedMs,
  isRunning,
  laps,
  onStart,
  onPause,
  onResume,
  onReset,
  onLap,
  onHaptic,
}) => {
  const { hours, minutes, seconds, hundredths } = formatStopwatch(elapsedMs);

  const { fastestId, slowestId } = useMemo(() => {
    if (laps.length < 2) return { fastestId: null, slowestId: null };
    let minTime = Infinity;
    let maxTime = -Infinity;
    let fId = null;
    let sId = null;

    laps.forEach((lap) => {
      if (lap.lapTime < minTime) {
        minTime = lap.lapTime;
        fId = lap.id;
      }
      if (lap.lapTime > maxTime) {
        maxTime = lap.lapTime;
        sId = lap.id;
      }
    });

    return { fastestId: fId, slowestId: sId };
  }, [laps]);

  const handlePrimaryClick = () => {
    if (isRunning) {
      onHaptic?.('medium');
      onPause();
    } else if (elapsedMs > 0) {
      onHaptic?.('medium');
      onResume();
    } else {
      onHaptic?.('heavy');
      onStart();
    }
  };

  const primaryLabel = isRunning ? 'PAUSE' : elapsedMs > 0 ? 'RESUME' : 'START';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto my-6 sm:my-10 select-none">
      {/* Stopwatch Display Digits */}
      <div className="flex items-baseline justify-center font-mono tracking-tighter tabular-nums text-[var(--fg)]">
        {hours && (
          <>
            <span className="text-5xl sm:text-7xl font-light">{hours}</span>
            <span className="text-4xl sm:text-6xl font-extralight text-[var(--muted)] mx-0.5 opacity-60">
              :
            </span>
          </>
        )}
        <span className="text-5xl sm:text-7xl md:text-8xl font-light">{minutes}</span>
        <span className="text-4xl sm:text-6xl md:text-7xl font-extralight text-[var(--muted)] mx-0.5 opacity-60">
          :
        </span>
        <span className="text-5xl sm:text-7xl md:text-8xl font-light">{seconds}</span>
        <span className="text-2xl sm:text-3xl font-light text-[var(--muted)] ml-1.5 opacity-80">
          .{hundredths}
        </span>
      </div>

      {/* Stopwatch Action Controls */}
      <div className="flex items-center gap-4 mt-8 w-full max-w-xs">
        {/* Lap Button */}
        <button
          onClick={() => {
            onHaptic?.('light');
            onLap();
          }}
          disabled={!isRunning && elapsedMs === 0}
          aria-label="Lap"
          className="flex-1 py-3 px-4 font-mono text-xs sm:text-sm tracking-widest uppercase rounded-xl border border-[var(--border)] bg-[var(--panel)] text-[var(--fg)] hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>LAP</span>
        </button>

        {/* Primary Start/Pause */}
        <button
          onClick={handlePrimaryClick}
          aria-label={primaryLabel}
          className="flex-1 py-3 px-4 font-mono text-xs sm:text-sm tracking-widest font-semibold uppercase rounded-xl bg-[var(--fg)] text-[var(--bg)] shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{primaryLabel}</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={() => {
            onHaptic?.('light');
            onReset();
          }}
          disabled={elapsedMs === 0}
          aria-label="Reset stopwatch"
          className="p-3 font-mono rounded-xl border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--fg)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Lap Table */}
      {laps.length > 0 && (
        <div className="w-full mt-8 max-h-56 overflow-y-auto pr-1 border-t border-[var(--border)] pt-3 font-mono text-xs">
          <div className="flex justify-between text-[var(--muted)] px-3 pb-2 uppercase text-[10px] tracking-wider">
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>

          <div className="space-y-1">
            {laps.map((lap) => {
              const lapParts = formatStopwatch(lap.lapTime);
              const totalParts = formatStopwatch(lap.overallTime);
              const isFastest = lap.id === fastestId;
              const isSlowest = lap.id === slowestId;

              return (
                <div
                  key={lap.id}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg ${
                    isFastest
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : isSlowest
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'hover:bg-[var(--panel)]/50 text-[var(--fg)]'
                  }`}
                >
                  <span className="opacity-75">#{lap.lapNumber.toString().padStart(2, '0')}</span>
                  <span className="tabular-nums font-medium">
                    {lapParts.minutes}:{lapParts.seconds}.{lapParts.hundredths}
                  </span>
                  <span className="tabular-nums opacity-60">
                    {totalParts.minutes}:{totalParts.seconds}.{totalParts.hundredths}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
