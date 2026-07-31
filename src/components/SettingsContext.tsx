import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { soundManager } from '../utils/soundEffects';

export interface ThemePreset {
  id: string;
  name: string;
  color: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'violet', name: 'Electric Violet', color: '#7c3aed' },
  { id: 'cyan', name: 'Cyber Cyan', color: '#06b6d4' },
  { id: 'emerald', name: 'Emerald Green', color: '#10b981' },
  { id: 'rose', name: 'Neon Rose', color: '#f43f5e' },
  { id: 'amber', name: 'Amber Gold', color: '#f59e0b' },
  { id: 'blue', name: 'Royal Blue', color: '#3b82f6' },
  { id: 'lime', name: 'Toxic Lime', color: '#84cc16' },
  { id: 'coral', name: 'Sunset Coral', color: '#ff6b4a' },
  { id: 'fuchsia', name: 'Hyper Fuchsia', color: '#d946ef' },
  { id: 'crimson', name: 'Deep Crimson', color: '#dc2626' },
];

export interface CanvasTheme {
  id: string;
  name: string;
  bgDark: string;
  bgCard: string;
  accentSubtle: string;
}

export const CANVAS_THEMES: CanvasTheme[] = [
  { id: 'default', name: 'Deep Space (Default)', bgDark: '#020617', bgCard: 'rgba(255, 255, 255, 0.05)', accentSubtle: 'rgba(2, 6, 23, 0.6)' },
  { id: 'pitch-black', name: 'OLED Pure Black', bgDark: '#000000', bgCard: 'rgba(255, 255, 255, 0.04)', accentSubtle: 'rgba(10, 10, 10, 0.8)' },
  { id: 'midnight-purple', name: 'Nebula Purple', bgDark: '#080414', bgCard: 'rgba(255, 255, 255, 0.05)', accentSubtle: 'rgba(16, 8, 36, 0.7)' },
  { id: 'cyber-matrix', name: 'Matrix Emerald', bgDark: '#02120b', bgCard: 'rgba(255, 255, 255, 0.05)', accentSubtle: 'rgba(4, 28, 18, 0.7)' },
  { id: 'charcoal-slate', name: 'Charcoal Slate', bgDark: '#0f172a', bgCard: 'rgba(255, 255, 255, 0.06)', accentSubtle: 'rgba(30, 41, 59, 0.7)' },
];

export interface TabCloakPreset {
  id: string;
  name: string;
  title: string;
  icon: string;
}

