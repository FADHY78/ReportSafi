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

export default function AdminShell({ path, title, crumb, admin, onLogout, children }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <BrandMark size={34} />
          <span className="brand-text">
            <strong>Report Safi</strong>
            <span>Admin workspace</span>
          </span>
        </div>

        <nav className="admin-nav" aria-label="Administration">
          <div className="admin-nav-label">Manage</div>
          {MANAGE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cls('admin-nav-item', path === item.to && 'is-active')}
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
          <button className="admin-nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }} onClick={onLogout}>
            <IconPower size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div>
            <div className="crumb">{crumb}</div>
            <h1>{title}</h1>
          </div>

          <div className="admin-user">
            <div className="identity-avatar" aria-hidden="true">
              {admin.name
                .replace(/^(Dr\.|Prof\.)\s*/i, '')
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <strong>{admin.name}</strong>
              <span>{admin.role}</span>
            </div>
            <button className="icon-btn" onClick={onLogout} aria-label="Sign out" title="Sign out">
              <IconPower size={16} />
            </button>
          </div>
        </header>

        <main className="admin-content" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
