import { IconGraduation } from '../ui/Icons';

/**
 * "Trusted by" strip — text marks rather than fake logo images, set in mono so it
 * reads like an institutional letterhead instead of a stock-photo band.
 */
const INSTITUTIONS = [
  'UDSM',
  'DIT',
  'TIA',
  'MUHAS',
  'Mzumbe',
  'IFM',
  'Ardhi',
  'SAUT',
  'DMI',
];

export default function LogoCloud() {
  return (
    <section className="logo-cloud" aria-label="Institutions whose students use Report Safi">
      <div className="container">
        <p className="logo-cloud-label">
          <IconGraduation size={15} />
          Students from colleges and universities across Tanzania
        </p>
        <ul className="logo-cloud-list">
          {INSTITUTIONS.map((name) => (
            <li key={name} className="logo-cloud-item">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
