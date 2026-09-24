import React, { useState, useRef } from 'react';
import {
  X,
  Clock,
  Volume2,
  Palette,
  Sliders,
  Database,
  Keyboard,
  Upload,
  Download,
  RotateCcw,
  Bell,
  Sun,
  Image as ImageIcon,
} from 'lucide-react';
import { AppSettings } from '../../types/settings';
import { Theme } from '../../types/theme';
import { CompletionSoundType } from '../../types/audio';
import { TimerPreset } from '../../types/timer';
import { ThemeCustomizer } from '../Theme/ThemeCustomizer';
import { soundSynthesizer } from '../../services/audio/soundSynthesizer';
import { requestNotificationPermission } from '../../services/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  presets: TimerPreset[];
  onUpdatePresets: (presets: TimerPreset[]) => void;
  onSelectTheme: (theme: Theme) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetApp: () => void;
  onHaptic?: (type: 'light' | 'medium') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  presets,
  onUpdatePresets,
  onSelectTheme,
  onExportBackup,
  onImportBackup,
  onResetApp,
  onHaptic,
}) => {
  const [activeTab, setActiveTab] = useState<
    'timer' | 'audio' | 'appearance' | 'interaction' | 'backup'
  >('timer');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const [imageWarning, setImageWarning] = useState<string>('');

  if (!isOpen) return null;

  const handleTestSound = (snd: CompletionSoundType) => {
    soundSynthesizer.playSound(snd, settings.audio.completionVolume);
  };

  const handleToggleNotifications = async () => {
    if (!settings.interaction.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      onUpdateSettings((prev) => ({
        ...prev,
        interaction: {
          ...prev.interaction,
          notificationsEnabled: granted,
        },
      }));
    } else {
      onUpdateSettings((prev) => ({
        ...prev,
        interaction: {
          ...prev.interaction,
          notificationsEnabled: false,
        },
      }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageWarning('Image is over 5MB. A smaller image is recommended for best battery and speed.');
    } else {
      setImageWarning('');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateSettings((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          backgroundImage: {
            ...prev.appearance.backgroundImage,
            dataUrl,
            url: '',
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full max-h-[85vh] rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] shadow-2xl flex flex-col font-mono select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <span className="text-sm font-semibold tracking-wider uppercase">Settings</span>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--panel)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 pt-3 pb-1 gap-1 border-b border-[var(--border)] overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'timer'
                ? 'bg-[var(--panel)] text-[var(--fg)] font-medium border border-[var(--border)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audio'
                ? 'bg-[var(--panel)] text-[var(--fg)] font-medium border border-[var(--border)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'appearance'
                ? 'bg-[var(--panel)] text-[var(--fg)] font-medium border border-[var(--border)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Themes
          </button>
          <button
            onClick={() => setActiveTab('interaction')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'interaction'
                ? 'bg-[var(--panel)] text-[var(--fg)] font-medium border border-[var(--border)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'backup'
                ? 'bg-[var(--panel)] text-[var(--fg)] font-medium border border-[var(--border)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            Data
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* TAB: TIMER */}
          {activeTab === 'timer' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] uppercase text-[var(--muted)] mb-1">
                  Default Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={Math.round(settings.timer.defaultDuration / 60)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 25;
                    onUpdateSettings((prev) => ({
                      ...prev,
                      timer: { ...prev.timer, defaultDuration: val * 60 },
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--fg)] outline-none focus:border-[var(--fg)]"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <div>
                    <div className="font-medium text-[11px] uppercase">Show Hours Always</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      Always display 00:25:00 instead of 25:00
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.timer.showHoursAlways}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        timer: { ...prev.timer, showHoursAlways: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <div>
                    <div className="font-medium text-[11px] uppercase">Auto-Start Presets</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      Automatically start counting when tapping a preset
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.timer.autoStartPreset}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        timer: { ...prev.timer, autoStartPreset: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <div>
                    <div className="font-medium text-[11px] uppercase">Auto-Reset on Finish</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      Instantly reset timer to initial duration once completed
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.timer.autoReset}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        timer: { ...prev.timer, autoReset: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Quick duration buttons editor */}
              <div className="pt-2">
                <span className="block text-[11px] uppercase text-[var(--muted)] mb-2">
                  Quick Durations (Minutes)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 10, 15, 20, 25, 30, 45, 60, 90].map((mins) => {
                    const sec = mins * 60;
                    const isIncluded = settings.interaction.quickDurations.includes(sec);
                    return (
                      <button
                        key={mins}
                        onClick={() => {
                          onUpdateSettings((prev) => {
                            const list = isIncluded
                              ? prev.interaction.quickDurations.filter((s) => s !== sec)
                              : [...prev.interaction.quickDurations, sec].sort((a, b) => a - b);
                            return {
                              ...prev,
                              interaction: {
                                ...prev.interaction,
                                quickDurations: list.length > 0 ? list : [300, 1500],
                              },
                            };
                          });
                        }}
                        className={`px-2.5 py-1 text-[11px] rounded-md border transition ${
                          isIncluded
                            ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                            : 'bg-[var(--panel)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]'
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              <div>
                <span className="block text-[11px] uppercase text-[var(--muted)] mb-2">
                  Completion Tone
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      'soft-bell',
                      'gentle-chime',
                      'digital-beep',
                      'soft-click',
                      'minimal-tone',
                      'silent',
                    ] as CompletionSoundType[]
                  ).map((snd) => {
                    const isSelected = settings.audio.completionSound === snd;
                    return (
                      <div
                        key={snd}
                        onClick={() => {
                          onUpdateSettings((prev) => ({
                            ...prev,
                            audio: { ...prev.audio, completionSound: snd },
                          }));
                          if (snd !== 'silent') handleTestSound(snd);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[var(--panel)] border-[var(--fg)] text-[var(--fg)] font-medium shadow-2xs'
                            : 'bg-[var(--panel)]/40 border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]'
                        }`}
                      >
                        <span className="capitalize">{snd.replace('-', ' ')}</span>
                        {snd !== 'silent' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestSound(snd);
                            }}
                            className="p-1 text-[var(--muted)] hover:text-[var(--fg)]"
                            title="Play sample"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] uppercase mb-1">
                  <span>Tone Volume</span>
                  <span className="tabular-nums">
                    {Math.round(settings.audio.completionVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.audio.completionVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    onUpdateSettings((prev) => ({
                      ...prev,
                      audio: { ...prev.audio, completionVolume: vol },
                    }));
                  }}
                  className="w-full accent-[var(--fg)] cursor-pointer"
                />
              </div>

              {/* Completion Action Toggles */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <span className="block text-[11px] uppercase text-[var(--muted)] mb-1">
                  When Timer Reaches Zero
                </span>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <span>Play notification tone</span>
                  <input
                    type="checkbox"
                    checked={settings.audio.actionSound}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, actionSound: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <span>Fade out white noise on completion</span>
                  <input
                    type="checkbox"
                    checked={settings.audio.whiteNoiseFadeOut}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        audio: { ...prev.audio, whiteNoiseFadeOut: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE & THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <span className="block text-[11px] uppercase text-[var(--muted)] mb-2">
                  Theme Palette
                </span>
                <ThemeCustomizer
                  currentThemeId={settings.appearance.themeId}
                  customThemes={settings.appearance.customThemes}
                  onSelectTheme={(th) => {
                    onSelectTheme(th);
                    onUpdateSettings((prev) => ({
                      ...prev,
                      appearance: { ...prev.appearance, themeId: th.id },
                    }));
                  }}
                  onSaveCustomTheme={(th) => {
                    onUpdateSettings((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        customThemes: [...prev.appearance.customThemes, th],
                      },
                    }));
                  }}
                  onDeleteCustomTheme={(id) => {
                    onUpdateSettings((prev) => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        customThemes: prev.appearance.customThemes.filter((t) => t.id !== id),
                      },
                    }));
                  }}
                />
              </div>

              {/* Background Image Section */}
              <div className="pt-3 border-t border-[var(--border)] space-y-4">
                <span className="block text-[11px] uppercase text-[var(--muted)]">
                  Background Image
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => imageUploadRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--fg)] hover:border-[var(--muted)] flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    type="file"
                    ref={imageUploadRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {(settings.appearance.backgroundImage.dataUrl ||
                    settings.appearance.backgroundImage.url) && (
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          appearance: {
                            ...prev.appearance,
                            backgroundImage: {
                              ...prev.appearance.backgroundImage,
                              url: '',
                              dataUrl: '',
                            },
                          },
                        }))
                      }
                      className="px-3 py-2 rounded-lg border border-[var(--border)] text-rose-400 hover:bg-rose-500/10"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {imageWarning && (
                  <p className="text-[11px] text-amber-400 leading-tight">{imageWarning}</p>
                )}

                <div>
                  <label className="block text-[10px] uppercase text-[var(--muted)] mb-1">
                    Or Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={settings.appearance.backgroundImage.url}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          backgroundImage: {
                            ...prev.appearance.backgroundImage,
                            url: e.target.value,
                            dataUrl: '',
                          },
                        },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--fg)] text-xs outline-none"
                  />
                </div>

                {(settings.appearance.backgroundImage.dataUrl ||
                  settings.appearance.backgroundImage.url) && (
                  <div className="space-y-3 p-3 rounded-xl bg-[var(--panel)]/60 border border-[var(--border)]">
                    {/* Opacity slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--muted)] uppercase mb-1">
                        <span>Image Opacity</span>
                        <span>
                          {Math.round(settings.appearance.backgroundImage.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={settings.appearance.backgroundImage.opacity}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              backgroundImage: {
                                ...prev.appearance.backgroundImage,
                                opacity: parseFloat(e.target.value),
                              },
                            },
                          }))
                        }
                        className="w-full accent-[var(--fg)] cursor-pointer"
                      />
                    </div>

                    {/* Dark Overlay slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--muted)] uppercase mb-1">
                        <span>Dark Overlay</span>
                        <span>
                          {Math.round(settings.appearance.backgroundImage.overlay * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.appearance.backgroundImage.overlay}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              backgroundImage: {
                                ...prev.appearance.backgroundImage,
                                overlay: parseFloat(e.target.value),
                              },
                            },
                          }))
                        }
                        className="w-full accent-[var(--fg)] cursor-pointer"
                      />
                    </div>

                    {/* Blur slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--muted)] uppercase mb-1">
                        <span>Blur Filter</span>
                        <span>{settings.appearance.backgroundImage.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="1"
                        value={settings.appearance.backgroundImage.blur}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            appearance: {
                              ...prev.appearance,
                              backgroundImage: {
                                ...prev.appearance.backgroundImage,
                                blur: parseInt(e.target.value, 10),
                              },
                            },
                          }))
                        }
                        className="w-full accent-[var(--fg)] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INTERACTION & SHORTCUTS */}
          {activeTab === 'interaction' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <div>
                    <div className="font-medium text-[11px] uppercase">Haptic Feedback</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      Subtle tactile vibrations on buttons and digits
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.interaction.hapticFeedback}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        interaction: { ...prev.interaction, hapticFeedback: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <div>
                    <div className="font-medium text-[11px] uppercase">Keep Screen Awake</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      Prevents phone display from sleeping while timer runs
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.interaction.keepScreenAwake}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        interaction: { ...prev.interaction, keepScreenAwake: e.target.checked },
                      }))
                    }
                    className="accent-[var(--fg)] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--panel)] border border-[var(--border)] cursor-pointer">
                  <div>
                    <div className="font-medium text-[11px] uppercase">Push Notifications</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      Alert when timer ends while tab is in background
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.interaction.notificationsEnabled}
                    onChange={handleToggleNotifications}
                    className="accent-[var(--fg)] w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Desktop Keyboard Shortcuts Reference */}
              <div className="pt-3 border-t border-[var(--border)]">
                <span className="block text-[11px] uppercase text-[var(--muted)] mb-3">
                  Keyboard Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Start / Pause</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      Space
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Reset</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      R
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Lap (Stopwatch)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      L
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Adjust Unit</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      ↑ / ↓
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Toggle Ambience</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      N
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Settings</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      S
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                    <span className="text-[var(--muted)]">Direct Typing</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] font-semibold">
                      0-9
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BACKUP & PRESETS DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                All presets, themes, and audio customizations are stored strictly on your device.
                You can export your configuration or restore from a backup file.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onExportBackup}
                  className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] text-[var(--fg)] hover:border-[var(--muted)] flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Backup</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] text-[var(--fg)] hover:border-[var(--muted)] flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Backup</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImportBackup(f);
                  }}
                  className="hidden"
                />
              </div>

              {/* Reset Application */}
              <div className="pt-4 border-t border-[var(--border)]">
                <span className="block text-[11px] uppercase text-rose-400 mb-1 font-semibold">
                  Danger Zone
                </span>
                <p className="text-[10px] text-[var(--muted)] mb-3">
                  Erase all saved presets, custom themes, and cached settings back to initial state.
                </p>
                <button
                  onClick={() => {
                    if (
                      window.confirm('Are you sure you want to reset xeno.? All presets and settings will be restored to defaults.')
                    ) {
                      onResetApp();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset xeno. Application</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
