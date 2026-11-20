import { useEffect, useState } from 'react';
import { Link } from '../../lib/router';
import { cls } from '../../lib/utils';
import {
  BrandMark,
  IconGauge,
  IconFolder,
  IconFileText,
  IconUsers,
  IconUserCheck,
  IconShoppingBag,
  IconSliders,
  IconHistory,
  IconPower,
  IconArrowLeft,
  IconMenu,
  IconX,
} from '../../ui/Icons';

const MANAGE_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGauge },
  { to: '/orders', label: 'Orders', icon: IconShoppingBag },
  { to: '/selections', label: 'Selections', icon: IconUsers },
  { to: '/students', label: 'Students', icon: IconUserCheck },
  { to: '/programmes', label: 'Programmes', icon: IconFolder },
  { to: '/titles', label: 'Title catalogue', icon: IconFileText },
];

const SYSTEM_NAV = [
  { to: '/settings', label: 'Site & pricing', icon: IconSliders },
  { to: '/audit', label: 'Audit log', icon: IconHistory },
];

const ALL_NAV = [...MANAGE_NAV, ...SYSTEM_NAV];

export default function AdminShell({ path, title, crumb, admin, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  // Close on Escape and lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const initials = admin.name
    .replace(/^(Dr\.|Prof\.)\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="admin-shell">
      {menuOpen && (
        <div
          className="admin-backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={cls('admin-side', menuOpen && 'is-open')} aria-label="Workspace sidebar">
        <div className="admin-brand">
          <BrandMark size={34} />
          <span className="brand-text">
            <strong>Report Safi</strong>
            <span>Admin workspace</span>
          </span>
          <button
            type="button"
            className="admin-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <IconX size={18} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Administration">
          <div className="admin-nav-label">Manage</div>
          {MANAGE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cls('admin-nav-item', path === item.to && 'is-active')}
              onClick={() => setMenuOpen(false)}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}

          <div className="admin-nav-label">System</div>
          {SYSTEM_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cls('admin-nav-item', path === item.to && 'is-active')}
              onClick={() => setMenuOpen(false)}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}

          <div className="admin-nav-label">Portal</div>
          <a href="/" className="admin-nav-item">
            <IconArrowLeft size={17} />
            Student portal
          </a>
        </nav>

        <div className="admin-nav-foot">
          <button
            type="button"
            className="admin-nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={onLogout}
          >
            <IconPower size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div className="admin-top-left">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <IconMenu size={19} />
            </button>
            <div className="admin-top-title">
              <div className="crumb">{crumb}</div>
              <h1>{title}</h1>
            </div>
          </div>

          <div className="admin-user">
            <div className="identity-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="admin-user-meta">
              <strong>{admin.name}</strong>
              <span>{admin.role}</span>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onLogout}
              aria-label="Sign out"
              title="Sign out"
            >
              <IconPower size={16} />
            </button>
          </div>
        </header>

        <nav className="admin-mobile-tabs" aria-label="Quick admin sections">
          {ALL_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cls('admin-mobile-tab', path === item.to && 'is-active')}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <main className="admin-content" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
