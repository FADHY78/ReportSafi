import React from 'react';
import PageHero from './PageHero';

export default function ReportDetailView({
  report,
  courses,
  faculties,
  cart,
  toggleCartSelection,
  onBack,
  onProceedOrder,
  lang = 'sw',
  t
}) {
  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h3>{lang === 'sw' ? 'Ripoti haijapatikana' : 'Report Not Found'}</h3>
        <button onClick={onBack} className="cart-action-btn" style={{ width: 'auto', marginTop: '16px' }}>
          {lang === 'sw' ? 'Rudi Kwenye Orodha ya Mada' : 'Back to Research Titles'}
        </button>
      </div>
    );
  }

  const course = courses.find((c) => c.id === report.courseId);
  const faculty = course ? faculties.find((f) => f.id === course.facultyId) : null;
  const isSelected = cart.some((c) => c.id === report.id);

  const courseName = course ? (lang === 'sw' ? course.nameSw : course.nameEn) : 'Course';
  const facultyName = faculty ? (lang === 'sw' ? faculty.nameSw : faculty.nameEn) : 'Faculty';

  return (
    <div>
      {/* PAGE HERO HEADER */}
      <PageHero
        badge={lang === 'sw' ? 'MUHTASARI WA TAALUMA & SURA ZA RIPOTI' : 'EXECUTIVE ABSTRACT & CHAPTER OUTLINE'}
        title={report.title}
        subtitle={`${courseName} • ${facultyName} • ${lang === 'sw' ? 'Mwaka wa Masomo' : 'Academic Year'} ${report.year}`}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        }
        chips={[
          `🎓 ${lang === 'sw' ? 'Chuo:' : 'University:'} ${report.universityTag || 'IFM / UDSM / DIT'}`,
          `📚 ${course?.code || 'DEG'}`,
          lang === 'sw' ? '⏱️ Masaa 24-48 Delivery' : '⏱️ 24-48h Delivery'
        ]}
      />

      <div className="booking-container" style={{ marginTop: '20px' }}>
        {/* BREADCRUMB NAVIGATION BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--primary-navy)',
              borderColor: 'var(--primary-navy)'
            }}
          >
            ← {lang === 'sw' ? 'Rudi Kwenye Orodha ya Mada' : 'Back to Titles List'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{lang === 'sw' ? 'Mwanzo' : 'Home'}</span>
            <span>/</span>
            <span>{lang === 'sw' ? 'Tafuta Ripoti' : 'Find Report'}</span>
            <span>/</span>
            <strong style={{ color: 'var(--primary-navy)' }}>{report.universityTag || 'IFM'}</strong>
          </div>
        </div>

        {/* 2-COLUMN MAIN PAGE CONTENT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }} className="report-detail-grid">
          {/* LEFT MAIN COLUMN: Abstract, Objectives, Chapters */}
          <div>
            {/* Report Header Card */}
            <div
              style={{
                background: 'var(--white)',
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)',
                marginBottom: '28px'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span className="price-pill-tag" style={{ background: 'var(--primary-navy)', color: 'var(--accent-gold)' }}>
                  🎓 {report.universityTag || 'IFM'} Compliant
                </span>
                <span className="year-pill">{report.year}</span>
                <span className={`status-pill ${isSelected ? 'selected' : report.status}`}>
                  ● {isSelected ? t.statusSelected : report.status === 'available' ? t.statusAvailable : t.statusApproved}
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', lineHeight: 1.35, marginBottom: '14px' }}>
                {report.title}
              </h2>

              <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>📁 <strong>{lang === 'sw' ? 'Kitivo:' : 'Faculty:'}</strong> {facultyName}</span>
                <span>🎓 <strong>{lang === 'sw' ? 'Kozi:' : 'Course:'}</strong> {courseName} ({course?.code || 'DEG'})</span>
              </div>
            </div>

            {/* EXECUTIVE ABSTRACT SECTION */}
            <div
              style={{
                background: 'var(--white)',
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)',
                marginBottom: '28px'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                {lang === 'sw' ? '📌 Muhtasari Rasmi wa Taaluma (Executive Abstract)' : '📌 Official Executive Abstract'}
              </h3>

              <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.75, marginBottom: '20px' }}>
                {report.abstract}
              </p>

              <div style={{ background: 'var(--neutral-bg)', borderLeft: '4px solid var(--accent-gold)', padding: '16px 20px', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--primary-navy)', marginBottom: '6px' }}>
                  {lang === 'sw' ? '🎯 Malengo Makuu ya Utafiti Hii (Research Objectives):' : '🎯 Primary Research Objectives:'}
                </strong>
                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                  <li>{lang === 'sw' ? 'Tathmini ya kina ya mfumo na changamoto zilizopo katika uagizaji.' : 'In-depth assessment of current frameworks and operational challenges.'}</li>
                  <li>{lang === 'sw' ? 'Uchambuzi wa mbinu bora za uendeshaji kulingana na miongozo ya vyuo.' : 'Analysis of best practices in accordance with university guidelines.'}</li>
                  <li>{lang === 'sw' ? 'Kutoa mapendekezo yanayotekelezeka kwa ajili ya taasisi na serikali.' : 'Actionable recommendations for institutional policy and practice.'}</li>
                </ul>
              </div>
            </div>

            {/* TABLE OF CONTENTS OUTLINE SECTION */}
            <div
              style={{
                background: 'var(--white)',
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)',
                marginBottom: '28px'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                {lang === 'sw' ? '📑 Muundo wa Sura Zilizopo kwenye Ripoti (Table of Contents Outline)' : '📑 Table of Contents & Chapter Outline'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ border: '1px solid var(--border-color)', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-bg)' }}>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', display: 'block', marginBottom: '6px' }}>
                    {lang === 'sw' ? 'Sura ya 1: UTANGULIZI (CHAPTER ONE: INTRODUCTION)' : 'CHAPTER ONE: INTRODUCTION'}
                  </strong>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                    Background to the study, Statement of the problem, Research Objectives, Research Questions, Significance of the Study, Scope and Limitations.
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-color)', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-bg)' }}>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', display: 'block', marginBottom: '6px' }}>
                    {lang === 'sw' ? 'Sura ya 2: MAPITIO YA TAALUMA (CHAPTER TWO: LITERATURE REVIEW)' : 'CHAPTER TWO: LITERATURE REVIEW'}
                  </strong>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                    Theoretical Framework, Empirical Literature Review, Knowledge Gap Analysis, Conceptual Framework with Independent and Dependent Variables.
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-color)', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-bg)' }}>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', display: 'block', marginBottom: '6px' }}>
                    {lang === 'sw' ? 'Sura ya 3: MBINU ZA UTAFITI (CHAPTER THREE: RESEARCH METHODOLOGY)' : 'CHAPTER THREE: RESEARCH METHODOLOGY'}
                  </strong>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                    Research Design, Targeted Population, Sampling Techniques & Sample Size, Data Collection Instruments (Questionnaires & Interviews), Data Reliability & Validity.
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-color)', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-bg)' }}>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', display: 'block', marginBottom: '6px' }}>
                    {lang === 'sw' ? 'Sura ya 4: UCHAMBUZI WA DATA NA MATOKEO (CHAPTER FOUR: DATA ANALYSIS & FINDINGS)' : 'CHAPTER FOUR: DATA ANALYSIS & FINDINGS'}
                  </strong>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                    Response Rate, Demographic Characteristics, Statistical Analysis of Research Objectives, Hypothesis Testing and Interpretation of Results.
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-color)', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-bg)' }}>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--primary-navy)', display: 'block', marginBottom: '6px' }}>
                    {lang === 'sw' ? 'Sura ya 5: MUHTASARI, HITIMISHO NA MAPENDEKEZO (CHAPTER FIVE: CONCLUSION & RECOMMENDATIONS)' : 'CHAPTER FIVE: CONCLUSION & RECOMMENDATIONS'}
                  </strong>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                    Summary of Major Findings, Conclusion of the Study, Policy & Practical Recommendations, Areas for Further Research, References & Appendix.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Order Card & Contact Support */}
          <div>
            <div
              style={{
                background: 'var(--white)',
                padding: '28px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1.5px solid var(--accent-gold)',
                position: 'sticky',
                top: '90px'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  {lang === 'sw' ? 'BEI YA MAANDALIZI / ORDER PRICE' : 'TOTAL ORDER PRICE'}
                </span>
                <strong style={{ fontSize: '1.8rem', color: 'var(--accent-red)', fontFamily: 'var(--font-heading)', display: 'block', margin: '4px 0' }}>
                  {report.type === 'field' ? 'TZS 20,000/=' : 'TZS 50,000/='}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--success-green)', fontWeight: 700 }}>
                  ✓ Soft Copy & Formatting Included
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSelected) toggleCartSelection(report);
                    onProceedOrder();
                  }}
                  className="cart-action-btn"
                  style={{ padding: '16px', fontSize: '1.05rem' }}
                >
                  {lang === 'sw' ? '🚀 Agiza Ripoti Hii Sasa' : '🚀 Order This Report Now'}
                </button>

                <button
                  type="button"
                  onClick={() => toggleCartSelection(report)}
                  className="btn-secondary"
                  style={{
                    padding: '12px',
                    fontSize: '0.9rem',
                    color: isSelected ? 'var(--accent-gold)' : 'var(--primary-navy)',
                    background: isSelected ? 'var(--primary-navy)' : 'var(--white)',
                    borderColor: 'var(--primary-navy)'
                  }}
                >
                  {isSelected
                    ? (lang === 'sw' ? '✓ Imechaguliwa Kwenye Kapu' : '✓ Added to Cart')
                    : (lang === 'sw' ? '+ Weka Kwenye Kapu' : '+ Add to Cart')}
                </button>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={`https://wa.me/255613328915?text=${encodeURIComponent(`Habari Report Safi! Naomba maelekezo kuhusu mada hii: ${report.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card-action-btn wa"
                style={{ textAlign: 'center', marginBottom: '24px' }}
              >
                {lang === 'sw' ? 'Wasiliana na Mtaalamu kwa WhatsApp →' : 'Chat with Academic Expert on WhatsApp →'}
              </a>

              {/* Trust Badges List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success-green)', fontWeight: 900 }}>✓</span>
                  <span>100% Plagiarism Free Guarantee</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success-green)', fontWeight: 900 }}>✓</span>
                  <span>{lang === 'sw' ? 'Miongozo ya Chuo (APA/Harvard Format)' : 'University Standards (APA/Harvard Format)'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--success-green)', fontWeight: 900 }}>✓</span>
                  <span>{lang === 'sw' ? 'Uwasilishaji wa Masaa 24-48' : '24-48 Hours Fast Delivery'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
