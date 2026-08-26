import { useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

export const useUserLocation = () => {
  const { location, error, loading, requestLocation, setLocation } = useGeolocation();

  // On first load, we don't force prompt for location to avoid annoying the user.
  // We only prompt when they click "Locate Me" or "Nearby Issues" if location isn't there.
  
  return {
    userLocation: location,
    locationError: error,
    isLocating: loading,
    requestLocation,
    setUserLocation: setLocation
  };
};
