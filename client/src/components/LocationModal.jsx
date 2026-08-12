import { useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { MapPin, Navigation, X, Check, Search, Sliders } from 'lucide-react';

const LocationModal = ({ isOpen, onClose }) => {
  const {
    selectedLocation,
    selectCity,
    detectGPS,
    radiusKm,
    setRadiusKm,
    gpsLoading,
    gpsError,
    cities,
  } = useLocationContext();

  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const radiusOptions = [5, 10, 25, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(25, 25, 45, 0.98), rgba(15, 15, 30, 0.98))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 50px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Select Location & Distance</h2>
            <p className="text-xs text-[var(--color-zxaaa-muted)]">
              Choose your city to discover local marketplace deals nearby
            </p>
          </div>
        </div>

        {/* GPS Location Button */}
        <div className="mb-5">
          <button
            onClick={() => {
              detectGPS();
            }}
            disabled={gpsLoading}
            className="w-full p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-sm font-semibold flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Navigation
                className={`w-4 h-4 text-purple-400 ${
                  gpsLoading ? 'animate-spin' : 'group-hover:scale-110'
                } transition-transform`}
              />
              <span>
                {gpsLoading
                  ? 'Detecting GPS Coordinates...'
                  : 'Use My Current Location (GPS)'}
              </span>
            </div>
            {selectedLocation.isGPS && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/30">
                <Check size={12} /> Active
              </span>
            )}
          </button>
          {gpsError && (
            <p className="text-xs text-red-400 mt-2 px-1">{gpsError}</p>
          )}
        </div>

        {/* Search City Input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city or location..."
            className="w-full bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-zxaaa-purple)]"
          />
        </div>

        {/* Available Cities Grid */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Popular Cities
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected =
                !selectedLocation.isGPS && selectedLocation.name === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => {
                    selectCity(city);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[var(--color-zxaaa-purple)] border-[var(--color-zxaaa-purple)] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                      : 'bg-[var(--color-zxaaa-card)] border-[var(--color-zxaaa-border)] text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <span className="truncate">{city.name}</span>
                  {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Radius Slider / Selector */}
        <div className="pt-4 border-t border-[var(--color-zxaaa-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Sliders size={14} className="text-purple-400" />
              <span>Search Radius</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Within {radiusKm} km
            </span>
          </div>

          <div className="flex gap-2">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  radiusKm === r
                    ? 'bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] border-purple-500 text-white shadow-md'
                    : 'bg-[var(--color-zxaaa-card)] border-[var(--color-zxaaa-border)] text-gray-400 hover:text-white'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Done Action */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)] text-sm"
        >
          Apply Location Filter
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