export const TAB_CLOAK_PRESETS: TabCloakPreset[] = [
  { id: 'none', name: 'Default (Nexus Games)', title: 'Nexus Games', icon: '/favicon.svg' },
  { id: 'google-classroom', name: 'Google Classroom', title: 'Classes', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { id: 'google-drive', name: 'Google Drive', title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
  { id: 'google-docs', name: 'Google Docs', title: 'Untitled document - Google Docs', icon: 'https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_32dp.png' },
  { id: 'canvas', name: 'Canvas LMS', title: 'Dashboard - Canvas', icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
  { id: 'wikipedia', name: 'Wikipedia', title: 'Wikipedia, the free encyclopedia', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
  { id: 'custom', name: 'Custom Title & Icon', title: 'Google', icon: 'https://www.google.com/favicon.ico' },
];

export interface SettingsState {
  // Theme & Appearance
  themeColor: string;
  canvasTheme: string;
  enableMeshGradient: boolean;
  
  // Performance Settings
  enableAnimations: boolean;
  lowGpuMode: boolean;
  compactGrid: boolean;
  showFpsCounter: boolean;
  autoPlayGames: boolean;

  // Quality of Life (QoL)
  tabCloak: string;
  customTabTitle: string;
  customTabFavicon: string;
  panicKey: string; // e.g. 'Escape', 'Backquote', 'AltP'
  panicUrl: string;
  gameScale: number; // 90, 100, 110, 125
  uiSoundEffects: boolean;
  theaterMode: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  themeColor: '#7c3aed',
  canvasTheme: 'default',
  enableMeshGradient: true,

  enableAnimations: true,
  lowGpuMode: false,
  compactGrid: false,
  showFpsCounter: false,
  autoPlayGames: true,

  tabCloak: 'none',
  customTabTitle: 'Student Portal',
  customTabFavicon: 'https://students.aloysius.vic.edu.au/favicon.ico',
  panicKey: 'Backquote',
  panicUrl: 'https://students.aloysius.vic.edu.au/#?page=/home',
  gameScale: 100,
  uiSoundEffects: true,
  theaterMode: false,
};

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
  resetSettings: () => void;
  triggerPanic: () => void;
  isPanicTriggered: boolean;
  dismissPanic: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Utility to convert Hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => Math.min(255, Math.max(0, Math.round(val + (val * percent) / 100)));
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('nexus_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse saved settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isPanicTriggered, setIsPanicTriggered] = useState(false);

  // Apply Theme & Styling CSS Variables whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    const color = settings.themeColor || '#7c3aed';
    const rgb = hexToRgb(color) || { r: 124, g: 58, b: 237 };
    const hoverColor = adjustBrightness(color, -15);

    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-hover', hoverColor);
    root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);

    // Canvas Theme
    const cTheme = CANVAS_THEMES.find(t => t.id === settings.canvasTheme) || CANVAS_THEMES[0];
    root.style.setProperty('--bg-dark', cTheme.bgDark);
    root.style.setProperty('--bg-card', cTheme.bgCard);

    // Performance toggles on root element
    if (settings.lowGpuMode) {
      root.classList.add('low-gpu');
    } else {
      root.classList.remove('low-gpu');
    }

    if (!settings.enableAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // Save to localStorage
    try {
      localStorage.setItem('nexus_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Tab Cloaking Effect
  useEffect(() => {
    let title = 'Nexus Games';
    let iconUrl = '/favicon.svg';

    if (settings.tabCloak === 'custom') {
      title = settings.customTabTitle || 'Google Classroom';
      iconUrl = settings.customTabFavicon || 'https://ssl.gstatic.com/classroom/favicon.png';
    } else {
      const preset = TAB_CLOAK_PRESETS.find(p => p.id === settings.tabCloak);
      if (preset && preset.id !== 'none') {
        title = preset.title;
        iconUrl = preset.icon;
      }
    }

    document.title = title;

    // Dynamic Favicon Update
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = iconUrl;
  }, [settings.tabCloak, settings.customTabTitle, settings.customTabFavicon]);

  const triggerPanic = useCallback(() => {
    if (settings.panicUrl && settings.panicUrl.trim()) {
      window.location.href = settings.panicUrl;
    } else {
      setIsPanicTriggered(true);
    }
  }, [settings.panicUrl]);

  const dismissPanic = useCallback(() => {
    setIsPanicTriggered(false);
  }, []);

  // Panic Key Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if typing in input/textarea unless it's a specific modifier key combo
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = targetTag === 'input' || targetTag === 'textarea';

      if (settings.panicKey === 'Backquote' && e.code === 'Backquote') {
        if (!isTyping) {
          e.preventDefault();
          triggerPanic();
        }
      } else if (settings.panicKey === 'Escape' && e.code === 'Escape') {
        e.preventDefault();
        triggerPanic();
      } else if (settings.panicKey === 'AltP' && e.altKey && (e.code === 'KeyP' || e.key === 'p')) {
        e.preventDefault();
        triggerPanic();
      } else if (settings.panicKey === 'AltZ' && e.altKey && (e.code === 'KeyZ' || e.key === 'z')) {
        e.preventDefault();
        triggerPanic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.panicKey, triggerPanic]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
    if (typeof value === 'boolean') {
      soundManager.playToggle(settings.uiSoundEffects, value);
    } else if (key === 'themeColor') {
      soundManager.playColorSelect(settings.uiSoundEffects);
    } else {
      soundManager.playClick(settings.uiSoundEffects);
    }
  };

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...partial }));
    soundManager.playClick(settings.uiSoundEffects);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    soundManager.playClick(DEFAULT_SETTINGS.uiSoundEffects);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      triggerPanic,
      isPanicTriggered,
      dismissPanic
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
