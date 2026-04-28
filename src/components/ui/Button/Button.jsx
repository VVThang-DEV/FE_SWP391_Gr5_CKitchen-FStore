import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  iconOnly = false,
  block = false,
  ...props
}, ref) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    iconOnly && 'btn--icon',
    loading && 'btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn__spinner" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} />
      ) : null}
      {!iconOnly && children}
      {IconRight && !loading && <IconRight size={size === 'sm' ? 14 : 18} />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
