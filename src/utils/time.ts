export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export function secondsToParts(totalSeconds: number): TimeParts {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return { hours, minutes, seconds };
}

export function partsToSeconds(parts: TimeParts): number {
  return Math.max(0, parts.hours * 3600 + parts.minutes * 60 + parts.seconds);
}

export function pad2(val: number): string {
  return val.toString().padStart(2, '0');
}

export function formatTimerDisplay(totalSeconds: number): {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  hasHours: boolean;
} {
  const { hours, minutes, seconds } = secondsToParts(totalSeconds);
  return {
    hoursStr: pad2(hours),
    minutesStr: pad2(minutes),
    secondsStr: pad2(seconds),
    hasHours: true,
  };
}

export function formatStopwatch(ms: number): {
  minutes: string;
  seconds: string;
  hundredths: string;
  hours?: string;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  return {
    hours: hours > 0 ? pad2(hours) : undefined,
    minutes: pad2(minutes),
    seconds: pad2(seconds),
    hundredths: pad2(hundredths),
  };
}

export function formatDurationCompact(seconds: number): string {
  const { hours, minutes, seconds: secs } = secondsToParts(seconds);
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  if (minutes > 0 && secs === 0) {
    return `${minutes}m`;
  }
  if (minutes > 0 && secs > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
