import { IconGraduation } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';

/**
 * "Trusted by" strip — text marks rather than logo images, set in mono so it
 * reads like an institutional letterhead instead of a stock-photo band.
 * The names come from the editable `site_content.institutions` row.
 */
export default function LogoCloud() {
  const { institutions } = useSiteContent();

  return (
    <section className="logo-cloud" aria-label="Institutions whose students use Report Safi">
      <div className="container">
        <p className="logo-cloud-label">
          <IconGraduation size={15} />
          Students from colleges and universities across Tanzania
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
