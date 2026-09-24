import React from 'react';
import { formatDurationCompact } from '../../utils/time';

interface QuickDurationsProps {
  durations: number[]; // in seconds
  currentDuration: number;
  onSelectDuration: (sec: number) => void;
  onHaptic?: (type: 'light') => void;
}

export const QuickDurations: React.FC<QuickDurationsProps> = ({
  durations,
  currentDuration,
  onSelectDuration,
  onHaptic,
}) => {
  return (
    <div className="w-full max-w-sm mx-auto px-4 my-2 flex items-center justify-center gap-1.5 flex-wrap">
      {durations.map((seconds) => {
        const isSelected = currentDuration === seconds;
        return (
          <button
            key={seconds}
            onClick={() => {
              onHaptic?.('light');
              onSelectDuration(seconds);
            }}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all active:scale-95 ${
              isSelected
                ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-medium shadow-2xs'
                : 'bg-[var(--panel)]/60 border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--muted)]'
            }`}
          >
            {formatDurationCompact(seconds)}
          </button>
        );
      })}
    </div>
  );
};
