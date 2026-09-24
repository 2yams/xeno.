import { Theme } from '../types/theme';

export const BUILTIN_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    bg: '#09090b',
    fg: '#fafafa',
    accent: '#e4e4e7',
    muted: '#71717a',
    panel: '#18181b',
    border: '#27272a',
    isDark: true,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#05070a',
    fg: '#e2e8f0',
    accent: '#94a3b8',
    muted: '#475569',
    panel: '#0f172a',
    border: '#1e293b',
    isDark: true,
  },
  {
    id: 'paper',
    name: 'Paper',
    bg: '#f6f4ee',
    fg: '#1c1917',
    accent: '#44403c',
    muted: '#a8a29e',
    panel: '#eae6dc',
    border: '#d6d3d1',
    isDark: false,
  },
  {
    id: 'mono',
    name: 'Mono',
    bg: '#000000',
    fg: '#ffffff',
    accent: '#ffffff',
    muted: '#666666',
    panel: '#111111',
    border: '#222222',
    isDark: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    bg: '#0d1117',
    fg: '#39d353',
    accent: '#56d364',
    muted: '#238636',
    panel: '#161b22',
    border: '#30363d',
    isDark: true,
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: '#0d1512',
    fg: '#e8edea',
    accent: '#689d79',
    muted: '#436351',
    panel: '#15221d',
    border: '#24372e',
    isDark: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: '#0a111c',
    fg: '#e0f2fe',
    accent: '#38bdf8',
    muted: '#477094',
    panel: '#101e33',
    border: '#1d3254',
    isDark: true,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: '#140e10',
    fg: '#fde8e9',
    accent: '#fb7185',
    muted: '#885863',
    panel: '#20161a',
    border: '#3a262e',
    isDark: true,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    bg: '#121019',
    fg: '#f3e8ff',
    accent: '#c084fc',
    muted: '#775e96',
    panel: '#1c1828',
    border: '#302946',
    isDark: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    bg: '#050508',
    fg: '#f8fafc',
    accent: '#06b6d4',
    muted: '#3b5569',
    panel: '#0c0e17',
    border: '#162235',
    isDark: true,
  },
  {
    id: 'glass',
    name: 'Glass',
    bg: '#111217',
    fg: '#f1f5f9',
    accent: '#cbd5e1',
    muted: '#64748b',
    panel: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.12)',
    isDark: true,
  },
  {
    id: 'solar',
    name: 'Solar',
    bg: '#fdf6e3',
    fg: '#073642',
    accent: '#b58900',
    muted: '#93a1a1',
    panel: '#eee8d5',
    border: '#d3368222',
    isDark: false,
  },
];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--fg', theme.fg);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--border', theme.border);
  
  // Also update browser theme-color meta tag
  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme.bg);
  }
}
