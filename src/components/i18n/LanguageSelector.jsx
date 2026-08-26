import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { langCode, setLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-soft)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
      <Globe size={14} color="var(--text-secondary)" />
      <select 
        value={langCode}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ 
          border: 'none', 
          background: 'transparent', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: 'var(--text-primary)',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {Object.values(SUPPORTED_LANGUAGES).map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
