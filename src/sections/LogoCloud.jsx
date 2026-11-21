import { useMemo } from 'react';
import { IconGraduation } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';

const PREFERRED_INSTITUTIONS = [
  'CBE',
  'UDSM',
  'DIT',
  'TIA',
  'MUHAS',
  'Mzumbe',
  'IFM',
  'Ardhi',
  'SAUT',
  'DMI',
  'NIT',
  'OUT',
  'ISW',
  'ITA',
];

/**
 * "Trusted by" sliding strip — individual clean cards containing only institution names,
 * with CBE strictly first, sliding horizontally with an infinite smooth animation.
 */
export default function LogoCloud() {
  const { institutions: rawInstitutions } = useSiteContent();
  const { t } = useLanguage();

  const institutions = useMemo(() => {
    const list = Array.isArray(rawInstitutions) && rawInstitutions.length
      ? rawInstitutions
      : PREFERRED_INSTITUTIONS;

    // Hakikisha CBE kiko cha kwanza kabisa bila shaka:
    const filtered = list.filter((item) => item.toUpperCase() !== 'CBE');
    return ['CBE', ...filtered];
  }, [rawInstitutions]);

  return (
    <section className="logo-cloud" aria-label="Institutions whose students use Report Safi">
      <div className="container">
        <p className="logo-cloud-label">
          <IconGraduation size={15} />
          {t('logo_label', 'Wanafunzi kutoka vyuo vikuu na taasisi za Dar es Salaam na Tanzania nzima')}
        </p>

        <div className="logo-cloud-slider" tabIndex={0} aria-label="Vyuo vinavyoteleza">
          <div className="logo-cloud-track">
            {/* Orodha ya kwanza */}
            {institutions.map((name, idx) => (
              <div
                key={`inst-1-${name}-${idx}`}
                className={`uni-chip-card${name === 'CBE' ? ' is-cbe' : ''}`}
              >
                <span className="uni-chip-name">{name}</span>
              </div>
            ))}
            {/* Orodha ya pili kwa ajili ya mzunguko usiokwisha (infinite seamless loop) */}
            {institutions.map((name, idx) => (
              <div
                key={`inst-2-${name}-${idx}`}
                className={`uni-chip-card${name === 'CBE' ? ' is-cbe' : ''}`}
                aria-hidden="true"
              >
                <span className="uni-chip-name">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
