import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable FormInput component with optional password visibility toggle
 */
export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const inputId = id || name;
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '0.85rem',
            color: 'var(--color-text-light)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`form-input ${error ? 'has-error' : ''}`}
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem',
            paddingRight: isPasswordField ? '2.5rem' : '1rem'
          }}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            title={showPassword ? "Hide password" : "Show password"}
            style={{
              position: 'absolute',
              right: '0.85rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              borderRadius: '4px'
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{helperText}</span>}
    </div>
  );
}
