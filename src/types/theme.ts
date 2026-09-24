export interface Theme {
  id: string;
  name: string;
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  panel: string;
  border: string;
  isDark: boolean;
  isCustom?: boolean;
}

export interface BackgroundImageSettings {
  url: string;
  dataUrl?: string;
  opacity: number; // 0 to 1
  blur: number; // in px, e.g. 0 to 20
  brightness: number; // 0.2 to 1.5
  overlay: number; // dark overlay opacity 0 to 1
  fit: 'cover' | 'contain' | 'center';
}
