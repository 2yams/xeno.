import React, { useState } from 'react';
import { Volume2, Play, Pause, X, Radio } from 'lucide-react';
import { WhiteNoiseType, AudioSettings } from '../../types/audio';
import { ambientEngine } from '../../services/audio/ambientEngine';
import { soundSynthesizer } from '../../services/audio/soundSynthesizer';

interface AmbientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (updated: Partial<AudioSettings>) => void;
  isAmbientPlaying: boolean;
  setIsAmbientPlaying: (playing: boolean) => void;
  onHaptic?: (type: 'light' | 'medium') => void;
}

const AMBIENT_SOUNDS: { type: WhiteNoiseType; name: string }[] = [
  { type: 'brown', name: 'Brown Noise' },
  { type: 'pink', name: 'Pink Noise' },
  { type: 'white', name: 'White Noise' },
  { type: 'rain', name: 'Rain' },
  { type: 'fan', name: 'Fan' },
  { type: 'fireplace', name: 'Fireplace' },
  { type: 'ocean', name: 'Ocean' },
  { type: 'forest', name: 'Forest' },
  { type: 'cafe', name: 'Café' },
];

export const AmbientPanel: React.FC<AmbientPanelProps> = ({
  isOpen,
  onClose,
  audioSettings,
  onUpdateAudioSettings,
  isAmbientPlaying,
  setIsAmbientPlaying,
  onHaptic,
}) => {
  const [activeTab, setActiveTab] = useState<'ambient' | 'mixer'>('ambient');

  if (!isOpen) return null;

  const handleToggleAmbient = () => {
    onHaptic?.('medium');
    if (isAmbientPlaying) {
      ambientEngine.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientEngine.play(audioSettings.whiteNoiseType, audioSettings.whiteNoiseVolume);
      setIsAmbientPlaying(true);
    }
  };

  const handleSelectSound = (type: WhiteNoiseType) => {
    onHaptic?.('light');
    onUpdateAudioSettings({ whiteNoiseType: type });
    if (isAmbientPlaying) {
      ambientEngine.play(type, audioSettings.whiteNoiseVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    onUpdateAudioSettings({ whiteNoiseVolume: vol });
    ambientEngine.setVolume(vol);
  };

  const testCompletionSound = () => {
    soundSynthesizer.playSound(audioSettings.completionSound, audioSettings.completionVolume);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] shadow-2xl p-5 font-mono select-none max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">Audio & Ambience</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-[var(--muted)] hover:text-[var(--fg)] rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two Tabs: Ambient and Mixer */}
        <div className="flex p-1 my-4 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-xs">
          <button
            onClick={() => setActiveTab('ambient')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              activeTab === 'ambient'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-medium shadow-2xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Ambient
          </button>
          <button
            onClick={() => setActiveTab('mixer')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              activeTab === 'mixer'
                ? 'bg-[var(--fg)] text-[var(--bg)] font-medium shadow-2xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Mixer
          </button>
        </div>

        {/* Tab 1: Ambient Sounds */}
        {activeTab === 'ambient' && (
          <div className="space-y-4">
            {/* Play/Pause Master Ambient */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider">
                  {audioSettings.whiteNoiseType.toUpperCase()}
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {isAmbientPlaying ? 'Playing continuously' : 'Paused'}
                </div>
              </div>

              <button
                onClick={handleToggleAmbient}
                aria-label={isAmbientPlaying ? 'Pause ambient' : 'Play ambient'}
                className="w-9 h-9 rounded-full bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center shadow-xs active:scale-90 transition-transform"
              >
                {isAmbientPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[var(--muted)] uppercase mb-1.5">
                <span>Volume</span>
                <span className="tabular-nums">
                  {Math.round(audioSettings.whiteNoiseVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioSettings.whiteNoiseVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[var(--fg)] cursor-pointer"
              />
            </div>

            {/* Sound Selection Grid */}
            <div>
              <div className="text-[11px] text-[var(--muted)] uppercase mb-2">Procedural Sounds</div>
              <div className="grid grid-cols-3 gap-1.5">
                {AMBIENT_SOUNDS.map((sound) => {
                  const isSelected = audioSettings.whiteNoiseType === sound.type;
                  return (
                    <button
                      key={sound.type}
                      onClick={() => handleSelectSound(sound.type)}
                      className={`py-2 px-2 text-[11px] rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-medium shadow-2xs'
                          : 'bg-[var(--panel)]/50 border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--muted)]'
                      }`}
                    >
                      {sound.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Automation options */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-[11px] text-[var(--muted)]">Auto-start with timer</span>
                <input
                  type="checkbox"
                  checked={audioSettings.whiteNoiseAutoStart}
                  onChange={(e) =>
                    onUpdateAudioSettings({ whiteNoiseAutoStart: e.target.checked })
                  }
                  className="accent-[var(--fg)] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-[11px] text-[var(--muted)]">Stop when timer ends</span>
                <input
                  type="checkbox"
                  checked={audioSettings.whiteNoiseAutoStop}
                  onChange={(e) =>
                    onUpdateAudioSettings({ whiteNoiseAutoStop: e.target.checked })
                  }
                  className="accent-[var(--fg)] rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Audio Mixer */}
        {activeTab === 'mixer' && (
          <div className="space-y-4">
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Adjust balance between timer notification tones and ambient sound.
            </p>

            {/* Timer Sound Volume */}
            <div className="p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase text-[11px]">Timer Completion</span>
                <button
                  onClick={testCompletionSound}
                  className="text-[10px] uppercase text-[var(--muted)] hover:text-[var(--fg)] underline"
                >
                  Test
                </button>
              </div>
              <div className="flex justify-between text-[11px] text-[var(--muted)]">
                <span className="capitalize">{audioSettings.completionSound.replace('-', ' ')}</span>
                <span className="tabular-nums">
                  {Math.round(audioSettings.completionVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.completionVolume}
                onChange={(e) =>
                  onUpdateAudioSettings({ completionVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-[var(--fg)] cursor-pointer"
              />
            </div>

            {/* Ambient Noise Volume */}
            <div className="p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase text-[11px]">Ambient Sound</span>
                <span className="tabular-nums text-[11px] text-[var(--muted)]">
                  {Math.round(audioSettings.whiteNoiseVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.whiteNoiseVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[var(--fg)] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
