import React, { useState } from 'react';

export default function Header({ currentView, setView, lang, setLang, t, cartCount, setCartOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'booking', label: t.navBooking },
    { id: 'field-report', label: t.navFieldReport },
    { id: 'pricing', label: t.navPricing },
    { id: 'contact', label: t.navContact },
  ];

  return (
    <header className="navbar">
      {/* Brand Logo */}
      <div 
        className="logo-container" 
        onClick={() => setView('home')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <img 
          src="/logo.jpeg" 
          alt="Report Safi Logo" 
          style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid var(--accent-gold)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} 
        />
        <div className="logo-text">
          Report <span style={{ color: 'var(--accent-gold)', WebkitTextFillColor: 'var(--accent-gold)' }}>Safi</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setView(item.id);
              setMobileMenuOpen(false);
            }}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Language Switch & Cart Trigger */}
      <div className="nav-controls">
        <div className="lang-toggle">
          <button
            onClick={() => setLang('sw')}
            className={`lang-btn ${lang === 'sw' ? 'active' : ''}`}
          >
            SW
          </button>
          <button
            onClick={() => setLang('en')}
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          >
            EN
          </button>
        </div>

        <button 
          onClick={() => setCartOpen(true)} 
          className="cart-badge"
          aria-label="View selected titles cart"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>{cartCount}</span>
        </button>

        {/* Mobile Menu Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="burger-menu"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
