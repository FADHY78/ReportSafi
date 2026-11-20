import React, { useState } from 'react';
import PageHero from './PageHero';

export default function AdminDashboard({
  faculties,
  courses,
  titles,
  orders,
  onAddTitle,
  onEditTitle,
  onDeleteTitle,
  onApproveOrder,
  onDeleteOrder,
  onAddFaculty,
  onAddCourse,
  lang,
  t
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [activeTab, setActiveTab] = useState('titles'); // titles, courses, orders
  
  // Title Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit
  const [editingTitleId, setEditingTitleId] = useState(null);
  
  const [inputTitle, setInputTitle] = useState('');
  const [inputCourseId, setInputCourseId] = useState('');
  const [inputYear, setInputYear] = useState('');
  const [inputAbstract, setInputAbstract] = useState('');
  const [inputStatus, setInputStatus] = useState('available');

  // Faculty Modal state
  const [isFacModalOpen, setIsFacModalOpen] = useState(false);
  const [inputFacNameSw, setInputFacNameSw] = useState('');
  const [inputFacNameEn, setInputFacNameEn] = useState('');

  // Course Modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [inputCourseFacId, setInputCourseFacId] = useState('');
  const [inputCourseNameSw, setInputCourseNameSw] = useState('');
  const [inputCourseNameEn, setInputCourseNameEn] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError(t.adminIncorrectPass);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleOpenAddTitle = () => {
    setModalMode('add');
    setEditingTitleId(null);
    setInputTitle('');
    setInputCourseId(courses[0]?.id || '');
    setInputYear('2025/2026');
    setInputAbstract('');
    setInputStatus('available');
    setIsModalOpen(true);
  };

  const handleOpenEditTitle = (title) => {
    setModalMode('edit');
    setEditingTitleId(title.id);
    setInputTitle(title.title);
    setInputCourseId(title.courseId);
    setInputYear(title.year);
    setInputAbstract(title.abstract);
    setInputStatus(title.status);
    setIsModalOpen(true);
  };

  const handleSaveTitle = (e) => {
    e.preventDefault();
    if (!inputTitle || !inputCourseId || !inputYear || !inputAbstract) {
      alert('Jaza taarifa zote!');
      return;
    }

    if (modalMode === 'add') {
      onAddTitle({
        title: inputTitle,
        courseId: inputCourseId,
        year: inputYear,
        abstract: inputAbstract,
        status: inputStatus
      });
    } else {
      onEditTitle({
        id: editingTitleId,
        title: inputTitle,
        courseId: inputCourseId,
        year: inputYear,
        abstract: inputAbstract,
        status: inputStatus
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm(t.adminDeleteConfirm)) {
      onDeleteTitle(id);
    }
  };

  const handleSaveFaculty = (e) => {
    e.preventDefault();
    if (!inputFacNameSw || !inputFacNameEn) return;
    onAddFaculty({
      nameSw: inputFacNameSw,
      nameEn: inputFacNameEn
    });
    setInputFacNameSw('');
    setInputFacNameEn('');
    setIsFacModalOpen(false);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!inputCourseFacId || !inputCourseNameSw || !inputCourseNameEn) return;
    onAddCourse({
      facultyId: inputCourseFacId,
      nameSw: inputCourseNameSw,
      nameEn: inputCourseNameEn
    });
    setInputCourseNameSw('');
    setInputCourseNameEn('');
    setIsCourseModalOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <h2>{t.adminTitle}</h2>
        <p>{t.adminEnterPass}</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </div>
          {passwordError && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 'bold' }}>
              {passwordError}
            </p>
          )}
          <button type="submit" className="cart-action-btn">
            {t.adminLoginBtn}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        badge={lang === 'sw' ? 'MFUMO WA USIMAMIZI WA ADMIN' : 'ADMIN MANAGEMENT SYSTEM'}
        title={t.adminTitle}
        subtitle={t.adminSubtitle}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        }
        chips={[
          lang === 'sw' ? 'Usimamizi wa Maombi' : 'Orders Management',
          lang === 'sw' ? 'Mada za Vyuo Vikuu' : 'University Titles',
          lang === 'sw' ? 'Fakulti & Kozi' : 'Faculties & Courses'
        ]}
      />

      <div className="admin-container" style={{ marginTop: '30px' }}>
        <div className="admin-header-row">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)' }}>Dhibiti Mfumo Wako</h3>
          </div>
          <button onClick={handleLogout} className="btn-delete" style={{ padding: '8px 16px', borderRadius: '4px' }}>
            {t.adminLogoutBtn}
          </button>
        </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('titles')}
          className={`admin-tab-btn ${activeTab === 'titles' ? 'active' : ''}`}
        >
          {t.adminTabTitles}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`admin-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
        >
          {t.adminTabCourses}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          {t.adminTabOrders} ({orders.length})
        </button>
      </div>

      {/* TAB 1: Manage Titles */}
      {activeTab === 'titles' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={handleOpenAddTitle} className="btn-admin-action">
              + {t.adminAddTitleBtn}
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{lang === 'sw' ? 'Mada' : 'Title'}</th>
                  <th>{lang === 'sw' ? 'Kozi' : 'Course'}</th>
                  <th>{lang === 'sw' ? 'Mwaka' : 'Year'}</th>
                  <th>{lang === 'sw' ? 'Hali' : 'Status'}</th>
                  <th>{lang === 'sw' ? 'Vitendo' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((title) => {
                  const course = courses.find((c) => c.id === title.courseId);
                  return (
                    <tr key={title.id}>
                      <td style={{ fontWeight: 600, maxWidth: '400px' }}>{title.title}</td>
                      <td>{course ? (lang === 'sw' ? course.nameSw : course.nameEn) : title.courseId}</td>
                      <td>{title.year}</td>
                      <td>
                        <span className={`status-pill ${title.status}`}>
                          {title.status === 'available' ? t.statusAvailable :
                           title.status === 'selected' ? t.statusSelected : t.statusTaken}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button onClick={() => handleOpenEditTitle(title)} className="btn-edit">
                            {lang === 'sw' ? 'Hariri' : 'Edit'}
                          </button>
                          <button onClick={() => handleDeleteClick(title.id)} className="btn-delete">
                            {lang === 'sw' ? 'Futa' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Manage Courses & Faculties */}
      {activeTab === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Faculties Management */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{t.facultiesTitle}</h3>
              <button onClick={() => setIsFacModalOpen(true)} className="btn-admin-action">
                + {t.adminAddFacultyBtn}
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Jina (Swahili)</th>
                    <th>Name (English)</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map((fac) => (
                    <tr key={fac.id}>
                      <td><code>{fac.id}</code></td>
                      <td>{fac.nameSw}</td>
                      <td>{fac.nameEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Courses Management */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{t.coursesTitle}</h3>
              <button onClick={() => {
                setInputCourseFacId(faculties[0]?.id || '');
                setIsCourseModalOpen(true);
              }} className="btn-admin-action">
                + {t.adminAddCourseBtn}
              </button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kitivo (Faculty)</th>
                    <th>Kozi (Course Sw)</th>
                    <th>Course (En)</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const fac = faculties.find((f) => f.id === course.facultyId);
                    return (
                      <tr key={course.id}>
                        <td>{fac ? fac.nameEn : course.facultyId}</td>
                        <td style={{ fontWeight: 600 }}>{course.nameSw}</td>
                        <td>{course.nameEn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Track Orders */}
      {activeTab === 'orders' && (
        <div>
          <h3>{t.adminOrdersHeader}</h3>
          <div className="admin-table-wrapper" style={{ marginTop: '20px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t.orderId}</th>
                  <th>{t.orderStudent}</th>
                  <th>{t.orderDetails}</th>
                  <th>Total</th>
                  <th>Muamala (TxID)</th>
                  <th>{t.orderStatus}</th>
                  <th>Vitendo</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td><code>{order.id.substring(0, 8)}</code></td>
                      <td>
                        <strong>{order.name}</strong><br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Chuo: {order.university} | Reg: {order.regNo}<br />
                          WhatsApp: {order.phone}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        {order.customDetails ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <span className="status-badge pending" style={{ marginBottom: '4px' }}>CUSTOM FIELD</span><br />
                            <strong>Org:</strong> {order.customDetails.orgName}<br />
                            <strong>Dept:</strong> {order.customDetails.deptName}<br />
                            <strong>Muda:</strong> {order.customDetails.duration} ({order.customDetails.academicYear})
                          </div>
                        ) : (
                          <ul style={{ paddingLeft: '16px', fontSize: '0.85rem' }}>
                            {order.items.map((item, idx) => (
                              <li key={idx}>{item.title}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>TZS {order.totalPrice.toLocaleString()}/=</td>
                      <td><code>{order.txId}</code></td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status === 'approved' ? t.badgeApproved : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          {order.status === 'pending' && (
                            <button onClick={() => onApproveOrder(order)} className="btn-edit" style={{ background: 'rgba(47, 168, 79, 0.1)', color: 'var(--success-green)' }}>
                              {t.orderActionApprove}
                            </button>
                          )}
                          <button onClick={() => onDeleteOrder(order.id)} className="btn-delete">
                            {lang === 'sw' ? 'Futa' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Hakuna orders zilizowasilishwa bado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TITLE ADD/EDIT POPUP MODAL */}
      {isModalOpen && (
        <div className="modal-wrapper" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? t.adminAddTitleHeader : t.adminEditTitleHeader}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveTitle}>
                <div className="form-group">
                  <label className="form-label">{t.inputTitleName} *</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.coursesTitle} *</label>
                  <select
                    className="form-input"
                    value={inputCourseId}
                    onChange={(e) => setInputCourseId(e.target.value)}
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'sw' ? c.nameSw : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">{t.inputYear} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={inputYear}
                      onChange={(e) => setInputYear(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.inputStatus} *</label>
                    <select
                      className="form-input"
                      value={inputStatus}
                      onChange={(e) => setInputStatus(e.target.value)}
                      required
                    >
                      <option value="available">{t.statusAvailable}</option>
                      <option value="approved">{t.statusTaken}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.inputAbstract} *</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={inputAbstract}
                    onChange={(e) => setInputAbstract(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="cart-action-btn" style={{ flex: 1 }}>
                    {t.saveBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                    style={{ flex: 1, color: 'var(--text-dark)', borderColor: 'var(--border-color)' }}
                  >
                    {t.cancelBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY ADD POPUP MODAL */}
      {isFacModalOpen && (
        <div className="modal-wrapper" onClick={() => setIsFacModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{t.adminAddFacultyBtn}</h3>
              <button className="modal-close-btn" onClick={() => setIsFacModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveFaculty}>
                <div className="form-group">
                  <label className="form-label">{t.inputFacultyName} (Swahili) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inputFacNameSw}
                    onChange={(e) => setInputFacNameSw(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.inputFacultyName} (English) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inputFacNameEn}
                    onChange={(e) => setInputFacNameEn(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="cart-action-btn" style={{ marginTop: '10px' }}>
                  {t.saveBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* COURSE ADD POPUP MODAL */}
      {isCourseModalOpen && (
        <div className="modal-wrapper" onClick={() => setIsCourseModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{t.adminAddCourseBtn}</h3>
              <button className="modal-close-btn" onClick={() => setIsCourseModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveCourse}>
                <div className="form-group">
                  <label className="form-label">{t.facultiesTitle} *</label>
                  <select
                    className="form-input"
                    value={inputCourseFacId}
                    onChange={(e) => setInputCourseFacId(e.target.value)}
                    required
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {lang === 'sw' ? f.nameSw : f.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.inputCourseName} (Swahili) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inputCourseNameSw}
                    onChange={(e) => setInputCourseNameSw(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.inputCourseName} (English) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inputCourseNameEn}
                    onChange={(e) => setInputCourseNameEn(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="cart-action-btn" style={{ marginTop: '10px' }}>
                  {t.saveBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
