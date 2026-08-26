import { useState } from 'react';

const initialFilters = {
  searchQuery: '',
  category: 'All',
  status: 'All',
  severity: 'All',
  distance: 'All',
  date: 'All time'
};

export const useMapFilters = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(prev => !prev);
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    toggleFilterPanel
  };
};
