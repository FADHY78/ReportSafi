import React from 'react';

export default function Hero({ setView, lang = 'sw', t }) {
  const colleges = [
    { name: "UDSM", fullName: "University of Dar es Salaam", logoUrl: "/logos/udsm-logo.jpg" },
    { name: "DIT", fullName: "Dar es Salaam Institute of Technology", logoUrl: "/logos/dit-logo.jpg" },
    { name: "IFM", fullName: "Institute of Finance Management", logoUrl: "/logos/ifm-logo.jpg" },
    { name: "CBE", fullName: "College of Business Education", logoUrl: "/logos/cbe-logo.jpg" },
    { name: "TIA", fullName: "Tanzania Institute of Accountancy", logoUrl: "/logos/tia-logo.jpg" },
    { name: "MUHAS", fullName: "Muhimbili University of Health & Allied Sciences", logoUrl: "/logos/muhas-logo.jpg" },
    { name: "ARDHI", fullName: "Ardhi University", logoUrl: "/logos/ardhi-logo.jpg" },
    { name: "SAUT", fullName: "St. Augustine University of Tanzania", logoUrl: "/logos/saut-logo.jpg" },
    { name: "MZUMBE", fullName: "Mzumbe University", logoUrl: "/logos/mzumbe-logo.jpg" }
  ];

  const valueProps = [
    {
      title: t.whyCheck1,
      desc: t.whyCheck1Desc,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    {
      title: t.whyCheck2,
      desc: t.whyCheck2Desc,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      )
    },
    {
      title: t.whyCheck3,
      desc: t.whyCheck3Desc,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M9 15l2 2 4-4"></path>
        </svg>
      )
    },
    {
      title: t.whyCheck4,
      desc: t.whyCheck4Desc,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      )
    }
  ];

  const steps = [
    {
      badge: lang === 'sw' ? "HATUA 1" : "STEP 1",
      title: t.step1,
      desc: t.step1Desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      )
    },
    {
      badge: lang === 'sw' ? "HATUA 2" : "STEP 2",
      title: t.step2,
      desc: t.step2Desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    {
      badge: lang === 'sw' ? "HATUA 3" : "STEP 3",
      title: t.step3,
      desc: t.step3Desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      )
    },
    {
      badge: lang === 'sw' ? "HATUA 4" : "STEP 4",
      title: t.step4,
      desc: t.step4Desc,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      )
    }
  ];

  const sampleTitles = [
    {
      faculty: lang === 'sw' ? "Procurement & Logistics" : "Procurement & Logistics",
      title: "Assessment of E-Procurement Adoption on Inventory Performance in Public Sector",
      tag: lang === 'sw' ? "AVAILABLE" : "AVAILABLE",
      color: "var(--success-green)"
    },
    {
      faculty: lang === 'sw' ? "IT & Computer Science" : "IT & Computer Science",
      title: "Design of an Offline-Enabled Financial App for SMEs in Dar es Salaam",
      tag: lang === 'sw' ? "AVAILABLE" : "AVAILABLE",
      color: "var(--success-green)"
    },
    {
      faculty: lang === 'sw' ? "Accounting & Finance" : "Accounting & Finance",
      title: "The Impact of EFD Machines on Tax Compliance in Kariakoo Retail Market",
      tag: lang === 'sw' ? "AVAILABLE" : "AVAILABLE",
      color: "var(--success-green)"
    }
  ];

  const stats = [
    {
      number: "1,480+",
      label: lang === 'sw' ? "Wanafunzi Waliohudumiwa" : "Students Served",
      sub: lang === 'sw' ? "Kutoka Vyuo Vyote Tanzania" : "Across All Tanzanian Universities",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      number: "2,150+",
      label: lang === 'sw' ? "Ripoti Zilizotolewa" : "Reports Delivered",
      sub: lang === 'sw' ? "Field Reports & Proposals" : "Field Reports & Research Papers",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M9 15l2 2 4-4"></path>
        </svg>
      )
    },
    {
      number: "9+",
      label: lang === 'sw' ? "Vyuo Vikuu Vikuu" : "Major Universities",
      sub: "UDSM, IFM, DIT, TIA, CBE, MUHAS, ARDHI, SAUT, MZUMBE",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      )
    },
    {
      number: "99.4%",
      label: lang === 'sw' ? "Kiwango cha Kuridhika" : "Satisfaction Rate",
      sub: lang === 'sw' ? "Wanafunzi Wanaotupendekeza" : "Students Recommending Us",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    }
  ];

  return (
    <div>
      {/* Hero Header Area */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="price-banner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              {t.badgeOffer}: TZS 20,000/=
            </div>

            <h1>{t.heroTitle}</h1>
            <p>{t.heroSubtitle}</p>

            {/* Stat chips */}
            <div className="hero-stat-chips">
              <div className="stat-chip">
                <span className="stat-chip-icon">✓</span>
                <span>{lang === 'sw' ? '100% Okoa Muda' : '100% Time Saving'}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-icon">🎓</span>
                <span>{lang === 'sw' ? 'Muundo wa Vyuo Vikuu' : 'Official University Standards'}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-icon">⚡</span>
                <span>{lang === 'sw' ? 'Uwasilishaji wa Haraka' : '24-48h Fast Delivery'}</span>
              </div>
            </div>

            <div className="hero-ctas">
              <button onClick={() => setView('booking')} className="btn-primary">
                {t.heroCta}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              <button onClick={() => setView('contact')} className="btn-secondary">
                {t.heroSecondaryCta}
              </button>
            </div>
          </div>

          {/* REALISTIC ACADEMIC COVER PAGE MOCKUP WITH REAL IFM LOGO */}
          <div className="hero-visual">
            <div className="coverpage-mockup">
              {/* College Logo Emblem Header */}
              <div className="coverpage-emblem-box">
                <div className="college-crest-icon">
                  <img src="/logos/ifm-logo.jpg" alt="IFM Logo" className="ifm-emblem-img" />
                </div>
                <div className="coverpage-univ-name">THE INSTITUTE OF FINANCE MANAGEMENT (IFM)</div>
                <div className="coverpage-dept-name">FACULTY OF COMPUTING & BUSINESS MANAGEMENT</div>
              </div>

              {/* Title Header Box */}
              <div className="coverpage-title-box">
                <span className="coverpage-report-type">FIELD ATTACHMENT REPORT</span>
                <h3 className="coverpage-report-title">
                  A PRACTICAL TRAINING REPORT CONDUCTED AT TANZANIA REVENUE AUTHORITY (TRA)
                </h3>
                <div className="coverpage-sub-detail">CUSTOMS & EXCISE DEPARTMENT — DAR ES SALAAM</div>
              </div>

              {/* Student Details Section */}
              <div className="coverpage-student-box">
                <div className="student-detail-row">
                  <strong>PREPARED BY:</strong>
                  <span>KELVIN MASSAWE</span>
                </div>
                <div className="student-detail-row">
                  <strong>REGISTRATION NO:</strong>
                  <span>IMC/BBA/2023/0482</span>
                </div>
                <div className="student-detail-row">
                  <strong>COURSE:</strong>
                  <span>BACHELOR OF BUSINESS ADM.</span>
                </div>
                <div className="student-detail-row">
                  <strong>DATE OF SUBMISSION:</strong>
                  <span>OCTOBER 2025</span>
                </div>
              </div>

              {/* Cover Page Footer & Wax Stamp */}
              <div className="coverpage-footer">
                <span>SUBMITTED TO IFM FOR ASSESSMENT</span>
                <div className="coverpage-verified-stamp">
                  <span>REPORT SAFI</span>
                  <strong>APPROVED</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College Trust Badges Row - Infinite Horizontal Scrolling Marquee */}
      <section className="trust-row">
        <h4 className="trust-title">
          {lang === 'sw' ? 'TUNAHUDUMIA WANAFUNZI WA VYUO VYOTE TANZANIA' : 'SERVING STUDENTS ACROSS ALL TANZANIAN UNIVERSITIES'}
        </h4>
        
        <div className="logo-marquee-container">
          <div className="logo-marquee-track">
            {/* Duplicated list for seamless infinite horizontal scrolling */}
            {[...colleges, ...colleges].map((college, idx) => (
              <div key={idx} className="uni-badge-wrapper" title={college.fullName}>
                <img src={college.logoUrl} alt={`${college.name} Logo`} className="uni-trust-logo" />
                <span className="uni-badge-name">{college.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Values Checklist */}
      <section className="values-section">
        <div className="section-header">
          <h2>{t.whyChooseUs}</h2>
          <p>
            {lang === 'sw'
              ? 'Tunaamini katika kuokoa muda wako na kuleta matokeo bora ya kitaaluma.'
              : 'We believe in saving your time and delivering top academic excellence.'}
          </p>
        </div>
        <div className="values-grid">
          {valueProps.map((item, idx) => (
            <div key={idx} className="value-card">
              <div className="value-icon-circle">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Mada Showcase Section */}
      <section style={{ background: 'var(--white)', padding: '80px 6%', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div className="section-header">
            <h2>{lang === 'sw' ? 'Mada za Mfano Zilizopo (Sample Topics)' : 'Sample Available Research Topics'}</h2>
            <p>{lang === 'sw' ? 'Vinjari mada mbalimbali za utafiti zilizokamilika na zilizo tayari kuteuliwa.' : 'Browse approved research titles ready for selection.'}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {sampleTitles.map((sample, idx) => (
              <div key={idx} className="value-card" style={{ padding: '28px', borderLeft: `5px solid ${sample.color}` }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {sample.faculty}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', lineHeight: 1.35 }}>{sample.title}</h3>
                <span className="status-pill available">
                  ● {sample.tag}
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={() => setView('booking')} className="btn-primary">
              {lang === 'sw' ? 'Angalia Mada Zote (View All Titles)' : 'Browse All Available Titles →'}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Stepper Section ("Jinsi Inavyofanya Kazi") */}
      <section className="stepper-section">
        <div className="section-header">
          <h2>{t.howItWorks}</h2>
          <p>{lang === 'sw' ? 'Hatua 4 Rahisi za Kupata Ripoti Yako kwa Njia ya Mtandao' : '4 Easy Steps to Get Your Academic Report Online'}</p>
        </div>

        <div className="stepper-grid">
          {steps.map((st, idx) => (
            <div key={idx} className="step-card">
              <div className="step-number-badge">{st.badge}</div>
              <div className="step-icon-wrapper">
                {st.icon}
              </div>
              <h3>{st.title}</h3>
              <p>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVED CUSTOMERS & IMPACT COUNTER BANNER */}
      <section className="impact-counter-section">
        <div className="impact-counter-container">
          <div className="impact-header">
            <span className="impact-badge">{lang === 'sw' ? 'MAFANO YA MAFANIKIO YETU' : 'OUR TRACK RECORD OF EXCELLENCE'}</span>
            <h2>{lang === 'sw' ? 'Wanafunzi Wanaotushukuru Tanzania' : 'Satisfied Students Across Tanzania'}</h2>
            <p>{lang === 'sw' ? 'Tumeokoa maelfu ya masaa ya wanafunzi wa vyuo vikuu na vyuo vya kati nchini kote.' : 'We have saved thousands of hours for college & university students nationwide.'}</p>
          </div>

          <div className="impact-stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="impact-stat-card">
                <div className="stat-icon-box">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-sub">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Testimonial Quote Highlight */}
          <div className="impact-quote-box">
            <div className="quote-icon">“</div>
            <p className="quote-text">
              {lang === 'sw'
                ? '"Nilikuwa na wiki 1 tu nimebakiwa nayo kuwasilisha field report IFM na sikuwa nimeanza. Report Safi waliniandalia ripoti nzuri kulingana na logbook yangu kwa TZS 20,000 tu!"'
                : '"I had only 1 week left to submit my IFM field report and had not started. Report Safi prepared an excellent report matching my logbook for just TZS 20,000!"'}
            </p>
            <div className="quote-author">
              <strong>— Hassan K.</strong>
              <span>{lang === 'sw' ? 'Mwanafunzi wa Bachelor of Banking & Finance (IFM)' : 'Bachelor of Banking & Finance Student (IFM)'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
