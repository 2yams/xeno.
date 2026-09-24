import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimeUnit } from '../types/timer';
import { partsToSeconds, secondsToParts } from '../utils/time';
import { saveTimerSnapshot, loadTimerSnapshot } from '../services/storage';

interface UseTimerOptions {
  defaultDuration?: number; // default 1500 (25 min)
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function useTimer({
  defaultDuration = 1500,
  onComplete,
  onTick,
}: UseTimerOptions = {}) {
  const [totalDuration, setTotalDuration] = useState<number>(() => {
    const saved = loadTimerSnapshot();
    if (saved && saved.targetDuration > 0) return saved.targetDuration;
    return defaultDuration;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const saved = loadTimerSnapshot();
    if (saved) {
      if (saved.state === 'running' && saved.targetEndTime) {
        const remaining = Math.max(0, Math.ceil((saved.targetEndTime - Date.now()) / 1000));
        return remaining;
      } else if (saved.state === 'paused') {
        return saved.remainingSeconds;
      }
    }
    return defaultDuration;
  });

  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = loadTimerSnapshot();
    if (saved) {
      if (saved.state === 'running' && saved.targetEndTime) {
        const remaining = (saved.targetEndTime - Date.now()) / 1000;
        return remaining > 0 ? 'running' : 'completed';
      }
      return saved.state;
    }
    return 'idle';
  });

  const [activeUnit, setActiveUnit] = useState<TimeUnit | null>(null);

  // Timestamps for drift-free calculation
  const targetEndTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  // Sync snapshot
  const syncSnapshot = useCallback(
    (state: TimerState, remaining: number, targetEnd: number | null, duration: number) => {
      saveTimerSnapshot({
        mode: 'timer',
        targetDuration: duration,
        remainingSeconds: remaining,
        targetEndTime: targetEnd,
        startedAt: targetEnd ? targetEnd - duration * 1000 : null,
        state,
        updatedAt: Date.now(),
      });
    },
    []
  );

  // Main countdown tick function based on exact timestamps
  const tick = useCallback(() => {
    if (!targetEndTimeRef.current) return;
    const now = Date.now();
    const diff = targetEndTimeRef.current - now;

    if (diff <= 0) {
      // Completed!
      setRemainingSeconds(0);
      setTimerState('completed');
      targetEndTimeRef.current = null;
      syncSnapshot('completed', 0, null, totalDuration);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    } else {
      const remaining = Math.ceil(diff / 1000);
      setRemainingSeconds((prev) => {
        if (prev !== remaining) {
          onTickRef.current?.(remaining);
          return remaining;
        }
        return prev;
      });
    }
  }, [totalDuration, syncSnapshot]);

  // Start interval/animation loop when running
  useEffect(() => {
    if (timerState === 'running') {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
      }

      const runLoop = () => {
        tick();
        intervalRef.current = window.setTimeout(runLoop, 250);
      };
      runLoop();

      // Handle visibility changes to instantly recover from sleep/background
      const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
          tick();
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        if (intervalRef.current) clearTimeout(intervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      targetEndTimeRef.current = null;
      if (intervalRef.current) clearTimeout(intervalRef.current);
    }
  }, [timerState, tick]);

  // Public control methods
  const start = useCallback(() => {
    if (remainingSeconds <= 0) return;
    const endTime = Date.now() + remainingSeconds * 1000;
    targetEndTimeRef.current = endTime;
    setTimerState('running');
    setActiveUnit(null);
    syncSnapshot('running', remainingSeconds, endTime, totalDuration);
  }, [remainingSeconds, totalDuration, syncSnapshot]);

  const pause = useCallback(() => {
    if (targetEndTimeRef.current) {
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      targetEndTimeRef.current = null;
    }
    setTimerState('paused');
    syncSnapshot('paused', remainingSeconds, null, totalDuration);
  }, [remainingSeconds, totalDuration, syncSnapshot]);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const reset = useCallback(() => {
    targetEndTimeRef.current = null;
    setRemainingSeconds(totalDuration);
    setTimerState('idle');
    setActiveUnit(null);
    syncSnapshot('idle', totalDuration, null, totalDuration);
  }, [totalDuration, syncSnapshot]);

  const setDuration = useCallback(
    (newSeconds: number, autoStart = false) => {
      const clamped = Math.max(1, Math.min(359999, Math.round(newSeconds))); // up to 99h 59m 59s
      setTotalDuration(clamped);
      setRemainingSeconds(clamped);
      targetEndTimeRef.current = autoStart ? Date.now() + clamped * 1000 : null;
      setTimerState(autoStart ? 'running' : 'idle');
      setActiveUnit(null);
      syncSnapshot(autoStart ? 'running' : 'idle', clamped, targetEndTimeRef.current, clamped);
    },
    [syncSnapshot]
  );

  // Direct Unit Manipulation
  const adjustUnit = useCallback(
    (unit: TimeUnit, delta: number) => {
      const baseSeconds = timerState === 'running' ? remainingSeconds : totalDuration;
      const parts = secondsToParts(baseSeconds);

      if (unit === 'hours') {
        parts.hours = Math.max(0, Math.min(99, parts.hours + delta));
      } else if (unit === 'minutes') {
        parts.minutes = Math.max(0, Math.min(59, parts.minutes + delta));
      } else if (unit === 'seconds') {
        parts.seconds = Math.max(0, Math.min(59, parts.seconds + delta));
      }

      const updated = partsToSeconds(parts);
      // Ensure at least 1 second
      const valid = Math.max(1, updated);

      if (timerState === 'running') {
        const diff = valid - remainingSeconds;
        if (targetEndTimeRef.current) {
          targetEndTimeRef.current += diff * 1000;
        }
        setRemainingSeconds(valid);
        setTotalDuration((prev) => Math.max(valid, prev));
      } else {
        setTotalDuration(valid);
        setRemainingSeconds(valid);
      }
    },
    [timerState, remainingSeconds, totalDuration]
  );

  const setUnitDirect = useCallback(
    (unit: TimeUnit, value: number) => {
      const baseSeconds = timerState === 'running' ? remainingSeconds : totalDuration;
      const parts = secondsToParts(baseSeconds);

      if (unit === 'hours') {
        parts.hours = Math.max(0, Math.min(99, value));
      } else if (unit === 'minutes') {
        parts.minutes = Math.max(0, Math.min(59, value));
      } else if (unit === 'seconds') {
        parts.seconds = Math.max(0, Math.min(59, value));
      }

      const updated = Math.max(1, partsToSeconds(parts));
      if (timerState === 'running') {
        const diff = updated - remainingSeconds;
        if (targetEndTimeRef.current) {
          targetEndTimeRef.current += diff * 1000;
        }
        setRemainingSeconds(updated);
        setTotalDuration((prev) => Math.max(updated, prev));
      } else {
        setTotalDuration(updated);
        setRemainingSeconds(updated);
      }
    },
    [timerState, remainingSeconds, totalDuration]
  );

  const addSeconds = useCallback(
    (secondsToAdd: number) => {
      const baseSeconds = timerState === 'running' ? remainingSeconds : totalDuration;
      const valid = Math.max(1, Math.min(359999, baseSeconds + secondsToAdd));
      if (timerState === 'running') {
        if (targetEndTimeRef.current) {
          targetEndTimeRef.current += (valid - remainingSeconds) * 1000;
        }
        setRemainingSeconds(valid);
        setTotalDuration((prev) => Math.max(valid, prev));
      } else {
        setTotalDuration(valid);
        setRemainingSeconds(valid);
      }
    },
    [timerState, remainingSeconds, totalDuration]
  );

  return {
    totalDuration,
    remainingSeconds,
    timerState,
    activeUnit,
    setActiveUnit,
    start,
    pause,
    resume,
    reset,
    setDuration,
    adjustUnit,
    setUnitDirect,
    addSeconds,
  };
}
