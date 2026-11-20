import { StatusTag } from '../ui/primitives';
import { IconSearch, IconFilter, IconCheck, IconShield } from '../ui/Icons';

/**
 * Product preview — a hand-built mock of the catalogue rather than a screenshot,
 * so it stays sharp, translatable and consistent with the design system.
 */
const ROWS = [
  { code: 'BAF/0148', title: 'The Effect of Digital Payments on Profitability of SMEs in Kinondoni', status: 'available' },
  { code: 'BAF/0149', title: 'Auditing Practices in District Municipal Councils: Evidence from Dodoma', status: 'unavailable' },
  { code: 'BBA/0312', title: 'Strategies for Strengthening Entrepreneurship among Graduates in Mwanza', status: 'available' },
  { code: 'BHRM/0087', title: 'Factors Affecting Talent Retention in Commercial Banks of Arusha', status: 'available' },
];

export default function Showcase() {
  return (
    <section className="section section-alt" id="product">
      <div className="container">
        <div className="showcase">
          <div className="showcase-copy">
            <span className="eyebrow">The catalogue</span>
            <div className="section-head" style={{ marginBottom: 20 }}>
              <h2>See what is free before you commit</h2>
              <p>
                Search by keyword, narrow to your programme, and read availability at a glance.
                Green says <strong>Available</strong>, red says <strong>Unavailable</strong> — the
                word is always there, even in black and white.
              </p>
            </div>

            <ul className="showcase-points">
              <li>
                <span className="tick">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                Pagination at 20, 50 or 100 rows for catalogues of 1,000+ titles
              </li>
              <li>
                <span className="tick">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                Keyword search across title wording and category
              </li>
              <li>
                <span className="tick">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                Availability re-verified by the portal the moment you confirm
              </li>
            </ul>
          </div>

          <div className="showcase-app" aria-hidden="true">
            <div className="app-chrome">
              <span className="app-dot" />
              <span className="app-dot" />
              <span className="app-dot" />
              <span className="app-url mono">reportsafi.me/#/catalogue</span>
            </div>

            <div className="app-toolbar">
              <span className="app-search">
                <IconSearch size={15} />
                digital payments…
              </span>
              <span className="app-filter">
                <IconFilter size={14} /> Programme
              </span>
            </div>

            <div className="app-rows">
              {ROWS.map((r) => (
                <div className="app-row" key={r.code}>
                  <span className="app-row-code mono">{r.code}</span>
                  <span className="app-row-title">{r.title}</span>
                  <StatusTag status={r.status} />
                </div>
              ))}
            </div>

            <div className="app-foot">
              <span className="mono">4 of 1,240 titles</span>
              <span className="app-confirm">
                <IconShield size={14} /> Confirm selection
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
