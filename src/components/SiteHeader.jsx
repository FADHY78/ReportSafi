import { useEffect, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { BrandMark, IconMenu, IconX, IconArrowRight } from '../ui/Icons';
import { cls } from '../lib/utils';

function NavLink({ to, path, children, onClick }) {
  const active = path === to || (to !== '/' && path.startsWith(to));
  return (
    <Link to={to} className={cls('nav-link', active && 'is-active')} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function SiteHeader({ path }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const close = () => setOpen(false);

  /* elevate the bar once the page has scrolled — the marketing-page convention */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={cls('site-header', stuck && 'is-stuck')}>
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Report Safi Title Selection — home">
            <BrandMark size={40} />
            <span className="brand-text">
              <strong>Report Safi</strong>
              <span>Title Selection Portal</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            <NavLink to="/" path={path} onClick={close}>
              Home
            </NavLink>
            <NavLink to="/features" path={path} onClick={close}>
              Features
            </NavLink>
            <NavLink to="/catalogue" path={path} onClick={close}>
              Catalogue
            </NavLink>
            <NavLink to="/pricing" path={path} onClick={close}>
              Pricing
            </NavLink>
            <NavLink to="/help" path={path} onClick={close}>
              Help
            </NavLink>
          </nav>

          <div className="header-actions">
            <Link to="/catalogue" className="btn btn-primary btn-sm">
              Start selection <IconArrowRight size={15} />
            </Link>
            <button
              className="icon-btn nav-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconX size={17} /> : <IconMenu size={17} />}
            </button>
          </div>
        </div>

        <div className={cls('mobile-nav', open && 'is-open')}>
          <Link to="/" className="nav-link" onClick={close}>
            Home
          </Link>
          <NavLink to="/features" path={path} onClick={close}>
            Features
          </NavLink>
          <NavLink to="/catalogue" path={path} onClick={close}>
            Catalogue
          </NavLink>
          <NavLink to="/pricing" path={path} onClick={close}>
            Pricing
          </NavLink>
          <Link to="/help" className="nav-link" onClick={close}>
            Help
          </Link>
          <div style={{ paddingTop: 14 }}>
            <button className="btn btn-primary btn-block" onClick={() => { close(); navigate('/catalogue'); }}>
              Start selection <IconArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
