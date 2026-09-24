import React, { useState } from 'react';
import { Theme } from '../../types/theme';
import { BUILTIN_THEMES } from '../../themes/themes';
import { Plus, Trash2, Check } from 'lucide-react';

interface ThemeCustomizerProps {
  currentThemeId: string;
  customThemes: Theme[];
  onSelectTheme: (theme: Theme) => void;
  onSaveCustomTheme: (theme: Theme) => void;
  onDeleteCustomTheme: (id: string) => void;
  onHaptic?: (type: 'light' | 'medium') => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentThemeId,
  customThemes,
  onSelectTheme,
  onSaveCustomTheme,
  onDeleteCustomTheme,
  onHaptic,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newThemeName, setNewThemeName] = useState('Custom Theme');
  const [newBg, setNewBg] = useState('#0d0f12');
  const [newFg, setNewFg] = useState('#e6edf3');
  const [newAccent, setNewAccent] = useState('#58a6ff');
  const [newMuted, setNewMuted] = useState('#8b949e');
  const [newPanel, setNewPanel] = useState('#161b22');
  const [newBorder, setNewBorder] = useState('#30363d');

  const allThemes = [...BUILTIN_THEMES, ...customThemes];

  const handleCreate = () => {
    const theme: Theme = {
      id: `custom-${Date.now()}`,
      name: newThemeName.trim() || 'Custom',
      bg: newBg,
      fg: newFg,
      accent: newAccent,
      muted: newMuted,
      panel: newPanel,
      border: newBorder,
      isDark: true,
      isCustom: true,
    };
    onSaveCustomTheme(theme);
    onSelectTheme(theme);
    setIsCreating(false);
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Theme Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allThemes.map((th) => {
          const isSelected = th.id === currentThemeId;
          return (
            <div
              key={th.id}
              onClick={() => {
                onHaptic?.('light');
                onSelectTheme(th);
              }}
              className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[var(--fg)] ring-1 ring-[var(--fg)] shadow-xs'
                  : 'border-[var(--border)] hover:border-[var(--muted)]'
              }`}
              style={{ backgroundColor: th.bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-medium text-[11px] truncate pr-1"
                  style={{ color: th.fg }}
                >
                  {th.name}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: th.accent }} />
                )}
              </div>

              {/* Color swatches preview */}
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: th.fg }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: th.accent }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: th.panel }}
                />
              </div>

              {/* Delete button if custom */}
              {th.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomTheme(th.id);
                  }}
                  title="Delete theme"
                  className="absolute bottom-2 right-2 p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Theme Creator Toggle */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--fg)] flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Custom Theme</span>
        </button>
      ) : (
        <div className="p-3.5 rounded-xl bg-[var(--panel)] border border-[var(--border)] space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-xs uppercase">New Custom Theme</span>
            <button
              onClick={() => setIsCreating(false)}
              className="text-[11px] text-[var(--muted)] hover:text-[var(--fg)]"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1">
              Theme Name
            </label>
            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span>Background</span>
              <input
                type="color"
                value={newBg}
                onChange={(e) => setNewBg(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span>Foreground</span>
              <input
                type="color"
                value={newFg}
                onChange={(e) => setNewFg(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span>Accent</span>
              <input
                type="color"
                value={newAccent}
                onChange={(e) => setNewAccent(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span>Muted Text</span>
              <input
                type="color"
                value={newMuted}
                onChange={(e) => setNewMuted(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span>Panel</span>
              <input
                type="color"
                value={newPanel}
                onChange={(e) => setNewPanel(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span>Border</span>
              <input
                type="color"
                value={newBorder}
                onChange={(e) => setNewBorder(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
              />
            </label>
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-2 rounded-lg bg-[var(--fg)] text-[var(--bg)] font-medium uppercase text-xs tracking-wider"
          >
            Save & Apply Theme
          </button>
        </div>
      )}
    </div>
  );
};
