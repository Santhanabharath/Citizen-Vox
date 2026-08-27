import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import IssueMarker from './IssueMarker';
import MapControls from './MapControls';
import UserLocationMarker from './UserLocationMarker';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';

// Fix Leaflet icon missing issues in certain environments, though we use custom icons mostly
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CivicMapView = ({ 
  issues, 
  userLocation, 
  onLocateMe,
  activeIssueId,
  onIssueClick 
}) => {
  const [mapCenter, setMapCenter] = useState(
    userLocation ? [userLocation.lat, userLocation.lng] : 
    (issues.length > 0 ? [issues[0].latitude, issues[0].longitude] : [20.5937, 78.9629])
  );
  const mapRef = useRef(null);

  useEffect(() => {
    // If we have user location, center map on it once
    if (userLocation && mapRef.current) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    } else if (issues.length > 0 && mapRef.current) {
      // Fallback: center on first issue
      setMapCenter([issues[0].latitude, issues[0].longitude]);
      mapRef.current.setView([issues[0].latitude, issues[0].longitude], 12, { animate: true });
    }
  }, [userLocation?.lat, userLocation?.lng, issues.length]); // more specific dependencies

  // Effect to fly to marker when clicked from list
  useEffect(() => {
    if (activeIssueId && mapRef.current) {
      const activeIssue = issues.find(i => i.id === activeIssueId);
      if (activeIssue) {
        mapRef.current.flyTo([activeIssue.latitude, activeIssue.longitude], 16, { duration: 1 });
        // NOTE: We don't auto-open popup from list click here to avoid complex ref handling, 
        // but centering the map is sufficient MVP UX.
      }
    }
  }, [activeIssueId, issues]);

  return (
    <div className="map-viewport">
      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false} // Disable default zoom, we use custom MapControls
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Render Issues with Geographic Clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
        >
          {issues.map(issue => (
            <IssueMarker 
              key={issue.id} 
              issue={issue}
              isActive={activeIssueId === issue.id}
              onClick={onIssueClick}
            />
          ))}
        </MarkerClusterGroup>

        {/* User Location */}
        <UserLocationMarker location={userLocation} />

        {/* Custom Controls */}
        <MapControls onLocateMe={onLocateMe} />
      </MapContainer>
    </div>
  );
};

export default CivicMapView;
