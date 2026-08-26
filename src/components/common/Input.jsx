import React from 'react';
import './Components.css';

export const Input = ({ 
  label, 
  id, 
  error,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input 
        id={id} 
        className="input-field" 
        {...props} 
      />
      {error && <span className="text-small" style={{ color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
};

export default Input;
