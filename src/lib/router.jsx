import { useEffect, useState, useCallback } from 'react';

/**
 * Tiny hash router — no dependencies, works on any static host.
 * Routes look like: #/catalogue, #/admin/titles
 */
function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return {
    path: path.startsWith('/') ? path : '/' + path,
    query: new URLSearchParams(search),
  };
}

export function useRoute() {
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    if (!window.location.hash) window.location.replace('#/');
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(to, { replace = false } = {}) {
  const hash = '#' + (to.startsWith('/') ? to : '/' + to);
  if (replace) {
    window.location.replace(window.location.pathname + window.location.search + hash);
  } else if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}

export function Link({ to, children, className, ...rest }) {
  const onClick = useCallback(
    (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to);
    },
    [to]
  );
  return (
    <a href={'#' + to} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
