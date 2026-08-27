import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus, Maximize, Navigation } from 'lucide-react';
import './MapStyles.css';

const MapControls = ({ onLocateMe }) => {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    // Reset to a default view or fit bounds if provided. 
    // For now, reset to center and default zoom.
    const center = map.getCenter();
    map.setView(center, 12);
  };

  return (
    <div className="map-fab-bottom-right" style={{ bottom: '160px' }}> {/* Adjusted to sit above the report button & nav */}
      <button className="map-fab" onClick={onLocateMe} title="Locate Me" aria-label="Locate Me">
        <Navigation size={20} />
      </button>
      <button className="map-fab" onClick={handleReset} title="Reset View" aria-label="Reset View">
        <Maximize size={20} />
      </button>
      <button className="map-fab" onClick={handleZoomIn} title="Zoom In" aria-label="Zoom In">
        <Plus size={20} />
      </button>
      <button className="map-fab" onClick={handleZoomOut} title="Zoom Out" aria-label="Zoom Out">
        <Minus size={20} />
      </button>
    </div>
  );
};

export default MapControls;
