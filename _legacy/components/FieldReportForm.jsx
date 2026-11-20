import React, { useState } from 'react';
import PageHero from './PageHero';

export default function FieldReportForm({ onSubmitCustomOrder, lang = 'sw', t }) {
  // Service Type: 'field' (20,000), 'proposal' (50,000), 'full-research' (50,000)
  const [reportType, setReportType] = useState('field');

  // Common Student States
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [university, setUniversity] = useState('');
  const [phone, setPhone] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [txId, setTxId] = useState('');
  const [copiedPayNumber, setCopiedPayNumber] = useState(false);

  // Field Report Specific States
  const [orgName, setOrgName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [duration, setDuration] = useState('');
  const [logbookFile, setLogbookFile] = useState(null);

  // Research Specific States
  const [researchTopic, setResearchTopic] = useState('');
  const [researchSummary, setResearchSummary] = useState('');

  const getPriceForType = () => {
    if (reportType === 'field') return 20000;
    if (reportType === 'proposal') return 50000;
    return 50000;
  };

  const getTypeName = () => {
    if (reportType === 'field') return 'Field Report';
    if (reportType === 'proposal') return lang === 'sw' ? 'Research Proposal (Sura 1-3)' : 'Research Proposal (Chapters 1-3)';
    return lang === 'sw' ? 'Full Research Report (Sura 1-5)' : 'Full Research Report (Chapters 1-5)';
  };

  const handleCopyLipa = () => {
    navigator.clipboard.writeText('5409138');
    setCopiedPayNumber(true);
    setTimeout(() => setCopiedPayNumber(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogbookFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPrice = getPriceForType();

    if (!name || !regNo || !university || !phone || !academicYear || !txId) {
      alert(lang === 'sw' ? 'Tafadhali jaza taarifa zote zilizohitajika!' : 'Please fill all required fields!');
      return;
    }

    if (reportType === 'field' && (!orgName || !deptName || !duration)) {
      alert(lang === 'sw' ? 'Tafadhali jaza taarifa za sehemu ya field!' : 'Please fill internship details!');
      return;
    }

    if ((reportType === 'proposal' || reportType === 'full-research') && !researchTopic) {
      alert(lang === 'sw' ? 'Tafadhali jaza mada ya utafiti!' : 'Please fill research topic!');
      return;
    }

    // Build the WhatsApp message content
    let detailsText = '';
    if (reportType === 'field') {
      detailsText = `Taarifa za Field:\n- Sehemu ya Field: ${orgName}\n- Idara/Kitengo: ${deptName}\n- Muda wa Field: ${duration}\n- Logbook File: ${logbookFile ? logbookFile.name : 'Haijawekwa'}`;
    } else {
      detailsText = `Taarifa za Utafiti:\n- Mada (Topic): ${researchTopic}\n- Muhtasari: ${researchSummary || 'N/A'}`;
    }

    const msg = `Habari Report Safi!\nNaomba kuagiza Custom ${getTypeName()}:\n\n${detailsText}\n\nTaarifa Zangu:\n- Jina: ${name}\n- Chuo: ${university}\n- Reg No: ${regNo}\n- WhatsApp: ${phone}\n- Mwaka: ${academicYear}\n- Kithibitisho cha Malipo (TxId): ${txId}\n- Jumla ya Malipo: TZS ${totalPrice.toLocaleString()}/=\n\nAsante!`;
    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/255613328915?text=${encodedMsg}`;

    onSubmitCustomOrder({
      name,
      regNo,
      university,
      phone,
      txId,
      totalPrice,
      customDetails: {
        reportType: getTypeName(),
        orgName: reportType === 'field' ? orgName : null,
        deptName: reportType === 'field' ? deptName : null,
        duration: reportType === 'field' ? duration : null,
        logbookFileName: logbookFile ? logbookFile.name : null,
        researchTopic: reportType !== 'field' ? researchTopic : null,
        academicYear
      }
    });

    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setName('');
    setRegNo('');
    setUniversity('');
    setPhone('');
    setOrgName('');
    setDeptName('');
    setDuration('');
    setAcademicYear('');
    setTxId('');
    setLogbookFile(null);
    setResearchTopic('');
    setResearchSummary('');
  };

  return (
    <div>
      {/* PROFESSIONAL PAGE HERO BANNER */}
      <PageHero
        badge={lang === 'sw' ? 'FOMU RASMI YA KUAGIZA RIPOTI' : 'OFFICIAL REPORT ORDER FORM'}
        title={t.fieldFormTitle}
        subtitle={t.fieldFormSubtitle}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15l2 2 4-4"></path>
          </svg>
        }
        chips={[
          lang === 'sw' ? 'Ikiwa na Logbook Drag & Drop' : 'Logbook Upload Included',
          lang === 'sw' ? 'Gharama Nafuu (Kuanzia TZS 20,000/=)' : 'Affordable Pricing (From TZS 20k)',
          lang === 'sw' ? 'Uwasilishaji wa Masaa 24-48' : '24-48 Hour Turnaround'
        ]}
      />

      <div className="custom-form-container" style={{ marginTop: '30px' }}>
        {/* REPORT TYPE SELECTOR SWITCHER WITH VECTOR SVG BADGES */}
        <div className="report-type-selector-box">
          <label className="form-label" style={{ textAlign: 'center', marginBottom: '18px', fontSize: '1.05rem' }}>
            {t.selectReportType}
          </label>
          
          <div className="report-type-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {/* Card 1: Field Report */}
            <button
              type="button"
              onClick={() => setReportType('field')}
              className={`report-type-card ${reportType === 'field' ? 'selected' : ''}`}
            >
              <div className="type-card-badge">POPULAR</div>
              <div className="type-card-icon-badge field">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h4>Field Report</h4>
              <span className="type-card-price">TZS 20,000/=</span>
              <span className="type-card-sub">{lang === 'sw' ? 'Ikiwa na Logbook Upload' : 'Logbook Upload Included'}</span>
            </button>

            {/* Card 2: Full Research Report */}
            <button
              type="button"
              onClick={() => setReportType('full-research')}
              className={`report-type-card ${reportType === 'full-research' ? 'selected' : ''}`}
            >
              <div className="type-card-icon-badge full">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <h4>Full Research Report</h4>
              <span className="type-card-price">TZS 50,000/=</span>
              <span className="type-card-sub">{lang === 'sw' ? 'Sura ya 1 hadi ya 5 Kamili' : 'Chapters 1 to 5 Full Thesis'}</span>
            </button>
          </div>
        </div>

        {/* Visual Step Timeline Header */}
        <div className="form-progress-stepper" style={{ marginTop: '30px' }}>
          <div className="form-progress-step active">
            <span className="progress-step-circle">1</span>
            <span className="progress-step-text">{lang === 'sw' ? 'Taarifa Zako' : 'Student Details'}</span>
          </div>
          <div className="form-progress-divider"></div>
          <div className="form-progress-step active">
            <span className="progress-step-circle">2</span>
            <span className="progress-step-text">
              {reportType === 'field'
                ? (lang === 'sw' ? 'Taarifa za Field & Logbook' : 'Field & Logbook Details')
                : (lang === 'sw' ? 'Taarifa za Utafiti' : 'Research Details')}
            </span>
          </div>
          <div className="form-progress-divider"></div>
          <div className="form-progress-step active">
            <span className="progress-step-circle">3</span>
            <span className="progress-step-text">{lang === 'sw' ? 'Malipo & Order' : 'Payment & Checkout'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: Student Information */}
          <div className="form-step-section">
            <div className="form-step-title">
              <span className="step-badge-num">1</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{lang === 'sw' ? 'Taarifa za Mwanafunzi (Student Information)' : 'Student Information'}</h4>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'sw' ? 'Jaza majina na usajili wako wa chuo' : 'Fill in your full name and university registration number'}</span>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">{t.inputName} *</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'sw' ? 'Mf. Kelvin Massawe' : 'e.g. Kelvin Massawe'}
                    className="form-input-styled"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.inputRegNo} *</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="13" y2="12"></line></svg>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder={lang === 'sw' ? 'Mf. IMC/BBA/2023/0482' : 'e.g. IMC/BBA/2023/0482'}
                    className="form-input-styled"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">{t.inputUniversity} *</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder={lang === 'sw' ? 'Mf. IFM, UDSM, DIT, CBE, TIA...' : 'e.g. IFM, UDSM, DIT, CBE, TIA...'}
                    className="form-input-styled"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.inputPhone} *</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0613 328 915"
                    className="form-input-styled"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'sw' ? 'Mwaka wa Masomo (Academic Year) *' : 'Academic Year *'}</label>
              <div className="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <select
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="form-input-styled"
                  style={{ appearance: 'none' }}
                >
                  <option value="">{lang === 'sw' ? 'Chagua Mwaka wa Masomo...' : 'Select Academic Year...'}</option>
                  <option value="1st Year">{lang === 'sw' ? 'Mwaka wa 1 (1st Year)' : '1st Year'}</option>
                  <option value="2nd Year">{lang === 'sw' ? 'Mwaka wa 2 (2nd Year)' : '2nd Year'}</option>
                  <option value="3rd Year">{lang === 'sw' ? 'Mwaka wa 3 (3rd Year)' : '3rd Year'}</option>
                  <option value="4th Year">{lang === 'sw' ? 'Mwaka wa 4 (4th Year)' : '4th Year'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Dynamic Form Fields based on Selected Report Type */}
          {reportType === 'field' ? (
            <div className="form-step-section">
              <div className="form-step-title">
                <span className="step-badge-num">2</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{lang === 'sw' ? 'Taarifa za Field & Logbook Upload' : 'Field Training & Logbook Upload'}</h4>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'sw' ? 'Weka maelezo ya sehemu yako ya practical training' : 'Enter your practical training organization details'}</span>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{t.organizationName} *</label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={lang === 'sw' ? 'Mf. TRA, NMB Bank, PCCB, TAA...' : 'e.g. TRA, NMB Bank, PCCB, TAA...'}
                      className="form-input-styled"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.departmentName} *</label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                    <input
                      type="text"
                      required
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder={lang === 'sw' ? 'Mf. Idara ya Procurement / IT / Accounting' : 'e.g. Procurement / IT / Accounting Dept'}
                      className="form-input-styled"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.fieldDuration} *</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={lang === 'sw' ? 'Mf. Wiki 8 (Miezi 2) - June hadi August 2025' : 'e.g. 8 Weeks (June to August 2025)'}
                    className="form-input-styled"
                  />
                </div>
              </div>

              {/* LOGBOOK DRAG AND DROP FILE UPLOAD */}
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{lang === 'sw' ? 'Pakia Picha au Faili la Logbook (Logbook Upload) - [Hiyari]' : 'Upload Logbook File or Page Photos - [Optional]'}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--success-green)', fontWeight: 700 }}>PDF, DOCX, PNG, JPG</span>
                </label>
                
                <div className="file-upload-dropzone">
                  {logbookFile ? (
                    <div className="uploaded-file-chip">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-green)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary-navy)' }}>{logbookFile.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(logbookFile.size / 1024).toFixed(1)} KB — {lang === 'sw' ? 'Faili Liko Tayari' : 'File Ready'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLogbookFile(null)}
                        style={{ color: 'var(--accent-red)', fontWeight: 800, fontSize: '0.85rem' }}
                      >
                        {lang === 'sw' ? 'Ondoa' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <label className="dropzone-label">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.8" style={{ marginBottom: '10px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', marginBottom: '4px' }}>
                        {lang === 'sw' ? 'Bofya Hapa au Buruta Faili la Logbook' : 'Click Here or Drag & Drop Logbook File'}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {lang === 'sw' ? 'Unaweza kuweka picha za kurasa za logbook yako au PDF' : 'You can upload photos of your logbook pages or PDF document'}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Research Proposal & Full Research Section */
            <div className="form-step-section">
              <div className="form-step-title">
                <span className="step-badge-num">2</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{lang === 'sw' ? 'Taarifa za Utafiti (Research Details)' : 'Research Details'}</h4>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'sw' ? 'Jaza mada ya utafiti au maelekezo yako' : 'Enter your research topic or supervisor guidelines'}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'sw' ? 'Mada ya Utafiti (Research Topic) *' : 'Research Topic *'}</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <input
                    type="text"
                    required
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    placeholder={lang === 'sw' ? 'Mf. Assessment of Credit Risk Management on Commercial Bank Performance in Tanzania' : 'e.g. Assessment of Credit Risk Management on Commercial Bank Performance in Tanzania'}
                    className="form-input-styled"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'sw' ? 'Maelezo ya Ziada / Case ya Utafiti - [Hiyari]' : 'Additional Research Notes & Case Study - [Optional]'}</label>
                <textarea
                  rows="4"
                  value={researchSummary}
                  onChange={(e) => setResearchSummary(e.target.value)}
                  placeholder={lang === 'sw' ? 'Eleza kisa cha mfano (Case Study) au malengo yoyote maalum yaliyoagizwa na Supervisor wako...' : 'Describe case study organization or specific guidelines required by your supervisor...'}
                  className="form-input-styled"
                  style={{ paddingLeft: '16px' }}
                ></textarea>
              </div>
            </div>
          )}

          {/* SECTION 3: Payment & Confirmation */}
          <div className="form-step-section">
            <div className="form-step-title">
              <span className="step-badge-num">3</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{lang === 'sw' ? 'Maelekezo ya Malipo & Kithibitisho' : 'Payment Instructions & Confirmation'}</h4>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>{lang === 'sw' ? 'Fanya malipo ili kuanza kuandaliwa kwa ripoti yako' : 'Complete payment to initiate report drafting'}</span>
              </div>
            </div>

            <div className="payment-instructions-box">
              <h5>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                {t.checkoutInstructions}
              </h5>
              <p>{t.paymentDetails}</p>
              
              <div className="payment-item-row">
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8, display: 'block' }}>{lang === 'sw' ? 'LIPA NAMBA (Tigo Pesa / Vodacom / Airtel):' : 'LIPA NUMBER (M-Pesa / Tigo Pesa / Airtel):'}</span>
                  <span className="payment-item-num">5409138</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.9, display: 'block', marginTop: '2px' }}>{lang === 'sw' ? 'Jina la Akaunti: REPORT SAFI SERVICES' : 'Account Name: REPORT SAFI SERVICES'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLipa}
                  className="copy-lipa-btn"
                >
                  {copiedPayNumber ? (lang === 'sw' ? '✓ Imenukuliwa!' : '✓ Copied!') : (lang === 'sw' ? 'Nukuu Namba' : 'Copy Number')}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.proofPlaceholder} *</label>
              <div className="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <input
                  type="text"
                  required
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder={lang === 'sw' ? 'Mf. 9A827361GH au namba ya muamala' : 'e.g. 9A827361GH or transaction ref'}
                  className="form-input-styled"
                />
              </div>
            </div>

            {/* Dynamic Summary Price Banner */}
            <div style={{ background: 'var(--neutral-bg)', border: '1.5px solid var(--accent-gold)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>{lang === 'sw' ? 'Aina ya Ripoti Uliyochagua:' : 'Selected Report Type:'}</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-navy)' }}>{getTypeName()}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>{lang === 'sw' ? 'Jumla ya Malipo:' : 'Total Payment:'}</span>
                <strong style={{ fontSize: '1.6rem', color: 'var(--accent-red)', fontFamily: 'var(--font-heading)' }}>TZS {getPriceForType().toLocaleString()}/=</strong>
              </div>
            </div>

            <button type="submit" className="cart-action-btn" style={{ fontSize: '1.15rem', padding: '18px' }}>
              {t.fieldSubmit} (TZS {getPriceForType().toLocaleString()}/=)
            </button>

            <div className="form-trust-footer">
              <span>✓ {lang === 'sw' ? 'Usalama na Uwazi wa 100%' : '100% Transparency & Security'}</span>
              <span>✓ {lang === 'sw' ? 'Ripoti yenye Viwango vya Chuo' : 'University Grade Reports'}</span>
              <span>✓ {lang === 'sw' ? 'Uwasilishaji kwa WhatsApp / Email' : 'Delivery via WhatsApp / Email'}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
