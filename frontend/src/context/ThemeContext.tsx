import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type ThemeId = 'cyber' | 'synthwave' | 'matrix' | 'sunset' | 'frost';
export type ColorMode = 'dark' | 'light';

export interface GraphColorConfig {
  bgBase: string;
  cursable: { bg: string; border: string; font: string; shadow: string };
  regular: { bg: string; border: string; font: string; shadow: string };
  aprobada: { bg: string; border: string; font: string; shadow: string };
  pendiente: { bg: string; border: string; font: string };
}

export interface ThemeOption {
  id: ThemeId;
  name: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  bgBase: string;
  bgSurface: string;
  graph: GraphColorConfig;
  lightGraph: GraphColorConfig;
}

export const THEMES: Record<ThemeId, ThemeOption> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Blueprint',
    badge: 'Cian Tech',
    primaryColor: '#22d3ee',
    accentColor: '#10b981',
    bgBase: '#070b13',
    bgSurface: '#0b101c',
    graph: {
      bgBase: '#070b13',
      cursable: { bg: '#042232', border: '#22d3ee', font: '#38bdf8', shadow: 'rgba(34,211,238,0.55)' },
      regular: { bg: '#241a02', border: '#f59e0b', font: '#fbbf24', shadow: 'rgba(245,158,11,0.4)' },
      aprobada: { bg: '#062817', border: '#10b981', font: '#34d399', shadow: 'rgba(16,185,129,0.35)' },
      pendiente: { bg: '#0d1527', border: '#1e293b', font: '#64748b' }
    },
    lightGraph: {
      bgBase: '#f8fafc',
      cursable: { bg: '#ecfeff', border: '#0891b2', font: '#155e75', shadow: 'rgba(8,145,178,0.2)' },
      regular: { bg: '#fffbeb', border: '#d97706', font: '#92400e', shadow: 'rgba(217,119,6,0.2)' },
      aprobada: { bg: '#ecfdf5', border: '#059669', font: '#065f46', shadow: 'rgba(5,150,105,0.2)' },
      pendiente: { bg: '#f1f5f9', border: '#cbd5e1', font: '#64748b' }
    }
  },
  synthwave: {
    id: 'synthwave',
    name: 'Neon Synthwave',
    badge: 'Rosa / Fucsia',
    primaryColor: '#f43f5e',
    accentColor: '#c084fc',
    bgBase: '#0f0817',
    bgSurface: '#160c23',
    graph: {
      bgBase: '#0f0817',
      cursable: { bg: '#2d081f', border: '#f43f5e', font: '#fb7185', shadow: 'rgba(244,63,94,0.55)' },
      regular: { bg: '#230a2e', border: '#c084fc', font: '#e879f9', shadow: 'rgba(192,132,252,0.45)' },
      aprobada: { bg: '#06261f', border: '#2dd4bf', font: '#5eead4', shadow: 'rgba(45,212,191,0.4)' },
      pendiente: { bg: '#170f26', border: '#2d1b46', font: '#7c6a96' }
    },
    lightGraph: {
      bgBase: '#f8fafc',
      cursable: { bg: '#fff1f2', border: '#e11d48', font: '#9f1239', shadow: 'rgba(225,29,72,0.2)' },
      regular: { bg: '#faf5ff', border: '#9333ea', font: '#6b21a8', shadow: 'rgba(147,51,234,0.2)' },
      aprobada: { bg: '#f0fdfa', border: '#0d9488', font: '#115e59', shadow: 'rgba(13,148,136,0.2)' },
      pendiente: { bg: '#f8f7fa', border: '#d8d2e3', font: '#726588' }
    }
  },
  matrix: {
    id: 'matrix',
    name: 'Emerald Matrix',
    badge: 'Verde Hacker',
    primaryColor: '#10b981',
    accentColor: '#22c55e',
    bgBase: '#05100a',
    bgSurface: '#091a10',
    graph: {
      bgBase: '#05100a',
      cursable: { bg: '#062d17', border: '#10b981', font: '#34d399', shadow: 'rgba(16,185,129,0.55)' },
      regular: { bg: '#1c2604', border: '#84cc16', font: '#a3e635', shadow: 'rgba(132,204,22,0.4)' },
      aprobada: { bg: '#053123', border: '#059669', font: '#6ee7b7', shadow: 'rgba(5,150,105,0.4)' },
      pendiente: { bg: '#0b1f13', border: '#173622', font: '#4d7c5b' }
    },
    lightGraph: {
      bgBase: '#f8fafc',
      cursable: { bg: '#ecfdf5', border: '#059669', font: '#065f46', shadow: 'rgba(5,150,105,0.2)' },
      regular: { bg: '#f7fee7', border: '#65a30d', font: '#3f6212', shadow: 'rgba(101,163,13,0.2)' },
      aprobada: { bg: '#f0fdfa', border: '#0d9488', font: '#115e59', shadow: 'rgba(13,148,136,0.2)' },
      pendiente: { bg: '#f0f5f2', border: '#cbd8d0', font: '#4d6e5a' }
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Amber Sunset',
    badge: 'Ámbar / Solar',
    primaryColor: '#f59e0b',
    accentColor: '#f97316',
    bgBase: '#140d07',
    bgSurface: '#1d130a',
    graph: {
      bgBase: '#140d07',
      cursable: { bg: '#331b04', border: '#f59e0b', font: '#fbbf24', shadow: 'rgba(245,158,11,0.55)' },
      regular: { bg: '#351208', border: '#f97316', font: '#fb923c', shadow: 'rgba(249,115,22,0.45)' },
      aprobada: { bg: '#0b2914', border: '#10b981', font: '#34d399', shadow: 'rgba(16,185,129,0.35)' },
      pendiente: { bg: '#1f160f', border: '#382517', font: '#7d6957' }
    },
    lightGraph: {
      bgBase: '#f8fafc',
      cursable: { bg: '#fffbeb', border: '#d97706', font: '#92400e', shadow: 'rgba(217,119,6,0.2)' },
      regular: { bg: '#fff7ed', border: '#ea580c', font: '#9a3412', shadow: 'rgba(234,88,12,0.2)' },
      aprobada: { bg: '#ecfdf5', border: '#059669', font: '#065f46', shadow: 'rgba(5,150,105,0.2)' },
      pendiente: { bg: '#f7f4f0', border: '#dfd7ce', font: '#756554' }
    }
  },
  frost: {
    id: 'frost',
    name: 'Nordic Frost',
    badge: 'Azul Glacial',
    primaryColor: '#38bdf8',
    accentColor: '#818cf8',
    bgBase: '#090e17',
    bgSurface: '#0d1524',
    graph: {
      bgBase: '#090e17',
      cursable: { bg: '#082538', border: '#38bdf8', font: '#7dd3fc', shadow: 'rgba(56,189,248,0.55)' },
      regular: { bg: '#151936', border: '#818cf8', font: '#a5b4fc', shadow: 'rgba(129,140,248,0.45)' },
      aprobada: { bg: '#072b22', border: '#34d399', font: '#6ee7b7', shadow: 'rgba(52,211,153,0.35)' },
      pendiente: { bg: '#101a2b', border: '#1e2e4a', font: '#627699' }
    },
    lightGraph: {
      bgBase: '#f8fafc',
      cursable: { bg: '#f0f9ff', border: '#0284c7', font: '#075985', shadow: 'rgba(2,132,199,0.2)' },
      regular: { bg: '#eef2ff', border: '#6366f1', font: '#3730a3', shadow: 'rgba(99,102,241,0.2)' },
      aprobada: { bg: '#f0fdfa', border: '#0d9488', font: '#115e59', shadow: 'rgba(13,148,136,0.2)' },
      pendiente: { bg: '#f0f4f9', border: '#cdd8e7', font: '#556885' }
    }
  }
};

const THEME_STORAGE_KEY = 'utn_tracker_theme';
const MODE_STORAGE_KEY = 'utn_tracker_colormode';

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  themeConfig: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved in THEMES) return saved as ThemeId;
    return 'cyber';
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
    document.documentElement.setAttribute('data-mode', newMode);
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', colorMode);
  }, [theme, colorMode]);

  const activeThemeConfig = useMemo(() => {
    const base = THEMES[theme] || THEMES.cyber;
    return {
      ...base,
      graph: colorMode === 'light' ? base.lightGraph : base.graph
    };
  }, [theme, colorMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorMode,
        setColorMode,
        toggleColorMode,
        themeConfig: activeThemeConfig
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};
