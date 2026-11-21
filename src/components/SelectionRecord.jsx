import { BrandMark, IconCheck, IconShield, IconUsers } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';

/**
 * The home hero's visual proof: an official-looking selection record that shows
 * the live completed count, the reference prefix and the one-title guarantee.
 */
export default function SelectionRecord({ completed }) {
  const { meta } = useSiteContent();
  const { t } = useLanguage();
  const count = completed == null ? '—' : Number(completed).toLocaleString('en-GB');

  return (
    <div className="record-card" aria-label="Selection record summary">
      <div className="record-top">
        <BrandMark size={38} />
        <div className="record-brand">
          <strong>Report Safi</strong>
          <span>{t('rec_portal', 'Mfumo Rasmi wa Mada')}</span>
        </div>
        <span className="record-state">
          <IconCheck size={13} /> {t('rec_live', 'Moja kwa Moja')}
        </span>
      </div>

      <div className="record-ref">
        <span className="record-label">{t('rec_label', 'Rekodi ya uchaguzi')}</span>
        <strong className="record-code">{meta.refPrefix}</strong>
        <span className="record-year mono">
          {t('rec_academic_year', 'Mwaka wa masomo')} {meta.academicYear}
        </span>
      </div>

      <div className="record-metrics">
        <div className="record-metric">
          <span className="record-metric-icon">
            <IconUsers size={17} />
          </span>
          <div>
            <span>{t('rec_completed', 'Mada zilizochaguliwa')}</span>
            <strong>{count} {t('rec_students', 'wanafunzi')}</strong>
          </div>
        </div>
        <div className="record-metric">
          <span className="record-metric-icon">
            <IconShield size={17} />
          </span>
          <div>
            <span>{t('rec_guarantee', 'Uhakika wa mfumo')}</span>
            <strong>{t('rec_guarantee_val', 'Mwanafunzi 1 / mada 1')}</strong>
          </div>
        </div>
      </div>

      <div className="record-foot">
        <span className="mono">{t('rec_authoritative', 'Inathibitishwa na Seva')}</span>
        <span className="mono">{t('rec_audited', 'Imekaguliwa')}</span>
      </div>
    </div>
  );
}
