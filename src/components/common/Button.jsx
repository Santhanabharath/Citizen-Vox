import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  style = {}
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-family)',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary-green)',
      color: 'var(--near-black)',
      borderRadius: 'var(--radius-full)',
      boxShadow: disabled ? 'none' : '0 4px 12px rgba(143, 234, 99, 0.2)',
    },
    secondary: {
      backgroundColor: 'var(--near-black)',
      color: 'var(--white)',
      borderRadius: 'var(--radius-full)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-full)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      borderRadius: 'var(--radius-md)',
    },
    danger: {
      backgroundColor: 'var(--critical)',
      color: 'var(--white)',
      borderRadius: 'var(--radius-full)',
    }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.875rem' },
    md: { padding: '10px 20px', fontSize: '1rem' },
    lg: { padding: '14px 28px', fontSize: '1.125rem' }
  };

  return (
    <button
      type={type}
      className={`btn ${className}`}
      style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }}
      onClick={onClick}
      disabled={disabled}
      onMouseOver={(e) => {
        if (!disabled && variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--bright-green)';
        if (!disabled && variant === 'outline') e.currentTarget.style.backgroundColor = 'var(--surface-soft)';
        if (!disabled && variant === 'ghost') e.currentTarget.style.backgroundColor = 'var(--surface-soft)';
      }}
      onMouseOut={(e) => {
        if (!disabled && variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-green)';
        if (!disabled && variant === 'outline') e.currentTarget.style.backgroundColor = 'transparent';
        if (!disabled && variant === 'ghost') e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
};

export default Button;
