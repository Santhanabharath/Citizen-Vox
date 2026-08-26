import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import './MapStyles.css';

const MapSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="map-floating-panel map-search-container">
      <Search size={20} color="var(--text-muted)" />
      <input 
        type="text" 
        className="map-search-input"
        placeholder="Search civic issues, categories, or IDs..." 
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button 
          onClick={clearSearch}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <X size={18} color="var(--text-muted)" />
        </button>
      )}
    </div>
  );
};

export default MapSearch;
