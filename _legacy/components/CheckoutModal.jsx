import React, { useState } from 'react';

export default function CheckoutModal({ isOpen, onClose, cart, onSubmitOrder, t }) {
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [university, setUniversity] = useState('');
  const [phone, setPhone] = useState('');
  const [txId, setTxId] = useState('');

  if (!isOpen) return null;

  const itemPrice = 20000;
  const totalPrice = cart.length * itemPrice;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !regNo || !university || !phone || !txId) {
      alert(t.lang === 'sw' ? 'Tafadhali jaza taarifa zote zilizohitajika!' : 'Please fill all required fields!');
      return;
    }

    // Build the WhatsApp message content
    const selectedTitlesText = cart.map((item, idx) => `${idx + 1}. ${item.title} (${item.year})`).join('\n');
    const msg = `Habari MyReport!\nNimefanya order ya Report:\n\n${selectedTitlesText}\n\nTaarifa Zangu:\n- Jina: ${name}\n- Chuo: ${university}\n- Reg No: ${regNo}\n- WhatsApp: ${phone}\n- Kithibitisho cha Malipo (TxId): ${txId}\n- Jumla ya Malipo: TZS ${totalPrice.toLocaleString()}/=\n\nAsante!`;
    
    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/255613328915?text=${encodedMsg}`;

    // Pass data back to App state
    onSubmitOrder({
      name,
      regNo,
      university,
      phone,
      txId,
      totalPrice,
      items: cart
    });

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="modal-wrapper" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t.checkoutHeader}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {t.checkoutSub}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t.inputName} *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. John Joseph"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.inputRegNo} *</label>
              <input
                type="text"
                className="form-input"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
                placeholder="e.g. IMC/BBA/2023/1234"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.inputUniversity} *</label>
              <input
                type="text"
                className="form-input"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
                placeholder="e.g. IFM, UDSM, TIA"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.inputPhone} *</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="e.g. +255613328915"
              />
            </div>

            {/* Mobile Money Payment Instructions box */}
            <div className="payment-instructions-box">
              <h5>{t.checkoutInstructions}</h5>
              <p>{t.paymentDetails}</p>
              <p className="payment-item">
                1. {t.payMethodLipa}: <span style={{ color: 'var(--accent-red)' }}>5409138</span>
              </p>
              <p style={{ fontSize: '0.8rem', marginLeft: '15px', color: 'var(--text-muted)' }}>
                Jina: REPORT SAFI SERVICES
              </p>
              <p className="payment-item">
                2. {t.payMethodDirect}: <span style={{ color: 'var(--accent-red)' }}>0613 328 915</span>
              </p>
              <p style={{ fontSize: '0.8rem', marginLeft: '15px', color: 'var(--text-muted)' }}>
                Tigo Pesa (Tuma Kawaida)
              </p>
              <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                Jumla ya Malipo: <span style={{ color: 'var(--success-green)' }}>TZS {totalPrice.toLocaleString()}/=</span>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">{t.proofPlaceholder} *</label>
              <input
                type="text"
                className="form-input"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                required
                placeholder="e.g. MPesa Ref ID / PP25XY789"
              />
            </div>

            <button type="submit" className="cart-action-btn" style={{ marginTop: '10px' }}>
              {t.checkoutSubmit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
