import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle auto-zooming to bounds
const MapBounds = ({ hotspots }) => {
  const map = useMap();
  
  useEffect(() => {
    if (hotspots && hotspots.length > 0) {
      const bounds = hotspots.map(h => [h.lat, h.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [hotspots, map]);
  
  return null;
};

const CivicHeatmap = ({ hotspots }) => {
  
  const getHotspotColor = (score) => {
    if (score >= 75) return '#ef4444'; // Red for critical
    if (score >= 50) return '#f97316'; // Orange for hotspot
    if (score >= 30) return '#eab308'; // Yellow for emerging
    return '#3b82f6'; // Blue for normal
  };

  const getHotspotRadius = (score) => {
    // 300 to 800 meters based on score
    return 300 + (score * 5); 
  };

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', zIndex: 1, position: 'relative' }}>
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Use a lighter map for heatmap
        />
        
        {hotspots.map((hotspot) => (
          <Circle
            key={hotspot.id}
            center={[hotspot.lat, hotspot.lng]}
            pathOptions={{ 
              color: getHotspotColor(hotspot.hotspotScore), 
              fillColor: getHotspotColor(hotspot.hotspotScore), 
              fillOpacity: 0.4,
              weight: 1
            }}
            radius={getHotspotRadius(hotspot.hotspotScore)}
          >
            <Popup>
              <div style={{ padding: '0.5rem', minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>{hotspot.level}</h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Score: <strong style={{ color: getHotspotColor(hotspot.hotspotScore) }}>{hotspot.hotspotScore}</strong>
                </div>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Issues: <strong>{hotspot.issueCount}</strong>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  Top Category: <span style={{ textTransform: 'capitalize' }}>{hotspot.topCategory?.replace('_', ' ')}</span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        <MapBounds hotspots={hotspots} />
      </MapContainer>
      
      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1000, fontSize: '0.75rem', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div> Critical
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316' }}></div> Hotspot
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div> Emerging
        </div>
      </div>
    </div>
  );
};

export default CivicHeatmap;
