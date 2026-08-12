import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const CITIES = [
  { name: 'Vadodara, Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { name: 'Ahmedabad, Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Surat, Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { name: 'Mumbai, Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi NCR', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567 },
];

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('userLocation');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return CITIES[0]; // Default Vadodara
  });

  const [radiusKm, setRadiusKm] = useState(() => {
    return Number(localStorage.getItem('userRadius')) || 50;
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    localStorage.setItem('userLocation', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem('userRadius', radiusKm.toString());
  }, [radiusKm]);

  const selectCity = (cityObj) => {
    setSelectedLocation(cityObj);
    setGpsError('');
  };

  const detectGPS = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = {
          name: 'Current Location (GPS)',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          isGPS: true,
        };
        setSelectedLocation(newLoc);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || 'Unable to retrieve location');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        selectCity,
        detectGPS,
        radiusKm,
        setRadiusKm,
        gpsLoading,
        gpsError,
        cities: CITIES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
