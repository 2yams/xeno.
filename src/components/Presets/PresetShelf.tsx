import React, { useState, useRef } from 'react';
import { MoreVertical, Copy, Trash2, Edit2, Play } from 'lucide-react';
import { TimerPreset } from '../../types/timer';
import { formatDurationCompact } from '../../utils/time';

interface PresetShelfProps {
  presets: TimerPreset[];
  activeDuration: number;
  onSelectPreset: (preset: TimerPreset, autoStart?: boolean) => void;
  onRenamePreset: (id: string, newName: string) => void;
  onEditPresetDuration: (id: string, newDuration: number) => void;
  onDuplicatePreset: (preset: TimerPreset) => void;
  onDeletePreset: (id: string) => void;
  onHaptic?: (type: 'light' | 'medium') => void;
}

export const PresetShelf: React.FC<PresetShelfProps> = ({
  presets,
  activeDuration,
  onSelectPreset,
  onRenamePreset,
  onEditPresetDuration,
  onDuplicatePreset,
  onDeletePreset,
  onHaptic,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null);
  const [editName, setEditName] = useState('');
  const [editMinutes, setEditMinutes] = useState(25);
  const longPressTimerRef = useRef<number | null>(null);

  const handleTouchStart = (preset: TimerPreset) => {
    longPressTimerRef.current = window.setTimeout(() => {
      onHaptic?.('medium');
      setActiveMenuId(preset.id);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleStartEdit = (preset: TimerPreset) => {
    setEditingPreset(preset);
    setEditName(preset.name);
    setEditMinutes(Math.round(preset.duration / 60));
    setActiveMenuId(null);
  };

  const handleSaveEdit = () => {
    if (editingPreset) {
      onRenamePreset(editingPreset.id, editName.trim() || 'Timer');
      onEditPresetDuration(editingPreset.id, Math.max(1, editMinutes * 60));
      setEditingPreset(null);
    }
  };

  return (
    <section aria-label="Saved Presets" className="w-full select-none mt-auto pt-4 pb-2">
      {/* Subtle shelf divider */}
      <div className="w-full max-w-2xl mx-auto px-4 mb-2 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[var(--muted)]">
        <span>Presets</span>
        <span className="opacity-60">{presets.length} saved</span>
      </div>

      {/* Horizontal scrolling shelf */}
      <div className="w-full overflow-x-auto no-scrollbar py-2 px-4">
        <div className="flex items-center gap-2.5 max-w-2xl mx-auto min-w-max pb-1">
          {presets.length === 0 ? (
            <p className="text-xs font-mono text-[var(--muted)] py-3 px-2 italic">
              No saved timers yet. Save one and it'll appear here.
            </p>
          ) : (
            presets.map((preset) => {
              const isCurrent = activeDuration === preset.duration;
              const isMenuOpen = activeMenuId === preset.id;

              return (
                <div
                  key={preset.id}
                  className="relative group flex items-center"
                  onTouchStart={() => handleTouchStart(preset)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  {/* Preset Pill Button */}
                  <button
                    onClick={() => {
                      onHaptic?.('light');
                      onSelectPreset(preset);
                    }}
                    title={`Load ${preset.name} (${formatDurationCompact(preset.duration)})`}
                    className={`flex flex-col items-start px-3.5 py-2.5 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                      isCurrent
                        ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-xs'
                        : 'bg-[var(--panel)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <span className="font-mono text-xs font-medium tracking-tight truncate max-w-[120px]">
                      {preset.name}
                    </span>
                    <span
                      className={`font-mono text-[11px] tabular-nums mt-0.5 ${
                        isCurrent ? 'opacity-80' : 'text-[var(--muted)]'
                      }`}
                    >
                      {formatDurationCompact(preset.duration)}
                    </span>
                  </button>

                  {/* Context Menu Action Trigger Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : preset.id);
                    }}
                    title="Preset options"
                    aria-label={`Options for ${preset.name}`}
                    className={`absolute top-1 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                      isCurrent
                        ? 'text-[var(--bg)] hover:bg-black/10'
                        : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--border)]'
                    }`}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>

                  {/* Context Popover Menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute bottom-full left-0 mb-2 w-36 rounded-lg bg-[var(--panel)] border border-[var(--border)] shadow-xl z-30 font-mono text-xs overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onSelectPreset(preset, true);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--border)] flex items-center gap-2 text-[var(--fg)]"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                      <button
                        onClick={() => handleStartEdit(preset)}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--border)] flex items-center gap-2 text-[var(--fg)]"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          onDuplicatePreset(preset);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--border)] flex items-center gap-2 text-[var(--fg)]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeletePreset(preset.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Preset Modal */}
      {editingPreset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setEditingPreset(null)}
        >
          <div
            className="w-full max-w-xs p-5 rounded-xl bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] shadow-2xl font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm uppercase tracking-wider mb-4 opacity-90">Edit Preset</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[var(--muted)] uppercase block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--fg)] outline-none focus:border-[var(--fg)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--muted)] uppercase block mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--fg)] outline-none focus:border-[var(--fg)]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditingPreset(null)}
                className="flex-1 py-2 text-xs uppercase rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 text-xs uppercase rounded-lg bg-[var(--fg)] text-[var(--bg)] font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
