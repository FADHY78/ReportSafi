import { useEffect, useState } from 'react';
import { getCatalogue, getProgrammes } from '../lib/api';
import { StatusTag } from '../ui/primitives';
import { IconSearch, IconFilter, IconCheck, IconShield } from '../ui/Icons';

/**
 * Live preview of the catalogue. The rows, codes and availability flags are
 * real records read from Supabase — nothing here is mock data.
 */
export default function Showcase() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [programme, setProgramme] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const programmes = await getProgrammes();
      if (!alive || !programmes.length) return;
      const first = programmes[0];
      const result = await getCatalogue({ programmeId: first.id, status: 'all', pageSize: 4 });
      if (!alive) return;
      setProgramme(first);
      setRows(result.rows || []);
      setTotal(result.total ?? null);
    })().catch(() => {
      /* the rest of the page still renders if the preview is unavailable */
    });
    return () => {
      alive = false;
    };
  }, []);

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
                Green says <strong>Available</strong>, red says <strong>Reserved</strong> — the
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
                {programme ? `${programme.code} · case study…` : 'Loading catalogue…'}
              </span>
              <span className="app-filter">
                <IconFilter size={14} /> {programme?.code || 'Programme'}
              </span>
            </div>

            <div className="app-rows">
              {rows.length ? (
                rows.map((r) => (
                  <div className="app-row" key={r.id}>
                    <span className="app-row-code mono">{r.code}</span>
                    <span className="app-row-title">{r.text}</span>
                    <StatusTag status={r.available ? 'available' : 'unavailable'} />
                  </div>
                ))
              ) : (
                <div className="app-row"><span className="app-row-title">Loading live titles…</span></div>
              )}
            </div>

            <div className="app-foot">
              <span className="mono">
                {rows.length} of {total == null ? '—' : total.toLocaleString('en-GB')} titles
              </span>
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
