import React from 'react';

export default function PageHero({ badge, title, subtitle, icon, chips = [] }) {
  return (
    <div className="page-hero-banner">
      <div className="page-hero-inner">
        {badge && (
          <div className="page-hero-badge">
            {icon && <span className="page-hero-badge-icon">{icon}</span>}
            <span>{badge}</span>
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}

        {chips.length > 0 && (
          <div className="page-hero-chips-row">
            {chips.map((chip, idx) => (
              <div key={idx} className="page-hero-chip">
                <span className="chip-check">✓</span>
                <span>{chip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
