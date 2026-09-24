import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TimerMode, TimerPreset, TimeUnit } from './types/timer';
import { AppSettings } from './types/settings';
import { Theme } from './types/theme';
import {
  loadSettings,
  saveSettings,
  loadPresets,
  savePresets,
  exportBackup,
  importBackup,
  resetApplicationData,
  DEFAULT_SETTINGS,
  DEFAULT_PRESETS,
} from './services/storage';
import { BUILTIN_THEMES, applyTheme } from './themes/themes';
import { soundSynthesizer } from './services/audio/soundSynthesizer';
import { ambientEngine } from './services/audio/ambientEngine';
import { sendTimerCompletedNotification } from './services/notifications';
import { useTimer } from './hooks/useTimer';
import { useStopwatch } from './hooks/useStopwatch';
import { useWakeLock } from './hooks/useWakeLock';
import { useHaptics } from './hooks/useHaptics';

import { Header } from './components/Header';
import { TimerDisplay } from './components/Timer/TimerDisplay';
import { TimerControls } from './components/Timer/TimerControls';
import { QuickDurations } from './components/Timer/QuickDurations';
import { StopwatchDisplay } from './components/Stopwatch/StopwatchDisplay';
import { PresetShelf } from './components/Presets/PresetShelf';
import { AmbientPanel } from './components/Ambient/AmbientPanel';
import { SettingsModal } from './components/Settings/SettingsModal';
import { SavePresetModal } from './components/Presets/SavePresetModal';
import { BackgroundOverlay } from './components/Background/BackgroundOverlay';
import { OfflineIndicator } from './components/OfflineIndicator';
import { FirstLaunchHint } from './components/FirstLaunchHint';

