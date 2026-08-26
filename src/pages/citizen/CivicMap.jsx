import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus } from 'lucide-react';
import { issueService } from '../../services/issueService';
import { useMapIssues } from '../../hooks/useMapIssues';
import { useMapFilters } from '../../hooks/useMapFilters';
import { useUserLocation } from '../../hooks/useUserLocation';

import CivicMapView from '../../components/map/CivicMapView';
import MapSearch from '../../components/map/MapSearch';
import MapFilters from '../../components/map/MapFilters';
import MapSummary from '../../components/map/MapSummary';
import NearbyIssueList from '../../components/map/NearbyIssueList';
import '../../components/map/MapStyles.css';

const CivicMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Custom Hooks
  const { filters, updateFilter, clearFilters, isFilterPanelOpen, toggleFilterPanel, setIsFilterPanelOpen } = useMapFilters();
  const { userLocation, requestLocation, isLocating } = useUserLocation();
  const { filteredIssues, activeIssueId, setActiveIssueId } = useMapIssues(issues, filters, userLocation);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch initial issues
    issueService.getNearbyIssues().then(data => {
      setIssues(data.filter(i => i.latitude && i.longitude));
      setLoading(false);
    });
  }, []);

  const handleIssueClick = (id) => {
    setActiveIssueId(id);
  };

  const handleReportClick = () => {
    navigate('/citizen/report');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        Loading Civic Map...
      </div>
    );
  }

  return (
    <div className="civic-map-container">
      {/* Desktop Split View: List on left */}
      {!isMobile && (
        <NearbyIssueList 
          issues={filteredIssues}
          isMobile={false}
          activeIssueId={activeIssueId}
          onIssueHover={setActiveIssueId}
          onIssueClick={handleIssueClick}
        />
      )}

      {/* Main Map Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <CivicMapView 
          issues={filteredIssues}
          userLocation={userLocation}
          onLocateMe={requestLocation}
          activeIssueId={activeIssueId}
          onIssueClick={handleIssueClick}
        />

        {/* Floating UI */}
        <MapSearch onSearch={(val) => updateFilter('searchQuery', val)} />
        
        {/* Filter Trigger (Floating Button) */}
        <button 
          className="map-fab"
          style={{ position: 'absolute', top: '1rem', left: isMobile ? '1rem' : '440px', zIndex: 1000 }}
          onClick={toggleFilterPanel}
          title="Filters"
        >
          <Filter size={20} color={isFilterPanelOpen ? 'var(--accent)' : 'var(--text-primary)'} />
        </button>

        <MapFilters 
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
        />

        <MapSummary issues={filteredIssues} />

        {/* Floating Action Button: Report Issue */}
        <div style={{ position: 'absolute', bottom: isMobile ? '5rem' : '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <button className="map-fab primary" onClick={handleReportClick}>
            <Plus size={20} />
            Report Issue
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet: List on bottom */}
      {isMobile && (
        <NearbyIssueList 
          issues={filteredIssues}
          isMobile={true}
          activeIssueId={activeIssueId}
          onIssueHover={setActiveIssueId} // Not really used on mobile due to lack of hover
          onIssueClick={handleIssueClick}
        />
      )}
    </div>
  );
};

export default CivicMap;
