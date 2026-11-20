import {
  IconLock,
  IconShield,
  IconHistory,
  IconDownload,
  IconUpload,
  IconRefresh,
} from '../ui/Icons';

const ITEMS = [
  {
    icon: IconShield,
    title: 'Server-authoritative availability',
    text: 'Every reservation re-reads the register inside an exclusive lock and re-checks all nine business rules before it commits — the browser never has the final word.',
  },
  {
    icon: IconLock,
    title: 'Role-based staff access',
    text: 'Administrator and system-administrator roles, separate sign-in, and staff actions attributed by name in the log — not by “someone from the office”.',
  },
  {
    icon: IconHistory,
    title: 'Immutable audit history',
    text: 'Imports, edits, releases, sign-ins and rejections are appended with actor, time, reason and before/after values. Nothing is quietly overwritten.',
  },
  {
    icon: IconUpload,
    title: 'Validated CSV import',
    text: 'Uploads are previewed before they land: duplicates, short titles and rows already in the programme are rejected with a plain explanation, row by row.',
  },
  {
    icon: IconDownload,
    title: 'Your data leaves with you',
    text: 'Catalogue, selection records and the audit log export as UTF-8 CSV that opens in Excel or Google Sheets. No lock-in, no proprietary format.',
  },
  {
    icon: IconRefresh,
    title: 'Same answer on every screen',
    text: 'Open the portal in two browsers at once and both see the same availability — changes broadcast live across tabs so nobody works from a stale list.',
  },
];

export default function Security() {
  return (
    <section className="section" id="security">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Trust &amp; integration</span>
          <h2>The parts an auditor asks about first</h2>
          <p>
            Built to the PRD's own rules (BR-01 … BR-09), with the enforcement in one service layer
            that can be pointed at a real backend without touching the interface.
          </p>
        </div>

        <div className="trust-grid">
          {ITEMS.map((i) => (
            <article className="trust-item" key={i.title}>
              <span className="trust-icon">
                <i.icon size={18} />
              </span>
              <div>
                <h3>{i.title}</h3>
                <p>{i.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="trust-strip">
          <span className="mono">PRD v1.0</span>
          <span className="mono">BR-01 … BR-09</span>
          <span className="mono">WCAG · status + word</span>
          <span className="mono">CSV / UTF-8</span>
          <span className="mono">Hash router · static host</span>
        </div>
      </div>
    </section>
  );
}
