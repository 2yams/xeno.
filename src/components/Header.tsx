import React from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { TimerMode } from '../types/timer';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  mode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
  onOpenSettings: () => void;
  onOpenAmbientPanel: () => void;
  isAmbientPlaying: boolean;
  ambientSoundName: string;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  onOpenSettings,
  onOpenAmbientPanel,
  isAmbientPlaying,
  ambientSoundName,
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 pt-4 pb-2 sm:pt-6 flex items-center justify-between z-10 select-none">
      {/* Brand logo: strictly xeno. in monospace */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-base sm:text-lg tracking-tight font-medium text-[var(--fg)]">
          xeno.
        </span>

        {/* Minimal Mode Switch */}
        <nav
          aria-label="Mode selector"
          className="flex items-center p-0.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]"
        >
          <button
            onClick={() => onSelectMode('timer')}
            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
              mode === 'timer'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-medium shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            timer
          </button>
          <button
            onClick={() => onSelectMode('stopwatch')}
            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
              mode === 'stopwatch'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-medium shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            stopwatch
          </button>
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Ambient quick trigger */}
        <button
          onClick={onOpenAmbientPanel}
          title={isAmbientPlaying ? `Ambient sound: ${ambientSoundName}` : 'Ambient sound'}
          aria-label="Open ambient sound controls"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-md border transition-all active:scale-95 ${
            isAmbientPlaying
              ? 'bg-[var(--panel)] border-[var(--fg)] text-[var(--fg)]'
              : 'bg-transparent border-transparent text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--panel)]'
          }`}
        >
          {isAmbientPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
              <span className="hidden sm:inline text-[11px] capitalize opacity-90">
                {ambientSoundName}
              </span>
            </>
          ) : (
            <VolumeX className="w-3.5 h-3.5 opacity-60" />
          )}
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Settings (S)"
          className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--panel)] border border-transparent hover:border-[var(--border)] transition-all active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
