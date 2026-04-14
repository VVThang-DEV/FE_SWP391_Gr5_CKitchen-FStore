import { X } from 'lucide-react';
import './Badge.css';

export function Badge({ children, variant = 'primary', dot = false, className = '' }) {
  const classes = [
    'badge',
    `badge--${variant}`,
    dot && 'badge--dot',
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}

export function Tag({ children, onRemove, className = '' }) {
  return (
    <span className={`tag ${onRemove ? 'tag--removable' : ''} ${className}`}>
      {children}
      {onRemove && (
        <button type="button" className="tag__remove" onClick={onRemove} aria-label="Xóa">
          <X size={12} />
        </button>
      )}
    </span>
  );
}
