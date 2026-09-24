import { TimerPreset, TimerStateSnapshot } from '../types/timer';
import { AppSettings } from '../types/settings';
import { BUILTIN_THEMES } from '../themes/themes';

const STORAGE_KEYS = {
  SETTINGS: 'xeno_settings_v1',
  PRESETS: 'xeno_presets_v1',
  TIMER_SNAPSHOT: 'xeno_timer_snapshot_v1',
  STOPWATCH_SNAPSHOT: 'xeno_stopwatch_snapshot_v1',
  FIRST_LAUNCH_HINT: 'xeno_hint_shown_v1',
};

export const DEFAULT_PRESETS: TimerPreset[] = [
  {
    id: 'preset-study',
    name: 'Study',
    duration: 1500, // 25:00
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-workout',
    name: 'Workout',
    duration: 2700, // 45:00
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-stretch',
    name: 'Stretch',
    duration: 600, // 10:00
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-break',
    name: 'Quick Break',
    duration: 300, // 05:00
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-deepwork',
    name: 'Deep Work',
    duration: 3000, // 50:00
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  timer: {
    defaultDuration: 1500,
    autoReset: false,
    autoStartPreset: false,
    showHoursAlways: false,
  },
  stopwatch: {
    precision: 'centiseconds',
  },
  audio: {
    completionSound: 'soft-bell',
    completionVolume: 0.8,
    actionSound: true,
    actionWhiteNoiseReaction: false,
    actionMusic: false,
    musicUrl: '',
    musicVolume: 0.7,
    whiteNoiseType: 'brown',
    whiteNoiseVolume: 0.35,
    whiteNoiseAutoStart: false,
    whiteNoiseAutoStop: true,
    whiteNoiseFadeOut: true,
    fadeOutDuration: 15,
  },
  appearance: {
    themeId: 'default',
    customThemes: [],
    backgroundImage: {
      url: '',
      opacity: 0.35,
      blur: 4,
      brightness: 0.7,
      overlay: 0.6,
      fit: 'cover',
    },
    animationIntensity: 'normal',
  },
  interaction: {
    hapticFeedback: true,
    keepScreenAwake: true,
    notificationsEnabled: false,
    quickDurations: [60, 300, 600, 900, 1500, 1800, 2700, 3600],
  },
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      timer: { ...DEFAULT_SETTINGS.timer, ...(parsed.timer || {}) },
      stopwatch: { ...DEFAULT_SETTINGS.stopwatch, ...(parsed.stopwatch || {}) },
      audio: { ...DEFAULT_SETTINGS.audio, ...(parsed.audio || {}) },
      appearance: {
        ...DEFAULT_SETTINGS.appearance,
        ...(parsed.appearance || {}),
        backgroundImage: {
          ...DEFAULT_SETTINGS.appearance.backgroundImage,
          ...(parsed.appearance?.backgroundImage || {}),
        },
      },
      interaction: { ...DEFAULT_SETTINGS.interaction, ...(parsed.interaction || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('[xeno.] Failed to persist settings:', err);
  }
}

export function loadPresets(): TimerPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!raw) {
      savePresets(DEFAULT_PRESETS);
      return DEFAULT_PRESETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

export function savePresets(presets: TimerPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  } catch (err) {
    console.warn('[xeno.] Failed to persist presets:', err);
  }
}

export function saveTimerSnapshot(snapshot: TimerStateSnapshot | null): void {
  try {
    if (!snapshot) {
      localStorage.removeItem(STORAGE_KEYS.TIMER_SNAPSHOT);
    } else {
      localStorage.setItem(STORAGE_KEYS.TIMER_SNAPSHOT, JSON.stringify(snapshot));
    }
  } catch {}
}

export function loadTimerSnapshot(): TimerStateSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_SNAPSHOT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isFirstLaunchHintShown(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH_HINT) === 'true';
  } catch {
    return false;
  }
}

export function markFirstLaunchHintShown(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH_HINT, 'true');
  } catch {}
}

export function exportBackup(presets: TimerPreset[], settings: AppSettings): string {
  const exportData = {
    app: 'xeno.',
    version: 1,
    exportedAt: new Date().toISOString(),
    presets,
    settings,
  };
  return JSON.stringify(exportData, null, 2);
}

export function importBackup(
  jsonString: string
): { success: boolean; presets?: TimerPreset[]; settings?: AppSettings; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.app !== 'xeno.' && !parsed.presets && !parsed.settings) {
      return { success: false, error: 'Invalid xeno. backup file.' };
    }

    let validPresets: TimerPreset[] | undefined;
    if (Array.isArray(parsed.presets)) {
      validPresets = parsed.presets.filter(
        (p: any) => typeof p.name === 'string' && typeof p.duration === 'number' && p.duration > 0
      );
    }

    let validSettings: AppSettings | undefined;
    if (parsed.settings && typeof parsed.settings === 'object') {
      validSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
      };
    }

    return {
      success: true,
      presets: validPresets,
      settings: validSettings,
    };
  } catch (err) {
    return { success: false, error: 'Malformed JSON syntax.' };
  }
}

export function resetApplicationData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRESETS);
    localStorage.removeItem(STORAGE_KEYS.TIMER_SNAPSHOT);
    localStorage.removeItem(STORAGE_KEYS.STOPWATCH_SNAPSHOT);
    localStorage.removeItem(STORAGE_KEYS.FIRST_LAUNCH_HINT);
  } catch {}
}
