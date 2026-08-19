import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const CITIES = [
  // Tier 1 Cities
  { name: 'Mumbai, Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi NCR', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Hyderabad, Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Chennai, Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata, West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Ahmedabad, Gujarat', latitude: 23.0225, longitude: 72.5714 },
  
  // Gujarat
  { name: 'Surat, Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { name: 'Vadodara, Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { name: 'Rajkot, Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { name: 'Bhavnagar, Gujarat', latitude: 21.7645, longitude: 72.1519 },
  { name: 'Jamnagar, Gujarat', latitude: 22.4707, longitude: 70.0577 },

  // Maharashtra (Other)
  { name: 'Nagpur, Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { name: 'Nashik, Maharashtra', latitude: 20.0110, longitude: 73.7903 },
  { name: 'Aurangabad, Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { name: 'Solapur, Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  
  // Uttar Pradesh
  { name: 'Lucknow, Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Kanpur, Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { name: 'Agra, Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { name: 'Varanasi, Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Meerut, Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
  { name: 'Prayagraj (Allahabad), UP', latitude: 25.4358, longitude: 81.8463 },
  { name: 'Ghaziabad, Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
  { name: 'Noida, Uttar Pradesh', latitude: 28.5355, longitude: 77.3910 },

  // Rajasthan
  { name: 'Jaipur, Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Jodhpur, Rajasthan', latitude: 26.2389, longitude: 73.0243 },
  { name: 'Kota, Rajasthan', latitude: 25.1815, longitude: 75.8323 },
  { name: 'Udaipur, Rajasthan', latitude: 24.5854, longitude: 73.7125 },
  { name: 'Bikaner, Rajasthan', latitude: 28.0229, longitude: 73.3119 },

  // Madhya Pradesh
  { name: 'Indore, Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Bhopal, Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { name: 'Jabalpur, Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
  { name: 'Gwalior, Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },

  // Bihar & Jharkhand
  { name: 'Patna, Bihar', latitude: 25.5941, longitude: 85.1376 },
  { name: 'Gaya, Bihar', latitude: 24.7914, longitude: 85.0002 },
  { name: 'Ranchi, Jharkhand', latitude: 23.3441, longitude: 85.3096 },
  { name: 'Jamshedpur, Jharkhand', latitude: 22.8046, longitude: 86.2029 },
  { name: 'Dhanbad, Jharkhand', latitude: 23.7957, longitude: 86.4304 },

  // Punjab, Haryana & Chandigarh
  { name: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
  { name: 'Ludhiana, Punjab', latitude: 30.9010, longitude: 75.8573 },
  { name: 'Amritsar, Punjab', latitude: 31.6340, longitude: 74.8723 },
  { name: 'Jalandhar, Punjab', latitude: 31.3260, longitude: 75.5762 },
  { name: 'Gurgaon, Haryana', latitude: 28.4595, longitude: 77.0266 },
  { name: 'Faridabad, Haryana', latitude: 28.4089, longitude: 77.3178 },

  // South India (Other)
  { name: 'Visakhapatnam, Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
  { name: 'Vijayawada, Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { name: 'Kochi, Kerala', latitude: 9.9312, longitude: 76.2673 },
  { name: 'Thiruvananthapuram, Kerala', latitude: 8.5241, longitude: 76.9366 },
  { name: 'Kozhikode, Kerala', latitude: 11.2588, longitude: 75.7804 },
  { name: 'Coimbatore, Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { name: 'Madurai, Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { name: 'Mysore, Karnataka', latitude: 12.2958, longitude: 76.6394 },
  { name: 'Mangalore, Karnataka', latitude: 12.9141, longitude: 74.8560 },

  // East & North East
  { name: 'Bhubaneswar, Odisha', latitude: 20.2961, longitude: 85.8245 },
  { name: 'Cuttack, Odisha', latitude: 20.4625, longitude: 85.8830 },
  { name: 'Guwahati, Assam', latitude: 26.1445, longitude: 91.7362 },
  { name: 'Siliguri, West Bengal', latitude: 26.7271, longitude: 88.3953 },
  { name: 'Durgapur, West Bengal', latitude: 23.5204, longitude: 87.3119 },
  { name: 'Asansol, West Bengal', latitude: 23.6739, longitude: 86.9524 },

  // Central & North
  { name: 'Raipur, Chhattisgarh', latitude: 21.2514, longitude: 81.6296 },
  { name: 'Bhilai, Chhattisgarh', latitude: 21.1938, longitude: 81.3509 },
  { name: 'Dehradun, Uttarakhand', latitude: 30.3165, longitude: 78.0322 },
  { name: 'Jammu, J&K', latitude: 32.7266, longitude: 74.8570 },
  { name: 'Srinagar, J&K', latitude: 34.0837, longitude: 74.7973 }
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


  useEffect(() => {
    localStorage.setItem('userLocation', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem('userRadius', radiusKm.toString());
  }, [radiusKm]);

  const selectCity = (cityObj) => {
    setSelectedLocation(cityObj);
  };


  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        selectCity,
        radiusKm,
        setRadiusKm,
        cities: CITIES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
