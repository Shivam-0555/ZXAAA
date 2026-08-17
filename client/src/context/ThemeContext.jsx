import { createContext, useContext, useState, useEffect } from 'react';

// 5 beautiful themes
export const THEMES = [
  {
    id: 'dark',
    label: 'Dark',
    emoji: '🌑',
    bg: '#08090d',
    card: '#111318',
    card2: '#181a22',
    border: '#1e2130',
    text: '#f1f5f9',
    muted: '#64748b',
    muted2: '#94a3b8',
    headerBg: 'rgba(8,9,13,0.92)',
    glassBg: 'rgba(17,19,24,0.85)',
    glassBorder: 'rgba(30,33,48,0.8)',
    swatch: '#08090d',
  },
  {
    id: 'midnight-blue',
    label: 'Ocean',
    emoji: '🌊',
    bg: '#020b18',
    card: '#071525',
    card2: '#0d1f33',
    border: '#112640',
    text: '#e2f0ff',
    muted: '#4a7fa5',
    muted2: '#7fb3d3',
    headerBg: 'rgba(2,11,24,0.92)',
    glassBg: 'rgba(7,21,37,0.85)',
    glassBorder: 'rgba(17,38,64,0.8)',
    swatch: '#020b18',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌲',
    bg: '#030d08',
    card: '#071510',
    card2: '#0d2018',
    border: '#122b1e',
    text: '#e2ffe6',
    muted: '#4a8060',
    muted2: '#7fb395',
    headerBg: 'rgba(3,13,8,0.92)',
    glassBg: 'rgba(7,21,16,0.85)',
    glassBorder: 'rgba(18,43,30,0.8)',
    swatch: '#030d08',
  },
  {
    id: 'crimson',
    label: 'Crimson',
    emoji: '🔴',
    bg: '#0d0205',
    card: '#1a0508',
    card2: '#220810',
    border: '#330a14',
    text: '#ffe2e8',
    muted: '#8a3a4e',
    muted2: '#b87080',
    headerBg: 'rgba(13,2,5,0.92)',
    glassBg: 'rgba(26,5,8,0.85)',
    glassBorder: 'rgba(51,10,20,0.8)',
    swatch: '#0d0205',
  },
  {
    id: 'light',
    label: 'Light',
    emoji: '☀️',
    bg: '#f8fafc',
    card: '#ffffff',
    card2: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    muted2: '#94a3b8',
    headerBg: 'rgba(248,250,252,0.95)',
    glassBg: 'rgba(255,255,255,0.90)',
    glassBorder: 'rgba(226,232,240,0.9)',
    swatch: '#f8fafc',
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('zxaaa-theme') || 'dark';
  });

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-zxaaa-bg',      theme.bg);
    root.style.setProperty('--color-zxaaa-card',    theme.card);
    root.style.setProperty('--color-zxaaa-card2',   theme.card2);
    root.style.setProperty('--color-zxaaa-border',  theme.border);
    root.style.setProperty('--color-zxaaa-text',    theme.text);
    root.style.setProperty('--color-zxaaa-muted',   theme.muted);
    root.style.setProperty('--color-zxaaa-muted2',  theme.muted2);
    root.style.setProperty('--color-zxaaa-header-bg', theme.headerBg);
    root.style.setProperty('--color-zxaaa-glass-bg', theme.glassBg);
    root.style.setProperty('--color-zxaaa-glass-border', theme.glassBorder);
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    // Add light class for special overrides
    if (theme.id === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    localStorage.setItem('zxaaa-theme', themeId);
  }, [themeId, theme]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
