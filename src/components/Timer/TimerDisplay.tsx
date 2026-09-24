import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TimerState, TimeUnit } from '../../types/timer';
import { formatTimerDisplay } from '../../utils/time';
import { ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';

interface TimerDisplayProps {
  remainingSeconds: number;
  timerState: TimerState;
  activeUnit: TimeUnit | null;
  onSelectUnit: (unit: TimeUnit | null) => void;
  onAdjustUnit: (unit: TimeUnit, delta: number) => void;
  onSetUnitDirect: (unit: TimeUnit, value: number) => void;
  onHaptic?: (type: 'light' | 'medium') => void;
  showHoursAlways?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  timerState,
  activeUnit,
  onSelectUnit,
  onAdjustUnit,
  onSetUnitDirect,
  onHaptic,
}) => {
  const { hoursStr, minutesStr, secondsStr } = formatTimerDisplay(remainingSeconds);

  const [typedBuffer, setTypedBuffer] = useState('');
  const touchStartY = useRef<number | null>(null);

  // Clear typed buffer when active unit changes
  useEffect(() => {
    setTypedBuffer('');
  }, [activeUnit]);

  // Handle direct numeric typing when a unit is active
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!activeUnit) return;
      // Do not capture if user is focused inside a form input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onHaptic?.('light');
        const nextBuf = (typedBuffer + e.key).slice(-2); // keep last 2 digits
        setTypedBuffer(nextBuf);
        const parsed = parseInt(nextBuf, 10);
        onSetUnitDirect(activeUnit, parsed);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onHaptic?.('light');
        const nextBuf = typedBuffer.slice(0, -1);
        setTypedBuffer(nextBuf);
        const parsed = nextBuf === '' ? 0 : parseInt(nextBuf, 10);
        onSetUnitDirect(activeUnit, parsed);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onHaptic?.('light');
        onAdjustUnit(activeUnit, 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onHaptic?.('light');
        onAdjustUnit(activeUnit, -1);
      } else if (e.key === 'Escape' || e.key === 'Enter') {
        onSelectUnit(null);
      }
    },
    [activeUnit, typedBuffer, onAdjustUnit, onSetUnitDirect, onSelectUnit, onHaptic]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch gesture handler for vertical swipe
  const handleTouchStart = (e: React.TouchEvent, unit: TimeUnit) => {
    touchStartY.current = e.touches[0].clientY;
    onSelectUnit(unit);
  };

  const handleTouchEnd = (e: React.TouchEvent, unit: TimeUnit) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const threshold = 18; // px

    if (Math.abs(diff) >= threshold) {
      const delta = diff > 0 ? 1 : -1; // swipe up = increase, swipe down = decrease
      onHaptic?.('medium');
      onAdjustUnit(unit, delta);
    }
    touchStartY.current = null;
  };

  // Wheel gesture handler
  const handleWheel = (e: React.WheelEvent, unit: TimeUnit) => {
    e.preventDefault();
    onSelectUnit(unit);
    const delta = e.deltaY < 0 ? 1 : -1;
    onHaptic?.('light');
    onAdjustUnit(unit, delta);
  };

  const handleUnitClick = (unit: TimeUnit) => {
    onHaptic?.('light');
    if (activeUnit === unit) {
      // Toggle or keep
    } else {
      onSelectUnit(unit);
    }
  };

  const handleStep = (unit: TimeUnit, delta: number) => {
    onHaptic?.('light');
    onSelectUnit(unit);
    onAdjustUnit(unit, delta);
  };

  const effectiveActive = activeUnit || 'minutes';

  return (
    <div className="relative flex flex-col items-center justify-center my-6 sm:my-10 select-none">
      {/* Timer completed indicator */}
      {timerState === 'completed' && (
        <div className="mb-3 px-3 py-1 text-xs font-mono tracking-widest uppercase rounded-full bg-[var(--fg)] text-[var(--bg)] animate-pulse">
          done
        </div>
      )}

      {/* Main Digits Row with Hour, Minute, and Second handles */}
      <div className="flex items-baseline justify-center font-mono tracking-tighter tabular-nums text-[var(--fg)]">
        {/* HOUR HANDLE */}
        <div
          onClick={() => handleUnitClick('hours')}
          onTouchStart={(e) => handleTouchStart(e, 'hours')}
          onTouchEnd={(e) => handleTouchEnd(e, 'hours')}
          onWheel={(e) => handleWheel(e, 'hours')}
          className={`relative group cursor-pointer px-1 sm:px-2.5 py-2 rounded-lg transition-all ${
            activeUnit === 'hours'
              ? 'bg-[var(--panel)] text-[var(--fg)]'
              : 'hover:bg-[var(--panel)]/50 opacity-80 hover:opacity-100'
          }`}
          title="Hour handle: Click, swipe, or scroll to adjust hours"
          role="button"
          tabIndex={0}
          aria-label={`Hour handle: ${hoursStr} hours`}
        >
          {/* Desktop quick adjuster buttons for hours */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStep('hours', 1);
            }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Increase hour"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <span className="text-4xl sm:text-7xl md:text-8xl font-light">
            {hoursStr}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStep('hours', -1);
            }}
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 p-1 text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Decrease hour"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Active Indicator Underline */}
          {activeUnit === 'hours' && (
            <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)] rounded-full animate-pulse" />
          )}
        </div>

        {/* Separator */}
        <span className="text-3xl sm:text-6xl md:text-7xl font-extralight text-[var(--muted)] mx-0.5 sm:mx-1 opacity-60">
          :
        </span>

        {/* MINUTE HANDLE */}
        <div
          onClick={() => handleUnitClick('minutes')}
          onTouchStart={(e) => handleTouchStart(e, 'minutes')}
          onTouchEnd={(e) => handleTouchEnd(e, 'minutes')}
          onWheel={(e) => handleWheel(e, 'minutes')}
          className={`relative group cursor-pointer px-1 sm:px-2.5 py-2 rounded-lg transition-all ${
            activeUnit === 'minutes'
              ? 'bg-[var(--panel)] text-[var(--fg)]'
              : 'hover:bg-[var(--panel)]/50 opacity-90'
          }`}
          title="Minute handle: Click, swipe, or scroll to adjust minutes"
          role="button"
          tabIndex={0}
          aria-label={`Minute handle: ${minutesStr} minutes`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStep('minutes', 1);
            }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Increase minutes"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <span className="text-4xl sm:text-7xl md:text-8xl font-light">
            {minutesStr}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStep('minutes', -1);
            }}
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 p-1 text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Decrease minutes"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {activeUnit === 'minutes' && (
            <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)] rounded-full animate-pulse" />
          )}
        </div>

        {/* Separator */}
        <span className="text-3xl sm:text-6xl md:text-7xl font-extralight text-[var(--muted)] mx-0.5 sm:mx-1 opacity-60">
          :
        </span>

        {/* SECOND HANDLE */}
        <div
          onClick={() => handleUnitClick('seconds')}
          onTouchStart={(e) => handleTouchStart(e, 'seconds')}
          onTouchEnd={(e) => handleTouchEnd(e, 'seconds')}
          onWheel={(e) => handleWheel(e, 'seconds')}
          className={`relative group cursor-pointer px-1 sm:px-2.5 py-2 rounded-lg transition-all ${
            activeUnit === 'seconds'
              ? 'bg-[var(--panel)] text-[var(--fg)]'
              : 'hover:bg-[var(--panel)]/50 opacity-90'
          }`}
          title="Second handle: Click, swipe, or scroll to adjust seconds"
          role="button"
          tabIndex={0}
          aria-label={`Second handle: ${secondsStr} seconds`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStep('seconds', 1);
            }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 p-1 text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Increase seconds"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <span className="text-4xl sm:text-7xl md:text-8xl font-light">
            {secondsStr}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStep('seconds', -1);
            }}
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 p-1 text-[var(--muted)] hover:text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Decrease seconds"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {activeUnit === 'seconds' && (
            <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)] rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Quick +/- Stepper Controls beneath digits */}
      <div className="flex items-center gap-6 mt-4">
        <button
          onClick={() => handleStep(effectiveActive, -1)}
          aria-label={`Decrease ${effectiveActive}`}
          className="flex items-center justify-center w-11 h-11 rounded-full text-[var(--muted)] hover:text-[var(--fg)] bg-[var(--panel)] hover:bg-[var(--panel)]/80 border border-[var(--border)] transition-all active:scale-90"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--muted)] opacity-70">
          {effectiveActive}
        </span>

        <button
          onClick={() => handleStep(effectiveActive, 1)}
          aria-label={`Increase ${effectiveActive}`}
          className="flex items-center justify-center w-11 h-11 rounded-full text-[var(--muted)] hover:text-[var(--fg)] bg-[var(--panel)] hover:bg-[var(--panel)]/80 border border-[var(--border)] transition-all active:scale-90"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
