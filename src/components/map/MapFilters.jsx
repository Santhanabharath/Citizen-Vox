import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './MapStyles.css';

const CATEGORIES = ['All', 'Pothole', 'Road Damage', 'Garbage', 'Water Leakage', 'Drainage', 'Streetlight', 'Fallen Tree', 'Public Safety', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Reopened'];
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const DISTANCES = [
  { label: 'All Distances', value: 'All' },
  { label: 'Within 500m', value: '0.5' },
  { label: 'Within 1km', value: '1' },
  { label: 'Within 2km', value: '2' },
  { label: 'Within 5km', value: '5' }
];
const DATES = ['All time', 'Today', 'This week', 'This month'];

const FilterSelect = ({ label, value, options, onChange, isObjectOptions = false }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
      {label}
    </label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-primary)'
      }}
    >
      {options.map((opt) => (
        <option key={isObjectOptions ? opt.value : opt} value={isObjectOptions ? opt.value : opt}>
          {isObjectOptions ? opt.label : opt}
        </option>
      ))}
    </select>
  </div>
);

const MapFilters = ({ isOpen, onClose, filters, updateFilter, clearFilters }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="map-floating-panel map-filter-panel open"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Filters</h3>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          <FilterSelect 
            label="CATEGORY" 
            value={filters.category} 
            options={CATEGORIES} 
            onChange={(val) => updateFilter('category', val)} 
          />

          <FilterSelect 
            label="STATUS" 
            value={filters.status} 
            options={STATUSES} 
            onChange={(val) => updateFilter('status', val)} 
          />

          <FilterSelect 
            label="SEVERITY" 
            value={filters.severity} 
            options={SEVERITIES} 
            onChange={(val) => updateFilter('severity', val)} 
          />

          <FilterSelect 
            label="DISTANCE" 
            value={filters.distance} 
            options={DISTANCES} 
            isObjectOptions={true}
            onChange={(val) => updateFilter('distance', val)} 
          />

          <FilterSelect 
            label="DATE" 
            value={filters.date} 
            options={DATES} 
            onChange={(val) => updateFilter('date', val)} 
          />

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button 
              onClick={clearFilters}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button 
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent)',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapFilters;
