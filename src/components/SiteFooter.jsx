import { Link } from '../lib/router';
import { BrandMark, IconMail, IconClock, IconPhone } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';

export default function SiteFooter() {
  const { contact } = useSiteContent();
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand">
              <BrandMark size={40} />
              <span className="brand-text">
                <strong>Report Safi</strong>
                <span>{t('brand_sub', 'Mfumo Rasmi wa Uchaguzi wa Mada')}</span>
              </span>
            </div>
            <p>
              {t(
                'footer_desc',
                'Report Safi — Mfumo rasmi wa uchaguzi wa mada za utafiti na huduma za uandishi wa kitaalamu kwa vyuo vikuu na taasisi za Tanzania.'
              )}
            </p>
          </div>

          <div className="footer-col">
            <h4>{t('nav_home', 'Mwanzo')}</h4>
            <ul>
              <li>
                <Link to="/">{t('nav_home', 'Mwanzo')}</Link>
              </li>
              <li>
                <Link to="/features">{t('nav_features', 'Vipengele')}</Link>
              </li>
              <li>
                <Link to="/catalogue">{t('nav_catalogue', 'Mada za Utafiti')}</Link>
              </li>
              <li>
                <Link to="/pricing">{t('nav_pricing', 'Bei na Vifurushi')}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('nav_help', 'Msaada')}</h4>
            <ul>
              <li>
                <Link to="/help">{t('nav_help', 'Msaada')}</Link>
              </li>
              <li>
                <Link to="/reference">{t('ref_lookup_eyebrow', 'Angalia Kumbukumbu')}</Link>
              </li>
              <li>
                <Link to="/security">Usalama &amp; Ukaguzi</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>Wasiliana Nasi</h4>
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
            <span>© {new Date().getFullYear()} Report Safi. {t('footer_rights', 'Haki zote zimehifadhiwa.')}</span>
            <span>{t('brand_sub', 'Mfumo Rasmi wa Uchaguzi wa Mada za Utafiti')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
