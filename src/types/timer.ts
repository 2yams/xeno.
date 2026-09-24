export type TimerState = 'idle' | 'running' | 'paused' | 'completed';
export type TimerMode = 'timer' | 'stopwatch';
export type TimeUnit = 'hours' | 'minutes' | 'seconds';

export interface TimerPreset {
  id: string;
  name: string;
  duration: number; // in seconds
  createdAt: number;
  updatedAt: number;
}

export interface Lap {
  id: string;
  lapNumber: number;
  lapTime: number; // in milliseconds
  overallTime: number; // in milliseconds
}

export interface TimerStateSnapshot {
  mode: TimerMode;
  targetDuration: number;
  remainingSeconds: number;
  targetEndTime: number | null;
  startedAt: number | null;
  state: TimerState;
  updatedAt: number;
}
