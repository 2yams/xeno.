import { AudioSettings } from './audio';
import { BackgroundImageSettings, Theme } from './theme';

export interface AppSettings {
  version: number;
  timer: {
    defaultDuration: number; // in seconds (e.g. 1500 for 25m)
    autoReset: boolean;
    autoStartPreset: boolean;
    showHoursAlways: boolean;
  };
  stopwatch: {
    precision: 'centiseconds' | 'seconds';
  };
  audio: AudioSettings;
  appearance: {
    themeId: string;
    customThemes: Theme[];
    backgroundImage: BackgroundImageSettings;
    animationIntensity: 'normal' | 'reduced';
  };
  interaction: {
    hapticFeedback: boolean;
    keepScreenAwake: boolean;
    notificationsEnabled: boolean;
    quickDurations: number[]; // e.g. [60, 300, 600, 900, 1500, 1800, 2700, 3600]
  };
}
