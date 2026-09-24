import React from 'react';
import { Play, Pause, RotateCcw, BookmarkPlus } from 'lucide-react';
import { TimerState } from '../../types/timer';

interface TimerControlsProps {
  timerState: TimerState;
  remainingSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSavePreset: () => void;
  onQuickAddSeconds: (sec: number) => void;
  onHaptic?: (type: 'light' | 'medium' | 'heavy') => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  timerState,
  remainingSeconds,
  onStart,
  onPause,
  onResume,
  onReset,
  onSavePreset,
  onQuickAddSeconds,
  onHaptic,
}) => {
  const isRunning = timerState === 'running';
  const isPaused = timerState === 'paused';
  const isCompleted = timerState === 'completed';
  const isIdle = timerState === 'idle';

  const handlePrimaryClick = () => {
    if (isRunning) {
      onHaptic?.('medium');
      onPause();
    } else if (isPaused) {
      onHaptic?.('medium');
      onResume();
    } else if (isCompleted) {
      onHaptic?.('light');
      onReset();
    } else {
      onHaptic?.('heavy');
      onStart();
    }
  };

  const primaryLabel = isRunning
    ? 'PAUSE'
    : isPaused
    ? 'RESUME'
    : isCompleted
    ? 'RESET'
    : 'START';

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs mx-auto select-none">
      {/* Primary Action Button */}
      <button
        onClick={handlePrimaryClick}
        aria-label={primaryLabel}
        className="w-full py-3.5 px-8 font-mono text-sm sm:text-base tracking-widest font-semibold uppercase rounded-xl bg-[var(--fg)] text-[var(--bg)] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
      >
        {isRunning ? (
          <>
            <Pause className="w-4 h-4 fill-current" />
            <span>PAUSE</span>
          </>
        ) : isPaused ? (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </>
        ) : isCompleted ? (
          <>
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>START</span>
          </>
        )}
      </button>

      {/* Secondary Controls Bar */}
      <div className="flex items-center justify-between w-full px-2 text-[var(--muted)]">
        {/* Reset button (visible when not idle or after completed) */}
        {!isIdle ? (
          <button
            onClick={() => {
              onHaptic?.('light');
              onReset();
            }}
            title="Reset timer (R)"
            aria-label="Reset timer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono tracking-wider uppercase hover:text-[var(--fg)] hover:bg-[var(--panel)] rounded-md transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Quick +1h, +5m, +1m add buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onHaptic?.('light');
              onQuickAddSeconds(3600);
            }}
            title="Hour handle: Add 1 hour"
            aria-label="Add 1 hour"
            className="px-2 py-1 text-xs font-mono tracking-tight hover:text-[var(--fg)] hover:bg-[var(--panel)] rounded-md transition-all active:scale-95"
          >
            +1h
          </button>
          <button
            onClick={() => {
              onHaptic?.('light');
              onQuickAddSeconds(300);
            }}
            title="Add 5 minutes"
            aria-label="Add 5 minutes"
            className="px-2 py-1 text-xs font-mono tracking-tight hover:text-[var(--fg)] hover:bg-[var(--panel)] rounded-md transition-all active:scale-95"
          >
            +5m
          </button>
          <button
            onClick={() => {
              onHaptic?.('light');
              onQuickAddSeconds(60);
            }}
            title="Add 1 minute"
            aria-label="Add 1 minute"
            className="px-2 py-1 text-xs font-mono tracking-tight hover:text-[var(--fg)] hover:bg-[var(--panel)] rounded-md transition-all active:scale-95"
          >
            +1m
          </button>
        </div>

        {/* Save Preset Button */}
        <button
          onClick={() => {
            onHaptic?.('light');
            onSavePreset();
          }}
          title="Save current time as preset"
          aria-label="Save current time as preset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono tracking-wider uppercase hover:text-[var(--fg)] hover:bg-[var(--panel)] rounded-md transition-all active:scale-95"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>SAVE</span>
        </button>
      </div>
    </div>
  );
};
