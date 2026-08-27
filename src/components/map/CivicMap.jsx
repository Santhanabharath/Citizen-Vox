import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { issueService } from '../../services/issueService';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useAuth } from '../../hooks/useAuth';

// Fix for default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom div icons based on category
const createCustomIcon = (category, status) => {
  const colors = {
    reported: '#eab308',
    under_review: '#f97316',
    community_verified: '#3b82f6',
    in_progress: '#8fea63',
    awaiting_final_verification: '#a855f7',
    resolved: '#10b981',
    closed: '#6b7280'
  };
  const color = colors[status] || colors.reported;
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: ${color === '#8fea63' ? '#1a1a1a' : 'white'};">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const UserLocationMarker = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14);
    }
  }, [location, map]);

  return location ? (
    <Marker position={[location.lat, location.lng]} icon={L.divIcon({
      className: 'user-location',
      html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })}>
      <Popup>You are here</Popup>
    </Marker>
  ) : null;
};

const CivicMap = ({ onEndorse }) => {
  const [issues, setIssues] = useState([]);
  const { userLocation } = useUserLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    const unsubscribe = issueService.subscribeToAllIssues((data) => {
      // Filter out issues without valid coordinates
      setIssues(data.filter(i => i.latitude && i.longitude && i.status !== 'closed'));
    });
    return () => unsubscribe();
  }, []);

  const handleEndorse = async (issueId) => {
    if (onEndorse) {
      onEndorse(issueId);
      return;
    }
    const success = await issueService.endorseIssue(issueId, user.uid);
    if (success) {
      alert("Successfully verified issue! +10 XP");
    } else {
      alert("Could not verify issue. You may have already verified it or you reported it.");
    }
  };

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]; // Default India

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <UserLocationMarker location={userLocation} />

        {issues.map(issue => (
          <Marker 
            key={issue.id} 
            position={[issue.latitude, issue.longitude]}
            icon={createCustomIcon(issue.category, issue.status)}
          >
            <Popup>
              <div style={{ minWidth: '200px', padding: '4px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600 }}>{issue.title}</h3>
                <span style={{ display: 'inline-block', padding: '4px 8px', background: '#f1f5f9', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  {issue.status.replace(/_/g, ' ')}
                </span>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--text-secondary)', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {issue.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {issue.endorsements?.length || 0} Verifications
                  </span>
                  {user && issue.reportedBy !== user.uid && !issue.endorsements?.includes(user.uid) && (
                    <button 
                      onClick={() => handleEndorse(issue.id)}
                      style={{ background: 'var(--primary-green)', color: 'var(--near-black)', border: 'none', padding: '6px 12px', borderRadius: '16px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(143,234,99,0.3)' }}
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CivicMap;
