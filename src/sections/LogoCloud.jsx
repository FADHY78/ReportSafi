import { IconGraduation } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';

/**
 * "Trusted by" strip — text marks rather than logo images, set in mono so it
 * reads like an institutional letterhead instead of a stock-photo band.
 * The names come from the editable `site_content.institutions` row.
 */
export default function LogoCloud() {
  const { institutions } = useSiteContent();
  const { t } = useLanguage();

  return (
    <section className="logo-cloud" aria-label="Institutions whose students use Report Safi">
      <div className="container">
        <p className="logo-cloud-label">
          <IconGraduation size={15} />
          {t('logo_label', 'Wanafunzi kutoka vyuo vikuu na taasisi za Dar es Salaam na Tanzania nzima')}
        </p>
        <ul className="logo-cloud-list">
          {institutions.map((name) => (
            <li key={name} className="logo-cloud-item">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
