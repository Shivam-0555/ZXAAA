import { createContext, useContext, useState, useEffect } from 'react';

// 5 premium themes for ZXAAA Marketplace
export const THEMES = [
  { id: 'neon-violet',   label: 'Neon Violet',   emoji: '⚡', className: '' }, // Default
  { id: 'ocean-cyan',    label: 'Ocean Cyan',    emoji: '🌊', className: 'theme-ocean-cyan' },
  { id: 'emerald-green', label: 'Emerald Green', emoji: '🌿', className: 'theme-emerald-green' },
  { id: 'sunset-orange', label: 'Sunset Orange', emoji: '🌅', className: 'theme-sunset-orange' },
  { id: 'rose-pink',     label: 'Rose Pink',     emoji: '🌸', className: 'theme-rose-pink' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('zxaaa-theme') || 'neon-violet';
  });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('zxaaa-mode') === 'dark';
  });

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    // Remove all theme classes first
    THEMES.forEach(t => {
      if (t.className) document.body.classList.remove(t.className);
    });
    
    // Add active color theme class
    if (theme.className) {
      document.body.classList.add(theme.className);
    }

    // Toggle dark class for background and text white/black behavior
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    localStorage.setItem('zxaaa-theme', themeId);
    localStorage.setItem('zxaaa-mode', isDark ? 'dark' : 'light');
  }, [themeId, theme, isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes: THEMES, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

