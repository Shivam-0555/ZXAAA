import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { Settings as SettingsIcon, Palette, MapPin, User, Shield, Check } from 'lucide-react';

export default function Settings() {
  const { themeId, setThemeId } = useTheme();
  const { user } = useAuth();
  const { selectedLocation } = useLocationContext();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <SettingsIcon className="text-purple-400" /> Account & App Settings
        </h1>
        <p className="text-xs md:text-sm text-[var(--color-zxaaa-muted)] mt-1">
          Customize your theme, location preferences, and account controls.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="rounded-[22px] p-6 space-y-4"
        style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="flex items-center gap-3">
          <Palette className="text-purple-400" size={20} />
          <div>
            <h3 className="text-base font-bold text-white">Color Theme</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)]">Select one of 5 premium dark-mode themes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {THEMES.map((t) => {
            const isActive = t.id === themeId;
            return (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left ${
                  isActive ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-white/[0.04]'
                }`}
                style={{
                  background: isActive ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--color-zxaaa-border)',
                }}>
                <span className="w-6 h-6 rounded-full border-2 shrink-0"
                  style={{ background: t.swatch, borderColor: isActive ? '#7c3aed' : 'rgba(255,255,255,0.2)' }} />
                <span className="text-white flex-1">{t.emoji} {t.label}</span>
                {isActive && <Check size={16} className="text-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Settings */}
      <div className="rounded-[22px] p-6 space-y-3"
        style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
        <div className="flex items-center gap-3">
          <MapPin className="text-pink-400" size={20} />
          <div>
            <h3 className="text-base font-bold text-white">Active Location</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)]">Marketplace feeds are filtered for this city</p>
          </div>
        </div>
        <div className="p-3 rounded-xl flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-zxaaa-border)' }}>
          <span className="text-sm font-extrabold text-white">{selectedLocation?.name || 'Vadodara, Gujarat'}</span>
          <span className="text-xs text-pink-400 font-bold">Selected</span>
        </div>
      </div>

      {/* Profile Summary */}
      {user && (
        <div className="rounded-[22px] p-6 space-y-3"
          style={{ background: 'var(--color-zxaaa-card)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="flex items-center gap-3">
            <User className="text-blue-400" size={20} />
            <div>
              <h3 className="text-base font-bold text-white">Account Details</h3>
              <p className="text-xs text-[var(--color-zxaaa-muted)]">Logged in as {user.name}</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl space-y-1.5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-zxaaa-border)' }}>
            <p className="text-xs text-white"><strong>Email:</strong> {user.email}</p>
            <p className="text-xs text-white"><strong>Role:</strong> <span className="uppercase text-purple-400 font-bold">{user.role || 'User'}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
