import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import './MapStyles.css';

const userLocationIcon = L.divIcon({
  className: 'user-location-wrapper',
  html: `
    <div class="user-location-marker">
      <div class="user-location-pulse"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const UserLocationMarker = ({ location }) => {
  if (!location) return null;

  return (
    <Marker 
      position={[location.lat, location.lng]} 
      icon={userLocationIcon} 
      zIndexOffset={1000} // Ensure it stays on top of other markers
    />
  );
};

export default UserLocationMarker;
