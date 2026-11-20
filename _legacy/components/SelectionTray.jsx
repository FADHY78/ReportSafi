import React from 'react';

export default function SelectionTray({
  cart,
  cartOpen,
  setCartOpen,
  toggleCartSelection,
  onProceedCheckout,
  t
}) {
  const itemPrice = 20000;
  const totalPrice = cart.length * itemPrice;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className={`cart-overlay ${cartOpen ? 'open' : ''}`} 
        onClick={() => setCartOpen(false)}
      />

      {/* Cart Drawer Panel */}
      <div className={`cart-panel ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>{t.cartTitle}</h2>
          </div>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-items-container">
          {cart.length > 0 ? (
            cart.map((title) => (
              <div key={title.id} className="cart-item-card">
                <button 
                  className="cart-item-remove" 
                  onClick={() => toggleCartSelection(title)}
                  title="Ondoa mada hii"
                  aria-label="Remove title"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <h4 className="cart-item-title">{title.title}</h4>
                <div className="cart-item-meta">
                  <span>{title.year}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-red)' }}>
                    TZS {itemPrice.toLocaleString()}/=
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>
              <div style={{ margin: '0 auto 20px auto', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(18, 57, 95, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-navy)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <p>{t.cartEmpty}</p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>{t.cartTotal}:</span>
              <span className="cart-total-price">
                TZS {totalPrice.toLocaleString()}/=
              </span>
            </div>
            <button className="cart-action-btn" onClick={onProceedCheckout}>
              {t.cartButton}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
