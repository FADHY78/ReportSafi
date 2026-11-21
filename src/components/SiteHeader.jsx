import { useEffect, useRef, useState } from 'react';
import { Link, navigate } from '../lib/router';
import {
  BrandMark,
  IconMenu,
  IconX,
  IconArrowRight,
  IconBuilding,
  IconLayers,
  IconSearch,
  IconClipboard,
  IconInfo,
  IconMail,
} from '../ui/Icons';
import { cls } from '../lib/utils';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

function isActive(path, to) {
  return path === to || (to !== '/' && path.startsWith(to));
}

export default function SiteHeader({ path }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const { contact } = useSiteContent();
  const { t } = useLanguage();
  const toggleRef = useRef(null);
  const sheetRef = useRef(null);
  const wasOpen = useRef(false);
  const close = () => setOpen(false);

  const navItems = [
    { to: '/', label: t('nav_home', 'Mwanzo'), icon: IconBuilding },
    { to: '/features', label: t('nav_features', 'Vipengele'), icon: IconLayers },
    { to: '/catalogue', label: t('nav_catalogue', 'Mada za Utafiti'), icon: IconSearch },
    { to: '/pricing', label: t('nav_pricing', 'Bei na Vifurushi'), icon: IconClipboard },
    { to: '/help', label: t('nav_help', 'Msaada'), icon: IconInfo },
  ];

  /* elevate the bar once the page has scrolled — the marketing-page convention */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close the sheet when the route changes */
  useEffect(() => {
    close();
  }, [path]);

  /* focus the drawer when it opens, and return focus to the toggle on close */
  useEffect(() => {
    if (open) {
      sheetRef.current?.querySelector('.mobile-link')?.focus();
    } else if (wasOpen.current) {
      toggleRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  /* escape key, focus trap and background scroll lock while the drawer is open */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = sheetRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className={cls('site-header', stuck && 'is-stuck', open && 'menu-open')}>
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Report Safi Title Selection — home" onClick={close}>
            <BrandMark size={40} />
            <span className="brand-text">
              <strong>Report Safi</strong>
              <span>{t('brand_sub', 'Mfumo Rasmi wa Uchaguzi wa Mada')}</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cls('nav-link', isActive(path, to) && 'is-active')}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />
            <Link to="/catalogue" className="btn btn-primary btn-sm">
              {t('nav_start', 'Chagua Mada')} <IconArrowRight size={15} />
            </Link>
            <button
              ref={toggleRef}
              className="icon-btn nav-toggle"
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconX size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* modern mobile menu: dimmed backdrop + animated sheet */}
      <div
        className={cls('menu-backdrop', open && 'is-open')}
        onClick={close}
        aria-hidden="true"
      />

      <nav
        ref={sheetRef}
        id="mobile-menu"
        className={cls('mobile-sheet', open && 'is-open')}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className="mobile-sheet-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="eyebrow" style={{ margin: 0 }}>Menu</span>
            <LanguageSwitcher />
          </div>
          <button className="icon-btn" type="button" aria-label="Close menu" onClick={close}>
            <IconX size={18} />
          </button>
        </div>

        <ul className="mobile-links">
          {navItems.map(({ to, label, icon: Icon }, i) => (
            <li key={to} style={{ '--i': i }}>
              <Link
                to={to}
                className={cls('mobile-link', isActive(path, to) && 'is-active')}
                onClick={close}
                tabIndex={open ? 0 : -1}
              >
                <span className="mobile-link-icon"><Icon size={18} /></span>
                <span>{label}</span>
                <IconArrowRight size={16} className="mobile-link-arrow" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mobile-sheet-foot">
          <button
            className="btn btn-primary btn-block"
            type="button"
            onClick={() => {
              close();
              navigate('/catalogue');
            }}
            tabIndex={open ? 0 : -1}
          >
            {t('nav_start', 'Chagua Mada')} <IconArrowRight size={16} />
          </button>
          <a className="mobile-contact" href={`mailto:${contact.email}`} tabIndex={open ? 0 : -1}>
            <IconMail size={14} /> {contact.email}
          </a>
        </div>
      </nav>
    </>
  );
}
