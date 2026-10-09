import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable SearchBar Component
 */
export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search doctors, specializations, hospitals...",
  className = ''
}) {
  return (
    <div 
      className={`search-bar-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Search 
        size={19} 
        style={{
          position: 'absolute',
          left: '1rem',
          color: 'var(--color-text-light)',
          pointerEvents: 'none'
        }} 
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{
          paddingLeft: '2.75rem',
          paddingRight: value ? '2.5rem' : '1rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-xs)'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '0.85rem',
            color: 'var(--color-text-light)',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
