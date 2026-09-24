export type CompletionSoundType =
  | 'soft-bell'
  | 'digital-beep'
  | 'gentle-chime'
  | 'soft-click'
  | 'minimal-tone'
  | 'silent';

export type WhiteNoiseType =
  | 'white'
  | 'pink'
  | 'brown'
  | 'rain'
  | 'fan'
  | 'fireplace'
  | 'ocean'
  | 'cafe'
  | 'forest';

export interface WhiteNoisePreset {
  id: string;
  name: string;
  type: WhiteNoiseType;
  volume: number; // 0 to 1
}

export interface AudioSettings {
  completionSound: CompletionSoundType;
  completionVolume: number; // 0 to 1
  actionSound: boolean;
  actionWhiteNoiseReaction: boolean;
  actionMusic: boolean;
  musicUrl: string;
  musicVolume: number; // 0 to 1
  whiteNoiseType: WhiteNoiseType;
  whiteNoiseVolume: number; // 0 to 1
  whiteNoiseAutoStart: boolean;
  whiteNoiseAutoStop: boolean;
  whiteNoiseFadeOut: boolean;
  fadeOutDuration: number; // in seconds, e.g. 15 or 30
}
