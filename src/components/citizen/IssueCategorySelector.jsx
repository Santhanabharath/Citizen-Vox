import React from 'react';
import { AlertTriangle, Droplets, Trash2, ShieldAlert, Zap, CloudRain, Construction, MapPin, MoreHorizontal } from 'lucide-react';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: <MapPin size={24} /> },
  { id: 'road_damage', label: 'Road Damage', icon: <Construction size={24} /> },
  { id: 'garbage', label: 'Garbage', icon: <Trash2 size={24} /> },
  { id: 'water_leak', label: 'Water Leak', icon: <Droplets size={24} /> },
  { id: 'drainage', label: 'Drainage', icon: <CloudRain size={24} /> },
  { id: 'streetlight', label: 'Streetlight', icon: <Zap size={24} /> },
  { id: 'safety', label: 'Public Safety', icon: <ShieldAlert size={24} /> },
  { id: 'hazard', label: 'Hazard', icon: <AlertTriangle size={24} /> },
  { id: 'other', label: 'Other', icon: <MoreHorizontal size={24} /> },
];

export const IssueCategorySelector = ({ selectedCategory, onSelect }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--surface)',
              color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-family)',
              fontSize: '0.8125rem',
              fontWeight: isSelected ? '600' : '500'
            }}
          >
            {cat.icon}
            <span style={{ textAlign: 'center' }}>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default IssueCategorySelector;
