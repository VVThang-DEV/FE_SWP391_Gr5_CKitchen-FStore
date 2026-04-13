import { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          ref={ref}
          className={`input-field ${error ? 'input-field--error' : ''} ${Icon ? 'input-field--with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});
Input.displayName = 'Input';

export const Textarea = forwardRef(({
  label,
  error,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`textarea-field ${error ? 'input-field--error' : ''}`}
        {...props}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({
  label,
  error,
  required = false,
  options = [],
  placeholder = 'Chọn...',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <select ref={ref} className="select-field" {...props}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';
