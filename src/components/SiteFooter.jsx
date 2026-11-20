import { Link } from '../lib/router';
import { BrandMark, IconMail, IconClock, IconPhone } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';

export default function SiteFooter() {
  const { contact } = useSiteContent();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand">
              <BrandMark size={40} />
              <span className="brand-text">
                <strong>Report Safi</strong>
                <span>Title Selection Portal</span>
              </span>
            </div>
            <p>
              A fair, simple way for every student to reserve one unique research or project title,
              with a dated record of who selected what.
            </p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/features">Features</Link>
              </li>
              <li>
                <Link to="/catalogue">Catalogue</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>
                <Link to="/help">Help centre</Link>
              </li>
              <li>
                <Link to="/reference">Check a reference</Link>
              </li>
              <li>
                <Link to="/security">Security &amp; audit</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>
                <IconMail size={15} />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <IconPhone size={15} />
                <a href={contact.phoneHref}>{contact.phone}</a>
              </li>
              <li>
                <IconClock size={15} />
                <span>{contact.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <span>© {new Date().getFullYear()} Report Safi. All rights reserved.</span>
            <span>Research Title Selection Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
