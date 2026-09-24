import React, { useState, useEffect } from 'react';
import { formatDurationCompact } from '../../utils/time';
import { BookmarkPlus, X } from 'lucide-react';

interface SavePresetModalProps {
  isOpen: boolean;
  durationSeconds: number;
  onClose: () => void;
  onSave: (name: string, duration: number) => void;
  onHaptic?: (type: 'light' | 'medium') => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  durationSeconds,
  onClose,
  onSave,
  onHaptic,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const compact = formatDurationCompact(durationSeconds);
      setName(`Timer ${compact}`);
    }
  }, [isOpen, durationSeconds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onHaptic?.('medium');
    onSave(name.trim() || 'Timer', durationSeconds);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs p-5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] shadow-2xl font-mono select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">Save Preset</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-[var(--muted)] hover:text-[var(--fg)] rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between text-[11px] text-[var(--muted)] uppercase mb-1">
              <span>Duration</span>
              <span className="text-[var(--fg)] font-medium">
                {formatDurationCompact(durationSeconds)}
              </span>
            </div>
            <input
              type="text"
              autoFocus
              value={name}
              placeholder="e.g. Deep Work, Workout, Reading"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--panel)] border border-[var(--border)] text-[var(--fg)] outline-none focus:border-[var(--fg)]"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs uppercase rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs uppercase rounded-xl bg-[var(--fg)] text-[var(--bg)] font-semibold shadow-xs active:scale-95 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
