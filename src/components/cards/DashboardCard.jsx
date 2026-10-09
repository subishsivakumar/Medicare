import React from 'react';
import './dashboard-card.css';

export default function DashboardCard({
  title,
  value,
  change,
  changeType = 'positive', // 'positive' | 'neutral' | 'negative'
  icon: Icon,
  iconBg = 'var(--color-primary-light)',
  iconColor = 'var(--color-primary-dark)'
}) {
  return (
    <div className="dashboard-metric-card">
      <div className="metric-content">
        <span className="metric-title">{title}</span>
        <div className="metric-value">{value}</div>
        {change && (
          <div className={`metric-change ${changeType}`}>
            <span>{change}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div 
          className="metric-icon-box"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
