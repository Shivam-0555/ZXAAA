import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm"
      style={{
        borderColor: 'var(--color-zxaaa-border)',
        background: 'var(--color-zxaaa-card)',
      }}
    >
      {isDark ? (
        <Sun size={18} className="text-amber-400 animate-fadeIn" />
      ) : (
        <Moon size={18} className="text-slate-800 animate-fadeIn" />
      )}
    </button>
  );
}
