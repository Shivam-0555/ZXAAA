import { useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { MapPin, X, Check, Search, Sliders } from 'lucide-react';

const LocationModal = ({ isOpen, onClose }) => {
  const {
    selectedLocation,
    selectCity,
    radiusKm,
    setRadiusKm,
    cities,
  } = useLocationContext();

  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const radiusOptions = [5, 10, 25, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="w-full max-w-md rounded-[24px] p-6 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        style={{
          background: 'var(--color-zxaaa-card)',
          border: '1px solid var(--color-zxaaa-border)',
          boxShadow: '0 -4px 60px rgba(0,0,0,0.5), 0 0 40px var(--color-zxaaa-primary-glow)',
        }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-[24px]"
          style={{ background: 'linear-gradient(90deg, var(--color-zxaaa-primary), #3b82f6)' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6 mt-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'var(--color-zxaaa-primary-bg)', border: '1px solid var(--color-zxaaa-primary-glow)' }}>
            <MapPin className="w-6 h-6 text-[var(--color-zxaaa-primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Set Your Location</h2>
            <p className="text-xs font-bold text-[var(--color-zxaaa-muted)] mt-0.5">
              Find deals near you
            </p>
          </div>
        </div>

        {/* Current Location Display */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
          style={{ background: 'var(--color-zxaaa-bg)', border: '1px solid var(--color-zxaaa-border)' }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <p className="text-sm font-bold text-white truncate">{selectedLocation.name}</p>
          <span className="ml-auto text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
            ACTIVE
          </span>
        </div>

        {/* Search City Input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-zxaaa-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city..."
            className="w-full bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[var(--color-zxaaa-muted)] focus:outline-none focus:border-[var(--color-zxaaa-primary-glow)] transition-colors font-bold"
          />
        </div>

        {/* City Grid */}
        <div className="mb-6">
          <label className="block text-[10px] font-black text-[var(--color-zxaaa-muted)] uppercase tracking-widest mb-3">
            Available Cities
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredCities.map((city) => {
              const isSelected = !selectedLocation.isGPS && selectedLocation.name === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => {
                    selectCity(city);
                    onClose();
                  }}
                  className={`p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'text-white shadow-[0_0_12px_var(--color-zxaaa-primary-glow)]'
                      : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:border-[var(--color-zxaaa-primary-glow)]'
                  }`}
                  style={isSelected ? {
                    background: 'var(--color-zxaaa-primary-bg)',
                    border: '1px solid var(--color-zxaaa-primary-glow)',
                  } : {
                    background: 'var(--color-zxaaa-bg)',
                    border: '1px solid var(--color-zxaaa-border)',
                  }}
                >
                  <span className="truncate">{city.name}</span>
                  {isSelected && <Check size={14} className="shrink-0 ml-1 text-[var(--color-zxaaa-text)]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Radius Selector */}
        <div className="pt-5 border-t border-[var(--color-zxaaa-border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest">
              <Sliders size={14} className="text-[var(--color-zxaaa-primary)]" />
              <span>Search Radius</span>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Within {radiusKm} km
            </span>
          </div>

          <div className="flex gap-2">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${
                  radiusKm === r
                    ? 'text-white shadow-[0_0_10px_var(--color-zxaaa-primary-glow)]'
                    : 'text-[var(--color-zxaaa-muted)] hover:text-white'
                }`}
                style={radiusKm === r ? {
                  background: 'var(--color-zxaaa-primary)',
                  border: '1px solid var(--color-zxaaa-primary-glow)',
                } : {
                  background: 'var(--color-zxaaa-bg)',
                  border: '1px solid var(--color-zxaaa-border)',
                }}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Done Action */}
        <button
          onClick={onClose}
          className="w-full mt-6 btn-primary py-3.5 text-sm font-black"
        >
          Apply & Find Deals
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