export function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [presets, setPresets] = useState<TimerPreset[]>(loadPresets);
  const [mode, setMode] = useState<TimerMode>('timer');

  // Modals & Sheets
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAmbientOpen, setIsAmbientOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Haptics & WakeLock
  const { trigger: triggerHaptic } = useHaptics(settings.interaction.hapticFeedback);

  // Current Theme lookup
  const currentTheme = useMemo(() => {
    const allThemes = [...BUILTIN_THEMES, ...settings.appearance.customThemes];
    return allThemes.find((t) => t.id === settings.appearance.themeId) || BUILTIN_THEMES[0];
  }, [settings.appearance.themeId, settings.appearance.customThemes]);

  // Apply Theme CSS variables on load or theme change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Save settings when changed
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Save presets when changed
  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  // Handler for timer completion
  const handleTimerComplete = useCallback(() => {
    // 1. Sound
    if (settings.audio.actionSound) {
      soundSynthesizer.playSound(
        settings.audio.completionSound,
        settings.audio.completionVolume
      );
    }

    // 2. Notification
    if (settings.interaction.notificationsEnabled) {
      sendTimerCompletedNotification('Timer');
    }

    // 3. Haptics
    triggerHaptic('success');

    // 4. White noise completion reaction
    if (ambientEngine.getIsPlaying()) {
      if (settings.audio.whiteNoiseFadeOut) {
        ambientEngine.fadeOut(settings.audio.fadeOutDuration, () => {
          setIsAmbientPlaying(false);
        });
      } else if (settings.audio.whiteNoiseAutoStop) {
        ambientEngine.stop();
        setIsAmbientPlaying(false);
      }
    }

    // 5. Auto reset if enabled
    if (settings.timer.autoReset) {
      setTimeout(() => {
        timerEngine.reset();
      }, 3000);
    }
  }, [settings, triggerHaptic]);

  // Initialize Timer Engine
  const timerEngine = useTimer({
    defaultDuration: settings.timer.defaultDuration,
    onComplete: handleTimerComplete,
  });

  // Stopwatch Engine
  const stopwatchEngine = useStopwatch();

  // Wake Lock during active running
  const isWakeLockActive =
    settings.interaction.keepScreenAwake &&
    (timerEngine.timerState === 'running' || stopwatchEngine.isRunning);
  useWakeLock(isWakeLockActive);

  // Ambient auto-start handling when timer starts
  const handleStartTimer = () => {
    timerEngine.start();
    if (settings.audio.whiteNoiseAutoStart && !ambientEngine.getIsPlaying()) {
      ambientEngine.play(settings.audio.whiteNoiseType, settings.audio.whiteNoiseVolume);
      setIsAmbientPlaying(true);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is actively focused on form inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (mode === 'timer') {
          if (timerEngine.timerState === 'running') {
            timerEngine.pause();
          } else if (timerEngine.timerState === 'paused') {
            timerEngine.resume();
          } else if (timerEngine.timerState === 'completed') {
            timerEngine.reset();
          } else {
            handleStartTimer();
          }
        } else {
          if (stopwatchEngine.isRunning) {
            stopwatchEngine.pause();
          } else {
            stopwatchEngine.start();
          }
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (mode === 'timer') {
          timerEngine.reset();
        } else {
          stopwatchEngine.reset();
        }
      } else if (e.key.toLowerCase() === 'l' && mode === 'stopwatch') {
        e.preventDefault();
        stopwatchEngine.recordLap();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (isAmbientPlaying) {
          ambientEngine.stop();
          setIsAmbientPlaying(false);
        } else {
          ambientEngine.play(settings.audio.whiteNoiseType, settings.audio.whiteNoiseVolume);
          setIsAmbientPlaying(true);
        }
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsAmbientOpen(false);
        setIsSavePresetOpen(false);
        timerEngine.setActiveUnit(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    mode,
    timerEngine,
    stopwatchEngine,
    isAmbientPlaying,
    settings.audio,
    handleStartTimer,
  ]);

  // Preset Handlers
  const handleSelectPreset = (preset: TimerPreset, autoStart = settings.timer.autoStartPreset) => {
    timerEngine.setDuration(preset.duration, autoStart);
  };

  const handleRenamePreset = (id: string, newName: string) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p))
    );
  };

  const handleEditPresetDuration = (id: string, newDuration: number) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, duration: newDuration, updatedAt: Date.now() } : p))
    );
  };

  const handleDuplicatePreset = (preset: TimerPreset) => {
    const duplicated: TimerPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      name: `${preset.name} Copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPresets((prev) => [duplicated, ...prev]);
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveNewPreset = (name: string, duration: number) => {
    const newPreset: TimerPreset = {
      id: `preset-${Date.now()}`,
      name,
      duration,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPresets((prev) => [newPreset, ...prev]);
  };

  // Export / Import / Reset
  const handleExportBackup = () => {
    const jsonStr = exportBackup(presets, settings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xeno-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = importBackup(content);
      if (res.success) {
        if (res.presets) setPresets(res.presets);
        if (res.settings) setSettings(res.settings);
        alert('xeno. settings successfully imported.');
      } else {
        alert(res.error || 'Failed to import backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetApp = () => {
    resetApplicationData();
    setSettings(DEFAULT_SETTINGS);
    setPresets(DEFAULT_PRESETS);
    timerEngine.reset();
    stopwatchEngine.reset();
    ambientEngine.stop();
    setIsAmbientPlaying(false);
    setIsSettingsOpen(false);
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Background Image & Effects Overlay */}
      <BackgroundOverlay settings={settings.appearance.backgroundImage} />

      {/* Header Bar */}
      <Header
        mode={mode}
        onSelectMode={(m) => {
          triggerHaptic('light');
          setMode(m);
        }}
        onOpenSettings={() => {
          triggerHaptic('light');
          setIsSettingsOpen(true);
        }}
        onOpenAmbientPanel={() => {
          triggerHaptic('light');
          setIsAmbientOpen(true);
        }}
        isAmbientPlaying={isAmbientPlaying}
        ambientSoundName={settings.audio.whiteNoiseType}
      />

      {/* Main Center Instrument */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 my-auto">
        {mode === 'timer' ? (
          <div className="w-full flex flex-col items-center">
            {/* Direct Manipulation Digital Display */}
            <TimerDisplay
              remainingSeconds={timerEngine.remainingSeconds}
              timerState={timerEngine.timerState}
              activeUnit={timerEngine.activeUnit}
              onSelectUnit={timerEngine.setActiveUnit}
              onAdjustUnit={timerEngine.adjustUnit}
              onSetUnitDirect={timerEngine.setUnitDirect}
              showHoursAlways={settings.timer.showHoursAlways}
              onHaptic={triggerHaptic}
            />

            {/* Quick Durations Row (shown when idle) */}
            {timerEngine.timerState === 'idle' && (
              <QuickDurations
                durations={settings.interaction.quickDurations}
                currentDuration={timerEngine.totalDuration}
                onSelectDuration={(sec) => timerEngine.setDuration(sec)}
                onHaptic={triggerHaptic}
              />
            )}

            {/* Primary Controls */}
            <div className="mt-4 w-full">
              <TimerControls
                timerState={timerEngine.timerState}
                remainingSeconds={timerEngine.remainingSeconds}
                onStart={handleStartTimer}
                onPause={timerEngine.pause}
                onResume={timerEngine.resume}
                onReset={timerEngine.reset}
                onSavePreset={() => setIsSavePresetOpen(true)}
                onQuickAddSeconds={(sec) => timerEngine.addSeconds(sec)}
                onHaptic={triggerHaptic}
              />
            </div>
          </div>
        ) : (
          /* Stopwatch Mode */
          <StopwatchDisplay
            elapsedMs={stopwatchEngine.elapsedMs}
            isRunning={stopwatchEngine.isRunning}
            laps={stopwatchEngine.laps}
            onStart={stopwatchEngine.start}
            onPause={stopwatchEngine.pause}
            onResume={stopwatchEngine.resume}
            onReset={stopwatchEngine.reset}
            onLap={stopwatchEngine.recordLap}
            onHaptic={triggerHaptic}
          />
        )}
      </main>

      {/* Bottom Presets Shelf (Visible in Timer Mode) */}
      {mode === 'timer' && (
        <div className="z-10 w-full">
          <PresetShelf
            presets={presets}
            activeDuration={timerEngine.totalDuration}
            onSelectPreset={handleSelectPreset}
            onRenamePreset={handleRenamePreset}
            onEditPresetDuration={handleEditPresetDuration}
            onDuplicatePreset={handleDuplicatePreset}
            onDeletePreset={handleDeletePreset}
            onHaptic={triggerHaptic}
          />
        </div>
      )}

      {/* Ambient Sound / Mixer Modal */}
      <AmbientPanel
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
        audioSettings={settings.audio}
        onUpdateAudioSettings={(updated) =>
          setSettings((prev) => ({
            ...prev,
            audio: { ...prev.audio, ...updated },
          }))
        }
        isAmbientPlaying={isAmbientPlaying}
        setIsAmbientPlaying={setIsAmbientPlaying}
        onHaptic={triggerHaptic}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        presets={presets}
        onUpdatePresets={setPresets}
        onSelectTheme={(th) => {
          setSettings((prev) => ({
            ...prev,
            appearance: { ...prev.appearance, themeId: th.id },
          }));
        }}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetApp={handleResetApp}
        onHaptic={triggerHaptic}
      />

      {/* Save Preset Modal */}
      <SavePresetModal
        isOpen={isSavePresetOpen}
        durationSeconds={timerEngine.totalDuration}
        onClose={() => setIsSavePresetOpen(false)}
        onSave={handleSaveNewPreset}
        onHaptic={triggerHaptic}
      />

      {/* Non-intrusive first launch onboarding hint */}
      <FirstLaunchHint />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
