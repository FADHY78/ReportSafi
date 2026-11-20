import { useEffect, useState, useCallback } from 'react';
import { useRoute, navigate } from './lib/router';

import Login from './pages/admin/Login';
import AdminShell from './pages/admin/AdminShell';
import Dashboard from './pages/admin/Dashboard';
import Programmes from './pages/admin/Programmes';
import Titles from './pages/admin/Titles';
import Selections from './pages/admin/Selections';
import Audit from './pages/admin/Audit';

const SESSION_KEY = 'rs_admin_session';

const ROUTES = ['/dashboard', '/programmes', '/titles', '/selections', '/audit'];

const META = {
  '/dashboard': { title: 'Dashboard', crumb: 'Workspace / Overview' },
  '/programmes': { title: 'Programmes', crumb: 'Workspace / Catalogue structure' },
  '/titles': { title: 'Title catalogue', crumb: 'Workspace / Titles' },
  '/selections': { title: 'Student selections', crumb: 'Workspace / Reservations' },
  '/audit': { title: 'Audit log', crumb: 'Workspace / History' },
};

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * The staff workspace has its own entry page (admin.html) and its own hash
 * route table. Nothing in the student website links into it.
 */
export default function AdminApp() {
  const { path } = useRoute();
  const [admin, setAdmin] = useState(readSession);

  useEffect(() => {
    if (!ROUTES.includes(path) && path !== '/') {
      navigate('/', { replace: true });
      return;
    }
    if (ROUTES.includes(path) && !admin) {
      navigate('/', { replace: true });
      return;
    }
    if (path === '/' && admin) {
      navigate('/dashboard', { replace: true });
    }
  }, [path, admin]);

  const onAuthed = useCallback((account) => {
    setAdmin(account);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
    } catch {
      /* private mode — session stays in memory only */
    }
  }, []);

  const onLogout = useCallback(() => {
    setAdmin(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* noop */
    }
    navigate('/', { replace: true });
  }, []);

  if (path === '/' || !admin) {
    return <Login onAuthed={onAuthed} />;
  }

  const meta = META[path] || META['/dashboard'];
  return (
    <AdminShell path={path} title={meta.title} crumb={meta.crumb} admin={admin} onLogout={onLogout}>
      {path === '/dashboard' && <Dashboard />}
      {path === '/programmes' && <Programmes admin={admin} />}
      {path === '/titles' && <Titles admin={admin} />}
      {path === '/selections' && <Selections admin={admin} />}
      {path === '/audit' && <Audit />}
    </AdminShell>
  );
}
