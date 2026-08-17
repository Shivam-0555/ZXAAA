import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

export default function ThemeSwitcher() {
  const { themeId, setThemeId, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Change Theme"
        className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
        style={{
          border: '1px solid var(--color-zxaaa-border)',
          background: open ? 'rgba(124,58,237,0.15)' : 'transparent',
          color: open ? '#a855f7' : 'var(--color-zxaaa-muted)',
        }}
      >
        <Palette size={16} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-10 z-50 rounded-2xl p-3 shadow-2xl animate-fadeIn"
          style={{
            background: 'var(--color-zxaaa-card)',
            border: '1px solid var(--color-zxaaa-border)',
            minWidth: '180px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 px-1"
            style={{ color: 'var(--color-zxaaa-muted)' }}>
            Choose Theme
          </p>
          <div className="flex flex-col gap-1">
            {THEMES.map((t) => {
              const isActive = t.id === themeId;
              return (
                <button
                  key={t.id}
                  onClick={() => { setThemeId(t.id); setOpen(false); }}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all text-left"
                  style={{
                    background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                    color: isActive ? '#c4b5fd' : 'var(--color-zxaaa-muted2)',
                  }}
                >
                  {/* Color Swatch */}
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border-2"
                    style={{
                      background: t.swatch,
                      borderColor: isActive ? '#7c3aed' : t.border,
                      boxShadow: isActive ? '0 0 8px rgba(124,58,237,0.5)' : 'none',
                    }}
                  />
                  <span>{t.emoji} {t.label}</span>
                  {isActive && <Check size={13} className="ml-auto text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
