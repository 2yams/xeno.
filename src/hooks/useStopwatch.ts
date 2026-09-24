import { useState, useRef, useEffect, useCallback } from 'react';
import { Lap } from '../types/timer';

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startTimestampRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const lastLapTotalMsRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const updateElapsed = useCallback(() => {
    if (isRunning && startTimestampRef.current !== null) {
      const now = performance.now();
      const current = accumulatedMsRef.current + (now - startTimestampRef.current);
      setElapsedMs(current);
      animFrameRef.current = requestAnimationFrame(updateElapsed);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      startTimestampRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(updateElapsed);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && startTimestampRef.current !== null) {
          const now = performance.now();
          const current = accumulatedMsRef.current + (now - startTimestampRef.current);
          setElapsedMs(current);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [isRunning, updateElapsed]);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    if (startTimestampRef.current !== null) {
      accumulatedMsRef.current += performance.now() - startTimestampRef.current;
      setElapsedMs(accumulatedMsRef.current);
    }
    startTimestampRef.current = null;
    setIsRunning(false);
  }, [isRunning]);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const reset = useCallback(() => {
    setIsRunning(false);
    startTimestampRef.current = null;
    accumulatedMsRef.current = 0;
    lastLapTotalMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
  }, []);

  const recordLap = useCallback(() => {
    if (!isRunning && elapsedMs === 0) return;

    let currentTotal = elapsedMs;
    if (isRunning && startTimestampRef.current !== null) {
      currentTotal = accumulatedMsRef.current + (performance.now() - startTimestampRef.current);
    }

    const lapDuration = currentTotal - lastLapTotalMsRef.current;
    lastLapTotalMsRef.current = currentTotal;

    const newLap: Lap = {
      id: `lap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lapNumber: laps.length + 1,
      lapTime: Math.max(0, lapDuration),
      overallTime: Math.max(0, currentTotal),
    };

    setLaps((prev) => [newLap, ...prev]);
  }, [isRunning, elapsedMs, laps.length]);

  return {
    elapsedMs,
    isRunning,
    laps,
    start,
    pause,
    resume,
    reset,
    recordLap,
  };
}
