import { BrandMark, IconCheck, IconShield, IconUsers } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';

/**
 * The home hero's visual proof: an official-looking selection record that shows
 * the live completed count, the reference prefix and the one-title guarantee.
 */
export default function SelectionRecord({ completed }) {
  const { meta } = useSiteContent();
  const count = completed == null ? '—' : Number(completed).toLocaleString('en-GB');

  return (
    <div className="record-card" aria-label="Selection record summary">
      <div className="record-top">
        <BrandMark size={38} />
        <div className="record-brand">
          <strong>Report Safi</strong>
          <span>Title Selection Portal</span>
        </div>
        <span className="record-state">
          <IconCheck size={13} /> Live
        </span>
      </div>

      <div className="record-ref">
        <span className="record-label">Selection record</span>
        <strong className="record-code">{meta.refPrefix}</strong>
        <span className="record-year mono">Academic year {meta.academicYear}</span>
      </div>

      <div className="record-metrics">
        <div className="record-metric">
          <span className="record-metric-icon">
            <IconUsers size={17} />
          </span>
          <div>
            <span>Completed selections</span>
            <strong>{count} students</strong>
          </div>
        </div>
        <div className="record-metric">
          <span className="record-metric-icon">
            <IconShield size={17} />
          </span>
          <div>
            <span>Portal guarantee</span>
            <strong>1 title / student</strong>
          </div>
        </div>
      </div>

      <div className="record-foot">
        <span className="mono">Server-authoritative</span>
        <span className="mono">Audited</span>
      </div>
    </div>
  );
}
