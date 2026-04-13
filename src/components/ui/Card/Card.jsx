import { TrendingUp, TrendingDown } from 'lucide-react';
import './Card.css';

export function Card({ children, variant, hoverable = false, compact = false, className = '', ...props }) {
  const classes = [
    'card',
    variant && `card--${variant}`,
    hoverable && 'card--hoverable',
    compact && 'card--compact',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, trendValue, color = 'primary', className = '' }) {
  return (
    <div className={`stat-card stat-card--${color} ${className}`}>
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <h3 className="stat-card__value">{value}</h3>
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
