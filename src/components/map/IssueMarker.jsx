import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getSeverity } from '../../hooks/useMapIssues';
import IssuePreview from './IssuePreview';
import './MapStyles.css';

// Create custom icons based on severity
const createCustomIcon = (severity) => {
  const severityClass = `marker-${severity.toLowerCase()}`;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-pin ${severityClass}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const IssueMarker = ({ issue, isActive, onClick }) => {
  const severity = getSeverity(issue);
  const icon = createCustomIcon(severity);

  return (
    <Marker 
      position={[issue.latitude, issue.longitude]} 
      icon={icon}
      eventHandlers={{
        click: () => onClick(issue.id)
      }}
    >
      <Popup closeButton={false} autoPan={true}>
        <IssuePreview issue={issue} />
      </Popup>
    </Marker>
  );
};

export default IssueMarker;
