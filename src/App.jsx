import { useEffect, useState, useCallback } from 'react';
import { useRoute, navigate } from './lib/router';
import { goSection } from './lib/scroll';
import { ToastProvider, useToast } from './lib/toast';
import { getSelectionForStudent, subscribe } from './lib/api';

import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import WhatsAppButton from './components/WhatsAppButton';

import Welcome from './pages/Welcome';
import Catalogue from './pages/Catalogue';
import Confirm from './pages/Confirm';
import Reference from './pages/Reference';
import Help from './pages/Help';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Security from './pages/Security';

const SESSION_KEY = 'rs_student_session';

const STUDENT_ROUTES = ['/catalogue', '/confirm'];

function readJSON(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Shell() {
  const { path } = useRoute();
  const notify = useToast();

  const [session, setSession] = useState(() => readJSON(SESSION_KEY));
  const [held, setHeld] = useState(null);
  const [tick, setTick] = useState(0);

  /* any change written by this tab or another refreshes what we display */
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  /* keep the student's active selection in sync (PRD: one title per student) */
  useEffect(() => {
    let alive = true;
    if (!session?.student?.id) {
      setHeld(null);
      return () => {};
    }
    getSelectionForStudent(session.student.id)
      .then((r) => alive && setHeld(r))
      .catch(() => alive && setHeld(null));
    return () => {
      alive = false;
    };
  }, [session?.student?.id, tick]);

  /* ------------------------------------------------------- route guards */
  useEffect(() => {
    const known = [
      '/',
      '/catalogue',
      '/confirm',
      '/reference',
      '/help',
      '/features',
      '/pricing',
      '/security',
    ];
    if (!known.includes(path)) {
      navigate('/', { replace: true });
      return;
    }
    if (STUDENT_ROUTES.includes(path) && !session) {
      notify('Identify yourself before opening the catalogue.', 'error');
      goSection('identify');
      return;
    }
  }, [path, session, notify]);

  /* ------------------------------------------------------ session mgmt */
  const onIdentified = useCallback((result) => {
    const next = { student: result.student, programme: result.programme };
    setSession(next);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      /* private mode — session stays in memory only */
    }
  }, []);

  const clearStudent = useCallback(() => {
    setSession(null);
    setHeld(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* noop */
    }
    navigate('/');
  }, []);

  const studentView = session ? { ...session, existingSelection: held } : null;

  /* ------------------------------------------------------------- router */
  let page = null;

  if (path === '/') {
    page = <Welcome session={studentView} onIdentified={onIdentified} />;
  } else if (path === '/catalogue') {
    page = <Catalogue session={studentView} onResetSession={clearStudent} />;
  } else if (path === '/confirm') {
    page = <Confirm session={studentView} />;
  } else if (path === '/reference') {
    page = <Reference />;
  } else if (path === '/help') {
    page = <Help />;
  } else if (path === '/features') {
    page = <Features />;
  } else if (path === '/pricing') {
    page = <Pricing />;
  } else if (path === '/security') {
    page = <Security />;
  } else {
    // guards are still resolving — render nothing for one frame
    page = null;
  }

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('main-content');
          if (el) {
            el.setAttribute('tabindex', '-1');
            el.focus();
          }
        }}
      >
        Skip to main content
      </a>
      <SiteHeader path={path} />
      <main id="main-content">{page}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
