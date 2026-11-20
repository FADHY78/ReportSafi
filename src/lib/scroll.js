/**
 * Section scrolling for the marketing pages.
 *
 * The site runs on a hash router (#/catalogue …), so ordinary <a href="#identify">
 * links would be parsed as routes and bounce the visitor back to the home route.
 * Navigation to a section is therefore done in JS: go home if we are not there,
 * then scroll once React has painted.
 */
import { navigate } from './router';

export function currentPath() {
  return window.location.hash.replace(/^#/, '').split('?')[0] || '/';
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function goSection(id) {
  if (currentPath() !== '/') {
    navigate('/');
    window.setTimeout(() => scrollToId(id), 180);
  } else {
    scrollToId(id);
  }
}
