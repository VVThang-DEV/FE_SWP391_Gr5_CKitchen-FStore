import { forwardRef, useId } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  required = false,
  className = '',
  id: providedId,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = providedId || autoId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          ref={ref}
          id={inputId}
          className={`input-field ${error ? 'input-field--error' : ''} ${Icon ? 'input-field--with-icon' : ''}`}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId || hintId || undefined}
          {...props}
        />
      </div>
      {error && <span className="input-error" id={errorId} role="alert">{error}</span>}
      {hint && !error && <span className="input-hint" id={hintId}>{hint}</span>}
    </div>
  );
});
Input.displayName = 'Input';

export const Textarea = forwardRef(({
  label,
  error,
  required = false,
  className = '',
  id: providedId,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = providedId || autoId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={`textarea-field ${error ? 'input-field--error' : ''}`}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId || undefined}
        {...props}
      />
      {error && <span className="input-error" id={errorId} role="alert">{error}</span>}
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
  id: providedId,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = providedId || autoId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className="select-field"
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId || undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error" id={errorId} role="alert">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';
