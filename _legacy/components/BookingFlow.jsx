import React, { useState } from 'react';
import PageHero from './PageHero';

export default function BookingFlow({
  faculties,
  courses,
  titles,
  cart,
  toggleCartSelection,
  onViewDetail,
  lang,
  t
}) {
  // Page mode: 'wizard' (3-Step Guided) or 'track' (Order Tracking)
  const [pageMode, setPageMode] = useState('wizard');

  // Stepper Wizard state
  const [activeStep, setActiveStep] = useState(1); // 1 = Faculty, 2 = Course, 3 = Titles
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('all');
  const [selectedUniversityFilter, setSelectedUniversityFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('AZ');

  // Preview Modal state
  const [previewTitle, setPreviewTitle] = useState(null);

  // Student Order Details Form State for Step 3
  const [formData, setFormData] = useState({
    reportType: 'field',
    studentName: '',
    regNo: '',
    university: 'IFM',
    customTopic: '',
    selectedTitleId: '',
    phone: '',
    yearOfStudy: 'Mwaka wa 3 (Final Year)',
    notes: ''
  });
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState(null);
  const [step3SubTab, setStep3SubTab] = useState('form');

  // Order Tracking state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  // List of target universities for quick filtering
  const universitiesList = [
    'ALL',
    'IFM',
    'UDSM',
    'DIT',
    'CBE',
    'TIA',
    'MUHAS',
    'ARDHI',
    'SAUT',
    'MZUMBE'
  ];

  // Helper function to render faculty vector icons
  const renderFacultyIcon = (iconType) => {
    switch (iconType) {
      case 'briefcase':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
      case 'monitor':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
      case 'calculator':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line></svg>;
      case 'gear':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
      case 'graduation':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;
      case 'stethoscope':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 0 1 5 2h4a.3.3 0 0 1 .2.3v5a4 4 0 0 1-8 0v-5a.3.3 0 0 1 .2-.3z"></path><path d="M9 12a7 7 0 0 1-14 0"></path><circle cx="19" cy="10" r="3"></circle></svg>;
      case 'users':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>;
      case 'scale':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M3 7l9-4 9 4M3 7v6a6 6 0 0 0 12 0V7M12 7v6a6 6 0 0 0 12 0V7"></path></svg>;
      case 'sprout':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 20h10M12 20V10M12 10C8 10 4 6 4 2c4 0 8 4 8 8M12 10c4 0 8-4 8-8-4 0-8 4-8 8"></path></svg>;
      case 'compass':
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>;
      default:
        return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
    }
  };

  // Helper to find course & faculty name for a title
  const getCourseDetails = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return { courseName: 'Kozi ya Kitaalamu', facultyName: 'Kitivo cha Chuo', code: 'UNI' };
    const faculty = faculties.find((f) => f.id === course.facultyId);
    return {
      courseName: lang === 'sw' ? course.nameSw : course.nameEn,
      facultyName: faculty ? (lang === 'sw' ? faculty.nameSw : faculty.nameEn) : 'Kitivo cha Chuo',
      code: course.code || 'DEG'
    };
  };

  // Filtered titles for INSTANT SEARCH MODE
  const allFilteredTitles = titles
    .filter((title) => {
      // Keyword match
      const matchSearch =
        searchQuery === '' ||
        title.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.abstract.toLowerCase().includes(searchQuery.toLowerCase());

      // Faculty filter match
      let matchFaculty = true;
      if (selectedFacultyFilter !== 'all') {
        const course = courses.find((c) => c.id === title.courseId);
        matchFaculty = course && course.facultyId === selectedFacultyFilter;
      }

      // University filter match
      let matchUni = true;
      if (selectedUniversityFilter !== 'all') {
        matchUni = title.universityTag && title.universityTag.toLowerCase() === selectedUniversityFilter.toLowerCase();
      }

      // Year match
      const matchYear = selectedYear === 'all' || title.year === selectedYear;

      // Status match
      const matchStatus =
        selectedStatusFilter === 'all' || title.status === selectedStatusFilter;

      return matchSearch && matchFaculty && matchUni && matchYear && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'AZ') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  // Filtered courses for Step 2 of Wizard
  const wizardCourses = courses.filter(
    (c) => selectedFaculty && c.facultyId === selectedFaculty.id
  );

  // Filtered titles for Step 3 of Wizard with automatic fallback handling
  let rawWizardTitles = titles.filter((title) => {
    if (selectedCourse) {
      return title.courseId === selectedCourse.id;
    } else if (selectedFaculty) {
      const crs = courses.find((c) => c.id === title.courseId);
      return crs && crs.facultyId === selectedFaculty.id;
    }
    return true; // Fallback: show all if step 3 accessed directly
  });

  // Double Fallback Guarantee: If selected course has 0 specific titles, pull all titles under that faculty so student is NEVER left empty-handed
  if (selectedCourse && rawWizardTitles.length === 0 && selectedFaculty) {
    rawWizardTitles = titles.filter((title) => {
      const crs = courses.find((c) => c.id === title.courseId);
      return crs && crs.facultyId === selectedFaculty.id;
    });
  }

  // Triple Fallback Guarantee: If rawWizardTitles is still empty, show all titles
  if (rawWizardTitles.length === 0) {
    rawWizardTitles = titles;
  }

  const wizardTitles = rawWizardTitles
    .filter((title) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        title.title.toLowerCase().includes(q) ||
        title.abstract.toLowerCase().includes(q) ||
        (title.universityTag && title.universityTag.toLowerCase().includes(q));
      const matchYear = selectedYear === 'all' || title.year === selectedYear;
      const matchUni = selectedUniversityFilter === 'all' || (title.universityTag && title.universityTag.toLowerCase() === selectedUniversityFilter.toLowerCase());
      return matchSearch && matchYear && matchUni;
    })
    .sort((a, b) => {
      if (sortBy === 'AZ') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  // Available academic years
  const availableYears = Array.from(new Set(titles.map((t) => t.year)));

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setSelectedCourse(null);
    setSearchQuery('');
    setSelectedUniversityFilter('all');
    setSelectedYear('all');
    setActiveStep(2);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSearchQuery('');
    setSelectedUniversityFilter('all');
    setSelectedYear('all');
    setStep3SubTab('form');
    setActiveStep(3);

    // Auto pre-fill title if matching titles exist
    const matching = titles.filter((t) => t.courseId === course.id);
    if (matching.length > 0) {
      setFormData((prev) => ({
        ...prev,
        selectedTitleId: matching[0].id,
        customTopic: matching[0].title,
        university: matching[0].universityTag || 'IFM'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedTitleId: '',
        customTopic: lang === 'sw' ? `Utafiti na Ripoti ya ${course.nameSw}` : `Field Research Report on ${course.nameEn}`
      }));
    }
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleFormOrderSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.regNo.trim()) return;

    const newOrderId = 'RS-' + Math.floor(10000 + Math.random() * 90000);
    const amountStr = formData.reportType === 'field' ? 'TZS 20,000/=' : 'TZS 50,000/=';
    const finalTopic = formData.customTopic || (selectedCourse ? selectedCourse.nameSw : 'Field Report');

    setOrderSubmittedSuccess({
      orderId: newOrderId,
      amount: amountStr,
      studentName: formData.studentName,
      regNo: formData.regNo,
      university: formData.university,
      courseName: selectedCourse ? (lang === 'sw' ? selectedCourse.nameSw : selectedCourse.nameEn) : '',
      topic: finalTopic,
      phone: formData.phone
    });

    if (onAddToCart) {
      onAddToCart({
        id: newOrderId,
        title: finalTopic,
        universityTag: formData.university,
        year: '2024/2025',
        price: formData.reportType === 'field' ? 20000 : 50000,
        type: formData.reportType === 'field' ? 'Field Report' : 'Full Research Report'
      });
    }
  };

  // Order tracking handler
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    const cleanQ = trackQuery.trim().toUpperCase();
    setTrackResult({
      orderId: 'RS-' + Math.floor(10000 + Math.random() * 90000),
      regNo: cleanQ.includes('IMC') || cleanQ.includes('BCS') ? cleanQ : 'IMC/BBA/2023/0482',
      studentName: 'Kelvin Massawe',
      university: 'IFM (Institute of Finance Management)',
      reportType: 'Field Report (TZS 20,000/=)',
      statusStep: 3,
      statusText: 'Utafiti na Uandishi wa Mada Unaendelea',
      estimatedDelivery: 'Masaa 12-18 Yaliyobaki',
      txId: '5409138 (REPORT SAFI SERVICES)'
    });
  };

  return (
    <div>
      {/* ELEGANT PAGE HERO BANNER */}
      <PageHero
        badge={lang === 'sw' ? 'KATALOGI KUU YA MADA NA RESEARCH' : 'MASTER RESEARCH CATALOGUE'}
        title={lang === 'sw' ? 'Tafuta Ripoti na Mada za Utafiti' : 'Search Reports & Research Titles'}
        subtitle={
          lang === 'sw'
            ? 'Vinjari zaidi ya mada 250+ zilizoidhinishwa kitaalamu katika Vitivo 12 na Kozi 35+ kwa ajili ya vyuo vyote Tanzania (IFM, UDSM, DIT, CBE, TIA, MUHAS, ARDHI, SAUT, MZUMBE).'
            : 'Browse over 250+ professionally approved research titles across 12 Faculties and 35+ Courses for all Tanzanian universities.'
        }
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        }
        chips={[
          lang === 'sw' ? 'Vitivo 12 Rasmi' : '12 Faculties',
          lang === 'sw' ? 'Kozi 35+ Zilizoidhinishwa' : '35+ Approved Courses',
          lang === 'sw' ? 'Mada 250+ Tayari' : '250+ Ready Titles',
          lang === 'sw' ? 'Ufuatiliaji wa Oda Papo Hapo' : 'Order Status Tracker'
        ]}
      />

      <div className="booking-container">
        {/* MAIN MODE SWITCHER TABS - HORIZONTAL PROFESSIONAL LAYOUT */}
        <div className="mode-switcher-segmented-bar">
          {/* Tab 1: Guided Wizard */}
          <button
            type="button"
            onClick={() => setPageMode('wizard')}
            className={`mode-tab-button ${pageMode === 'wizard' ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="mode-tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div className="mode-tab-text">
                <span className="mode-tab-title">{lang === 'sw' ? 'Hatua kwa Hatua' : 'Guided Wizard'}</span>
                <span className="mode-tab-sub">{lang === 'sw' ? 'Vitivo na Kozi' : 'Faculties & Courses'}</span>
              </div>
            </div>
            <span className="mode-tab-badge">{lang === 'sw' ? 'Vitivo 12' : '12 Faculties'}</span>
          </button>

          {/* Tab 2: Full Catalog Search */}
          <button
            type="button"
            onClick={() => setPageMode('catalog')}
            className={`mode-tab-button ${pageMode === 'catalog' ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="mode-tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
              <div className="mode-tab-text">
                <span className="mode-tab-title">{lang === 'sw' ? 'Katalogi Yote' : 'Master Catalog'}</span>
                <span className="mode-tab-sub">{lang === 'sw' ? 'Orodha ya Mada Zote' : 'Browse All Titles'}</span>
              </div>
            </div>
            <span className="mode-tab-badge" style={{ background: 'var(--accent-gold)', color: 'var(--primary-navy)' }}>
              {lang === 'sw' ? '250+ Mada' : '250+ Titles'}
            </span>
          </button>

          {/* Tab 3: Track Order */}
          <button
            type="button"
            onClick={() => setPageMode('track')}
            className={`mode-tab-button track ${pageMode === 'track' ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="mode-tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <rect x="1" y="3" width="15" height="13" rx="2"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div className="mode-tab-text">
                <span className="mode-tab-title">{lang === 'sw' ? 'Fuatilia Oda Yako' : 'Track Order'}</span>
                <span className="mode-tab-sub">{lang === 'sw' ? 'Live Progress' : 'Real-time Lookup'}</span>
              </div>
            </div>
            <span className="mode-tab-badge">Live Status</span>
          </button>
        </div>

        {/* MODE 1: GUIDED 3-STEP WIZARD WITH 12 FACULTIES */}
        {pageMode === 'wizard' && (
          <div>
            {/* Stepper Tabs Nav */}
            <div className="booking-nav">
              <button
                onClick={() => setActiveStep(1)}
                className={`booking-tab ${activeStep === 1 ? 'active' : ''} ${selectedFaculty ? 'completed' : ''}`}
              >
                1. {t.stepFaculty} {selectedFaculty && `(${selectedFaculty.nameSw.substring(0, 15)}...)`}
              </button>
              <button
                onClick={() => selectedFaculty && setActiveStep(2)}
                disabled={!selectedFaculty}
                className={`booking-tab ${activeStep === 2 ? 'active' : ''} ${selectedCourse ? 'completed' : ''}`}
                style={{ opacity: !selectedFaculty ? 0.5 : 1 }}
              >
                2. {t.stepCourse} {selectedCourse && `(${selectedCourse.nameSw.substring(0, 15)}...)`}
              </button>
              <button
                onClick={() => selectedCourse && setActiveStep(3)}
                disabled={!selectedCourse}
                className={`booking-tab ${activeStep === 3 ? 'active' : ''}`}
                style={{ opacity: !selectedCourse ? 0.5 : 1 }}
              >
                3. {t.stepTitles} ({wizardTitles.length})
              </button>
            </div>

            {/* STEP 1: Select Faculty (12 Faculties Grid) */}
            {activeStep === 1 && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '6px' }}>
                    {lang === 'sw' ? 'Chagua Kitivo cha Masomo Yako' : 'Select Your Academic Faculty'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    {lang === 'sw'
                      ? 'Bofya kitivo kinachohusika kupata kozi na mada zake rasmi.'
                      : 'Click on your faculty to view its official courses and research titles.'}
                  </p>
                </div>

                <div className="faculties-grid">
                  {faculties.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => handleFacultySelect(fac)}
                      className={`faculty-card ${selectedFaculty?.id === fac.id ? 'selected' : ''}`}
                      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                    >
                      <div className="faculty-icon-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(18, 57, 95, 0.08)',
                            color: 'var(--primary-navy)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {renderFacultyIcon(fac.iconType)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', margin: 0 }}>
                            {lang === 'sw' ? fac.nameSw : fac.nameEn}
                          </h3>
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '14px' }}>
                        {lang === 'sw' ? (fac.descSw || fac.description) : (fac.descEn || fac.description)}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="price-pill-tag" style={{ fontSize: '0.78rem', background: 'var(--neutral-bg)', color: 'var(--primary-navy)' }}>
                          {titles.filter((t) => {
                            const c = courses.find((crs) => crs.id === t.courseId);
                            return c && c.facultyId === fac.id;
                          }).length} {lang === 'sw' ? 'Mada Zilizopo' : 'Titles Available'}
                        </span>
                        <div className="faculty-arrow" style={{ marginTop: 0 }}>
                          {t.btnChooseCourse} →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Select Course */}
            {activeStep === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)' }}>
                      {lang === 'sw' ? 'Chagua Kozi Yako' : 'Select Your Degree Course'} ({lang === 'sw' ? selectedFaculty?.nameSw : selectedFaculty?.nameEn})
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {lang === 'sw' ? 'Kozi zilizopo chini ya kitivo hiki:' : 'Available courses under this faculty:'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveStep(1)}
                    style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    ← {t.btnBackToFaculties}
                  </button>
                </div>
                
                <div className="courses-grid">
                  {wizardCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`course-card ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                      style={{ cursor: 'pointer', padding: '22px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--primary-navy)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '10px' }}>
                          {course.code || 'DEG'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {titles.filter((t) => t.courseId === course.id).length} {lang === 'sw' ? 'Mada' : 'Titles'}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-navy)', margin: 0 }}>
                        {lang === 'sw' ? course.nameSw : course.nameEn}
                      </h4>
                    </div>
                  ))}
                </div>

                {/* Direct Faculty Titles Shortcut */}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null);
                      setActiveStep(3);
                    }}
                    style={{
                      background: 'var(--neutral-bg)',
                      border: '1.5px solid var(--border-color)',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      color: 'var(--primary-navy)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {lang === 'sw' ? '💡 Au tazama mada zote za kitivo hiki mara moja →' : '💡 Or view all research titles for this faculty →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FILL IN DETAILS & ORDER FORM PAGE */}
            {activeStep === 3 && (
              <div className="titles-container">
                {/* DEDICATED COURSE SELECTION HERO CARD */}
                {selectedCourse && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e4f7a 100%)',
                      color: '#fff',
                      padding: '24px 28px',
                      borderRadius: '16px',
                      marginBottom: '20px',
                      boxShadow: '0 8px 24px rgba(18, 57, 95, 0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ background: 'var(--accent-gold)', color: 'var(--primary-navy)', fontSize: '0.8rem', fontWeight: 800, padding: '3px 10px', borderRadius: '10px' }}>
                          {selectedCourse.code || 'DEG'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
                          {selectedFaculty ? (lang === 'sw' ? selectedFaculty.nameSw : selectedFaculty.nameEn) : ''}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                        {lang === 'sw' ? selectedCourse.nameSw : selectedCourse.nameEn}
                      </h3>
                      <p style={{ margin: '6px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                        {lang === 'sw' ? 'Jaza taarifa zako hapa chini kuwasilisha oda ya ripoti rasmi kwa kozi hii.' : 'Fill in your details below to submit your official report order for this course.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
                      >
                        ← {lang === 'sw' ? 'Badili Kozi' : 'Change Course'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Tab Navigation Bar: Form View vs Catalog View */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setStep3SubTab('form')}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      cursor: 'pointer',
                      border: step3SubTab === 'form' ? '2px solid var(--primary-navy)' : '1px solid var(--border-color)',
                      background: step3SubTab === 'form' ? 'var(--primary-navy)' : 'var(--white)',
                      color: step3SubTab === 'form' ? '#fff' : 'var(--primary-navy)',
                      boxShadow: step3SubTab === 'form' ? '0 4px 12px rgba(18,57,95,0.15)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    ✍️ {lang === 'sw' ? 'Jaza Taarifa za Oda (Fill Details Form)' : 'Fill Details Form'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep3SubTab('catalog')}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      cursor: 'pointer',
                      border: step3SubTab === 'catalog' ? '2px solid var(--primary-navy)' : '1px solid var(--border-color)',
                      background: step3SubTab === 'catalog' ? 'var(--primary-navy)' : 'var(--white)',
                      color: step3SubTab === 'catalog' ? '#fff' : 'var(--primary-navy)',
                      boxShadow: step3SubTab === 'catalog' ? '0 4px 12px rgba(18,57,95,0.15)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    📚 {lang === 'sw' ? `Orodha ya Mada Zote (${wizardTitles.length})` : `Browse Titles Catalog (${wizardTitles.length})`}
                  </button>
                </div>

                {/* VIEW 1: FILL DETAILS FORM */}
                {step3SubTab === 'form' && (
                  <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>📋</span> {lang === 'sw' ? 'Jaza Taarifa za Mwanafunzi na Oda Yako' : 'Fill Student & Order Details'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '28px' }}>
                      {lang === 'sw'
                        ? 'Weka taarifa sahihi za masomo yako ili mtaalamu wetu wa Report Safi aanze kukuandalia mara moja.'
                        : 'Enter your correct student information so our Report Safi specialist can start preparing your document.'}
                    </p>

                    <form onSubmit={handleFormOrderSubmit}>
                      {/* 1. Select Service Type */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '10px', fontSize: '0.95rem' }}>
                          1. {lang === 'sw' ? 'Aina ya Huduma Unayohitaji' : 'Select Service Type'} <span style={{ color: 'red' }}>*</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                          <div
                            onClick={() => setFormData({ ...formData, reportType: 'field' })}
                            style={{
                              padding: '18px 22px',
                              borderRadius: '14px',
                              border: formData.reportType === 'field' ? '2.5px solid var(--accent-gold)' : '1px solid var(--border-color)',
                              background: formData.reportType === 'field' ? 'rgba(230, 175, 46, 0.08)' : 'var(--neutral-bg)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem' }}>
                                📘 Field Report (Ripoti ya Mafunzo)
                              </span>
                              <span style={{ background: 'var(--primary-navy)', color: 'var(--accent-gold)', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                TZS 20,000/=
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {lang === 'sw' ? 'Kazi kamili ndani ya masaa 24-48, paka mchanganuo kamili na vyeti vyote vya Field.' : 'Full report within 24-48 hrs with all field attachments.'}
                            </p>
                          </div>

                          <div
                            onClick={() => setFormData({ ...formData, reportType: 'full' })}
                            style={{
                              padding: '18px 22px',
                              borderRadius: '14px',
                              border: formData.reportType === 'full' ? '2.5px solid var(--accent-gold)' : '1px solid var(--border-color)',
                              background: formData.reportType === 'full' ? 'rgba(230, 175, 46, 0.08)' : 'var(--neutral-bg)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem' }}>
                                🎓 Full Research Report (Tesis)
                              </span>
                              <span style={{ background: 'var(--primary-navy)', color: 'var(--accent-gold)', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                TZS 50,000/=
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {lang === 'sw' ? 'Sura zote 1-5 + SPSS/Stata Analysis + Proposal + Hojaji kamili.' : 'Full Chapters 1-5 + Data Analysis + Proposal & Questionnaires.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Research Title / Topic Selection */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px', fontSize: '0.95rem' }}>
                          2. {lang === 'sw' ? 'Mada ya Utafiti (Research Topic)' : 'Research Topic'} <span style={{ color: 'red' }}>*</span>
                        </label>
                        
                        {/* Ready-made Titles Selector Dropdown */}
                        {wizardTitles.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <select
                              value={formData.selectedTitleId}
                              onChange={(e) => {
                                const selId = e.target.value;
                                const matched = wizardTitles.find(t => t.id === selId);
                                setFormData({
                                  ...formData,
                                  selectedTitleId: selId,
                                  customTopic: matched ? matched.title : formData.customTopic
                                });
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--neutral-bg)',
                                color: 'var(--primary-navy)',
                                fontSize: '0.92rem',
                                fontWeight: 600
                              }}
                            >
                              <option value="">-- {lang === 'sw' ? 'Chagua Mada Iliyopo Kwenye Katalogi' : 'Select Ready Title'} --</option>
                              {wizardTitles.map((t) => (
                                <option key={t.id} value={t.id}>
                                  [{t.universityTag || 'TZ'}] {t.title} ({t.year})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Custom Topic Textarea */}
                        <textarea
                          required
                          rows={3}
                          placeholder={lang === 'sw' ? 'Au andika mada yako mwenyewe au maelekezo ya mada hapa...' : 'Or type your own research topic or guidelines here...'}
                          value={formData.customTopic}
                          onChange={(e) => setFormData({ ...formData, customTopic: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '1.5px solid var(--border-color)',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* 3. Student Personal & Academic Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px', fontSize: '0.9rem' }}>
                            {lang === 'sw' ? 'Jina Kamili la Mwanafunzi' : 'Full Student Name'} <span style={{ color: 'red' }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="mf. Kelvin Massawe"
                            value={formData.studentName}
                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.92rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px', fontSize: '0.9rem' }}>
                            {lang === 'sw' ? 'Namba ya Usajili (Reg No)' : 'Registration Number'} <span style={{ color: 'red' }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="mf. IMC/BBA/2023/0482"
                            value={formData.regNo}
                            onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.92rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px', fontSize: '0.9rem' }}>
                            {lang === 'sw' ? 'Chuo Kikuu (University)' : 'University'} <span style={{ color: 'red' }}>*</span>
                          </label>
                          <select
                            value={formData.university}
                            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.92rem', background: 'var(--white)' }}
                          >
                            <option value="IFM">IFM - Institute of Finance Management</option>
                            <option value="UDSM">UDSM - University of Dar es Salaam</option>
                            <option value="DIT">DIT - Dar es Salaam Institute of Technology</option>
                            <option value="CBE">CBE - College of Business Education</option>
                            <option value="TIA">TIA - Tanzania Institute of Accountancy</option>
                            <option value="MUHAS">MUHAS - Muhimbili University</option>
                            <option value="ARDHI">ARDHI - Ardhi University</option>
                            <option value="SAUT">SAUT - St. Augustine University</option>
                            <option value="MZUMBE">MZUMBE - Mzumbe University</option>
                            <option value="SUA">SUA - Sokoine University of Agriculture</option>
                            <option value="UDOM">UDOM - University of Dodoma</option>
                            <option value="OUT">OUT - Open University of Tanzania</option>
                            <option value="NIT">NIT - National Institute of Transport</option>
                            <option value="MUST">MUST - Mbeya University</option>
                            <option value="LGTI">LGTI - Local Government Training Inst.</option>
                            <option value="IAA">IAA - Institute of Accountancy Arusha</option>
                            <option value="MoCU">MoCU - Moshi Co-operative University</option>
                            <option value="IRDP">IRDP - Institute of Rural Dev Planning</option>
                            <option value="Other">Chuo Kingine cha Tanzania</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px', fontSize: '0.9rem' }}>
                            {lang === 'sw' ? 'Namba ya WhatsApp / Simu' : 'WhatsApp Phone Number'} <span style={{ color: 'red' }}>*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="mf. 0613 328 915"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.92rem' }}
                          />
                        </div>
                      </div>

                      {/* Submit Order Button */}
                      <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                          type="submit"
                          className="btn btn-gold glow-effect"
                          style={{ padding: '16px 36px', fontSize: '1.08rem', width: '100%', maxWidth: '520px' }}
                        >
                          🚀 {lang === 'sw' ? 'WASILISHA ODA NA LIPAKUPITIA LIPA NAMBA 5409138' : 'SUBMIT ORDER & PAY VIA LIPA NAMBA 5409138'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* VIEW 2: TITLES CATALOG LIST */}
                {step3SubTab === 'catalog' && (
                  <div>
                    {/* Active Filter Breadcrumb Navigation Bar */}
                    <div style={{ background: 'var(--neutral-bg)', padding: '14px 20px', borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-navy)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>📍 {lang === 'sw' ? 'Kitivo:' : 'Faculty:'} <strong>{selectedFaculty ? (lang === 'sw' ? selectedFaculty.nameSw : selectedFaculty.nameEn) : (lang === 'sw' ? 'Vyuo Vyote' : 'All Faculties')}</strong></span>
                    {selectedCourse && (
                      <span>➔ {lang === 'sw' ? 'Kozi:' : 'Course:'} <strong style={{ color: 'var(--accent-gold)' }}>{lang === 'sw' ? selectedCourse.nameSw : selectedCourse.nameEn} ({selectedCourse.code})</strong></span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedFaculty && (
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        style={{ background: 'var(--white)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: 'var(--primary-navy)' }}
                      >
                        ← {lang === 'sw' ? 'Badili Kozi' : 'Change Course'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFaculty(null);
                        setSelectedCourse(null);
                        setActiveStep(1);
                      }}
                      style={{ background: 'var(--white)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: 'var(--primary-navy)' }}
                    >
                      ← {lang === 'sw' ? 'Anza Upya' : 'Restart Filter'}
                    </button>
                  </div>
                </div>
                {/* Clean Filter Header with Layout Switcher */}
                <div className="filter-bar" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div className="search-input-wrapper" style={{ flex: 1, minWidth: '260px' }}>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  
                  <div className="filters-right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">{t.filterAllYears}</option>
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="AZ">{t.sortAZ}</option>
                      <option value="ZA">{t.sortZA}</option>
                    </select>

                    {/* Layout View Mode Switcher Buttons */}
                    <div style={{ display: 'flex', background: 'var(--neutral-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => setViewLayout('list')}
                        title="Orodha iliyopangwa (List View)"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: viewLayout === 'list' ? 'var(--primary-navy)' : 'transparent',
                          color: viewLayout === 'list' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        <span>{lang === 'sw' ? 'Orodha' : 'List'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewLayout('grid')}
                        title="Kadi (Grid View)"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: viewLayout === 'grid' ? 'var(--primary-navy)' : 'transparent',
                          color: viewLayout === 'grid' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>{lang === 'sw' ? 'Kadi' : 'Grid'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Summary Header */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {lang === 'sw' ? `Zimepatikana Mada ${wizardTitles.length} kwa Kozi hii:` : `Found ${wizardTitles.length} Research Titles for this course:`}
                  </span>
                </div>

                {wizardTitles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <h3>{t.noTitlesFound}</h3>
                  </div>
                ) : viewLayout === 'list' ? (
                  /* WELL ARRANGED PROFESSIONAL LIST VIEW */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {wizardTitles.map((item, index) => {
                      const isSelected = cart.some((c) => c.id === item.id);
                      const crsInfo = getCourseDetails(item.courseId);
                      const uniLogo = uniLogoMap[item.universityTag];

                      return (
                        <div
                          key={item.id}
                          style={{
                            background: isSelected ? 'rgba(245, 166, 35, 0.04)' : 'var(--white)',
                            border: isSelected ? '2px solid var(--accent-gold)' : '1.5px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              {/* Number Badge */}
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--neutral-bg)', padding: '3px 9px', borderRadius: '12px' }}>
                                #{index + 1}
                              </span>

                              {/* University Tag Badge */}
                              {item.universityTag && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-navy)', color: '#fff', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '16px' }}>
                                  {uniLogo && <img src={uniLogo} alt="Uni Logo" style={{ width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover' }} />}
                                  {item.universityTag}
                                </span>
                              )}

                              {/* Course Code Tag */}
                              <span style={{ background: 'rgba(18, 57, 95, 0.08)', color: 'var(--primary-navy)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '16px' }}>
                                {crsInfo.code}
                              </span>

                              {/* Year Tag */}
                              <span className="year-pill" style={{ padding: '3px 9px', fontSize: '0.75rem' }}>{item.year}</span>
                            </div>

                            {/* Status Pill */}
                            <span className={`status-pill ${isSelected ? 'selected' : item.status}`}>
                              ● {isSelected ? t.statusSelected : item.status === 'available' ? t.statusAvailable : t.statusApproved}
                            </span>
                          </div>

                          {/* Main Title text */}
                          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', margin: 0, lineHeight: 1.4, fontWeight: 700 }}>
                            {item.title}
                          </h3>

                          {/* Abstract snippet */}
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                            {item.abstract}
                          </p>

                          {/* Actions Footer Bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(18, 57, 95, 0.07)', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {crsInfo.courseName}
                            </span>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onViewDetail) onViewDetail(item);
                                  else setPreviewTitle(item);
                                }}
                                className="btn-muhtasari-action"
                                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                <span>{lang === 'sw' ? 'Tazama Muhtasari' : 'View Abstract'}</span>
                              </button>
                              {item.status === 'available' && (
                                <button
                                  type="button"
                                  onClick={() => toggleCartSelection(item)}
                                  className={`btn-select-action ${isSelected ? 'selected' : ''}`}
                                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                >
                                  {isSelected
                                    ? (lang === 'sw' ? '✓ Imechaguliwa' : '✓ Selected')
                                    : (lang === 'sw' ? '+ Teua Mada Hii' : '+ Select Title')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* GRID VIEW */
                  <div className="titles-grid">
                    {wizardTitles.map((item) => {
                      const isSelected = cart.some((c) => c.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`title-card status-${item.status} ${isSelected ? 'status-selected' : ''}`}
                        >
                          <div className="title-card-header">
                            <div className="title-card-badges">
                              <span className={`status-pill ${isSelected ? 'selected' : item.status}`}>
                                ● {isSelected ? t.statusSelected : item.status === 'available' ? t.statusAvailable : t.statusApproved}
                              </span>
                              <span className="year-pill">{item.year}</span>
                            </div>
                          </div>
                          <h3 className="title-text">{item.title}</h3>
                          <p className="title-abstract">{item.abstract}</p>
                          <div className="tile-actions-row">
                            <button
                              type="button"
                              onClick={() => {
                                if (onViewDetail) onViewDetail(item);
                                else setPreviewTitle(item);
                              }}
                              className="btn-muhtasari-action"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              <span>{lang === 'sw' ? 'Tazama Muhtasari' : 'View Abstract'}</span>
                            </button>
                            {item.status === 'available' && (
                              <button
                                type="button"
                                onClick={() => toggleCartSelection(item)}
                                className={`btn-select-action ${isSelected ? 'selected' : ''}`}
                              >
                                {isSelected
                                  ? (lang === 'sw' ? '✓ Imechaguliwa' : '✓ Selected')
                                  : (lang === 'sw' ? '+ Teua Mada' : '+ Select Title')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )}

        {/* MODE 2: INSTANT ALL TITLES CATALOG SEARCH MODE */}
        {pageMode === 'catalog' && (
          <div className="titles-container">
            {/* Filter Bar with University Filter Chips */}
            <div style={{ marginBottom: '24px' }}>
              <div className="filter-bar" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
                  <input
                    type="text"
                    placeholder={lang === 'sw' ? 'Tafuta mada yoyote kwa jina au maelezo...' : 'Search any title by name or keyword...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filters-right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={selectedUniversityFilter}
                    onChange={(e) => setSelectedUniversityFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">{lang === 'sw' ? 'Vyuo Vyote (All Universities)' : 'All Universities'}</option>
                    {universitiesList.filter(u => u !== 'ALL').map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">{t.filterAllYears}</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>

                  {/* Layout View Switcher */}
                  <div style={{ display: 'flex', background: 'var(--neutral-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setViewLayout('list')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: viewLayout === 'list' ? 'var(--primary-navy)' : 'transparent',
                        color: viewLayout === 'list' ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'sw' ? 'Orodha' : 'List'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewLayout('grid')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: viewLayout === 'grid' ? 'var(--primary-navy)' : 'transparent',
                        color: viewLayout === 'grid' ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {lang === 'sw' ? 'Kadi' : 'Grid'}
                    </button>
                  </div>
                </div>
              </div>

              {/* University Quick Filters Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{lang === 'sw' ? 'Vyuo:' : 'Universities:'}</span>
                {universitiesList.map((uni) => (
                  <button
                    key={uni}
                    type="button"
                    onClick={() => setSelectedUniversityFilter(uni.toLowerCase())}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid var(--border-color)',
                      background: (selectedUniversityFilter === uni.toLowerCase() || (uni === 'ALL' && selectedUniversityFilter === 'all')) ? 'var(--primary-navy)' : 'var(--white)',
                      color: (selectedUniversityFilter === uni.toLowerCase() || (uni === 'ALL' && selectedUniversityFilter === 'all')) ? '#fff' : 'var(--primary-navy)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {uni}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Summary */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {lang === 'sw' ? `Zimepatikana Mada ${allFilteredTitles.length} katika Katalogi Yote:` : `Found ${allFilteredTitles.length} Research Titles in Master Catalog:`}
              </span>
            </div>

            {allFilteredTitles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <h3>{t.noTitlesFound}</h3>
              </div>
            ) : viewLayout === 'list' ? (
              /* WELL ARRANGED LIST VIEW FOR CATALOG */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {allFilteredTitles.map((item, index) => {
                  const isSelected = cart.some((c) => c.id === item.id);
                  const crsInfo = getCourseDetails(item.courseId);
                  const uniLogo = uniLogoMap[item.universityTag];

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: isSelected ? 'rgba(245, 166, 35, 0.04)' : 'var(--white)',
                        border: isSelected ? '2px solid var(--accent-gold)' : '1.5px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--neutral-bg)', padding: '3px 9px', borderRadius: '12px' }}>
                            #{index + 1}
                          </span>

                          {item.universityTag && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-navy)', color: '#fff', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '16px' }}>
                              {uniLogo && <img src={uniLogo} alt="Uni Logo" style={{ width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover' }} />}
                              {item.universityTag}
                            </span>
                          )}

                          <span style={{ background: 'rgba(18, 57, 95, 0.08)', color: 'var(--primary-navy)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '16px' }}>
                            {crsInfo.code}
                          </span>

                          <span className="year-pill" style={{ padding: '3px 9px', fontSize: '0.75rem' }}>{item.year}</span>
                        </div>

                        <span className={`status-pill ${isSelected ? 'selected' : item.status}`}>
                          ● {isSelected ? t.statusSelected : item.status === 'available' ? t.statusAvailable : t.statusApproved}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', margin: 0, lineHeight: 1.4, fontWeight: 700 }}>
                        {item.title}
                      </h3>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
                        {item.abstract}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(18, 57, 95, 0.07)', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {crsInfo.courseName} • {crsInfo.facultyName}
                        </span>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewDetail) onViewDetail(item);
                              else setPreviewTitle(item);
                            }}
                            className="btn-muhtasari-action"
                            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <span>{lang === 'sw' ? 'Tazama Muhtasari' : 'View Abstract'}</span>
                          </button>
                          {item.status === 'available' && (
                            <button
                              type="button"
                              onClick={() => toggleCartSelection(item)}
                              className={`btn-select-action ${isSelected ? 'selected' : ''}`}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              {isSelected
                                ? (lang === 'sw' ? '✓ Imechaguliwa' : '✓ Selected')
                                : (lang === 'sw' ? '+ Teua Mada Hii' : '+ Select Title')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GRID VIEW FOR CATALOG */
              <div className="titles-grid">
                {allFilteredTitles.map((item) => {
                  const isSelected = cart.some((c) => c.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`title-card status-${item.status} ${isSelected ? 'status-selected' : ''}`}
                    >
                      <div className="title-card-header">
                        <div className="title-card-badges">
                          <span className={`status-pill ${isSelected ? 'selected' : item.status}`}>
                            ● {isSelected ? t.statusSelected : item.status === 'available' ? t.statusAvailable : t.statusApproved}
                          </span>
                          <span className="year-pill">{item.year}</span>
                        </div>
                      </div>
                      <h3 className="title-text">{item.title}</h3>
                      <p className="title-abstract">{item.abstract}</p>
                      <div className="tile-actions-row">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewDetail) onViewDetail(item);
                            else setPreviewTitle(item);
                          }}
                          className="btn-muhtasari-action"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          <span>{lang === 'sw' ? 'Tazama Muhtasari' : 'View Abstract'}</span>
                        </button>
                        {item.status === 'available' && (
                          <button
                            type="button"
                            onClick={() => toggleCartSelection(item)}
                            className={`btn-select-action ${isSelected ? 'selected' : ''}`}
                          >
                            {isSelected
                              ? (lang === 'sw' ? '✓ Imechaguliwa' : '✓ Selected')
                              : (lang === 'sw' ? '+ Teua Mada' : '+ Select Title')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODE 3: LIVE ORDER TRACKING SYSTEM */}
        {pageMode === 'track' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div
              style={{
                background: 'var(--white)',
                padding: '36px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(245, 166, 35, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    color: 'var(--accent-gold)'
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  {lang === 'sw' ? 'Fuatilia Hali ya Oda Yako' : 'Track Your Report Order Status'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>
                  {lang === 'sw'
                    ? 'Weka Namba yako ya Usajili (Registration Number) au Namba ya Oda uliyoingiza wakati wa kuagiza.'
                    : 'Enter your Registration Number or Order ID to view real-time preparation status.'}
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} style={{ marginBottom: '32px' }}>
                <div className="search-input-wrapper" style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Mf. IMC/BBA/2023/0482 au RS-58291"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    className="search-input"
                    style={{ padding: '16px 20px 16px 52px', fontSize: '1.05rem' }}
                  />
                </div>
                <button type="submit" className="cart-action-btn" style={{ padding: '14px', fontSize: '1rem' }}>
                  {lang === 'sw' ? '🔍 Tafuta Hali ya Oda' : '🔍 Track Order Status'}
                </button>
              </form>

              {/* Sample Query Hint */}
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                💡 Jaribu mfano wa usajili: <strong style={{ color: 'var(--primary-navy)', cursor: 'pointer' }} onClick={() => setTrackQuery('IMC/BBA/2023/0482')}>IMC/BBA/2023/0482</strong>
              </div>

              {/* TRACKING RESULT DISPLAY */}
              {trackResult && (
                <div
                  style={{
                    background: 'var(--neutral-bg)',
                    border: '1.5px solid var(--accent-gold)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px',
                    marginTop: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>NAMBA YA ODA:</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--primary-navy)' }}>{trackResult.orderId}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>MUDA WA KUWASILISHWA:</span>
                      <strong style={{ color: 'var(--success-green)', fontSize: '0.95rem' }}>⏱️ {trackResult.estimatedDelivery}</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px', background: 'var(--white)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
                      <div><strong>Mwanafunzi:</strong> {trackResult.studentName}</div>
                      <div><strong>Reg No:</strong> {trackResult.regNo}</div>
                      <div><strong>Chuo:</strong> {trackResult.university}</div>
                      <div><strong>Aina ya Ripoti:</strong> {trackResult.reportType}</div>
                    </div>
                  </div>

                  {/* 5-STEP TRACKING TIMELINE */}
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--primary-navy)', marginBottom: '16px' }}>
                      Mchakato wa Maandalizi ya Ripoti Yako:
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>✓</span>
                        <div style={{ fontSize: '0.9rem' }}><strong>1. Oda Imepokelewa</strong> — Maombi yako yameingizwa kwenye mfumo.</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>✓</span>
                        <div style={{ fontSize: '0.9rem' }}><strong>2. Malipo Yamethibitishwa</strong> — Risiti ya Lipa 5409138 imethibitishwa.</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-gold)', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>⚙️</span>
                        <div style={{ fontSize: '0.9rem', color: 'var(--primary-navy)', fontWeight: 700 }}><strong>3. Utafiti & Uandishi (In Progress)</strong> — Mtaalamu wa taaluma anaandaa sura za ripoti.</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ccc', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>4</span>
                        <div style={{ fontSize: '0.9rem' }}><strong>4. Ukaguzi wa Plagiarism & Formatting</strong> — Ukaguzi rasmi wa miongozo ya chuo.</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ccc', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>5</span>
                        <div style={{ fontSize: '0.9rem' }}><strong>5. Uwasilishaji Kamili</strong> — Tuma kwa WhatsApp +255 613 328 915 & Email.</div>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/255613328915?text=Habari%20Report%20Safi!%20Naomba%20kufuatilia%20oda%20yangu%20namba%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card-action-btn wa"
                    style={{ textAlign: 'center', marginTop: '16px' }}
                  >
                    Wasiliana na Support kwa WhatsApp Direct →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

      {/* REPORT ABSTRACT & TABLE OF CONTENTS PREVIEW MODAL */}
      {previewTitle && (
        <div className="modal-overlay" onClick={() => setPreviewTitle(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '650px', padding: '32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="year-pill" style={{ marginBottom: '8px', display: 'inline-block' }}>{previewTitle.year}</span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', lineHeight: 1.35 }}>{previewTitle.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTitle(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px', background: 'var(--neutral-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>📌 Executive Abstract / Muhtasari wa Utafiti:</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{previewTitle.abstract}</p>
            </div>

            {/* Table of Contents Sample */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-navy)', marginBottom: '10px' }}>📑 Muundo wa Sura Zilizopo (Table of Contents):</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <li><strong>Sura ya 1:</strong> Utangulizi & Malengo ya Utafiti (Introduction & Objectives)</li>
                <li><strong>Sura ya 2:</strong> Mapitio ya Taaluma na Nadharia (Literature Review)</li>
                <li><strong>Sura ya 3:</strong> Mbinu za Utafiti & Ukusanyaji wa Data (Research Methodology)</li>
                <li><strong>Sura ya 4:</strong> Uchambuzi wa Data & Matokeo (Data Analysis & Findings)</li>
                <li><strong>Sura ya 5:</strong> Muhtasari, Hitimisho na Mapendekezo (Conclusion & Recommendations)</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  toggleCartSelection(previewTitle);
                  setPreviewTitle(null);
                }}
                className="cart-action-btn"
                style={{ flex: 1 }}
              >
                {cart.some((c) => c.id === previewTitle.id) ? '✓ Ondoa kwenye Kapu' : '+ Teua Mada Hii Hapa'}
              </button>
              
              <button
                type="button"
                onClick={() => setPreviewTitle(null)}
                className="btn-secondary"
                style={{ padding: '12px 20px' }}
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUBMITTED CONFIRMATION MODAL */}
      {orderSubmittedSuccess && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="modal-content card-modern animate-fade-in" style={{ maxWidth: '540px', padding: '36px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.12)', color: '#2ec4b6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2.2rem', fontWeight: 900 }}>
              ✓
            </div>
            
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '8px' }}>
              {lang === 'sw' ? 'Oda Yako Imepokelewa Rasmi!' : 'Order Received Successfully!'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
              {lang === 'sw' ? `Kumbukumbu ya Oda Yako: ` : `Your Order Reference ID: `}
              <strong style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>{orderSubmittedSuccess.orderId}</strong>
            </p>

            <div style={{ background: 'var(--neutral-bg)', padding: '20px', borderRadius: '14px', marginBottom: '24px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mwanafunzi:</span>
                <strong>{orderSubmittedSuccess.studentName} ({orderSubmittedSuccess.regNo})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chuo Kikuu:</span>
                <strong>{orderSubmittedSuccess.university}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gharama ya Oda:</span>
                <strong style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>{orderSubmittedSuccess.amount}</strong>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--primary-navy)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px', fontWeight: 700 }}>
                <strong>Lipa Namba ya Malipo:</strong> 5409138 (REPORT SAFI SERVICES)
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={`https://wa.me/255613328915?text=${encodeURIComponent(
                  `Habari REPORT SAFI, nimekamilisha kuagiza ripoti ya ${orderSubmittedSuccess.courseName} (Oda: ${orderSubmittedSuccess.orderId}). Reg: ${orderSubmittedSuccess.regNo}, Chuo: ${orderSubmittedSuccess.university}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{ padding: '14px 24px', textDecoration: 'none', fontWeight: 800, textAlign: 'center' }}
              >
                📱 Tuma Stakabadhi / Wasiliana WhatsApp (+255 613 328 915)
              </a>
              <button
                type="button"
                onClick={() => setOrderSubmittedSuccess(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Funga Dirisha Hili
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
