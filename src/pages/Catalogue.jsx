import { useCallback, useEffect, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { getCatalogue, getProgrammes, ApiError } from '../lib/api';
import { useToast } from '../lib/toast';
import { Btn, Pager, Empty, SkeletonRows, StatusTag, Notice } from '../ui/primitives';
import {
  IconSearch,
  IconX,
  IconFileText,
  IconArrowRight,
  IconChevronRight,
  IconFilter,
  IconRefresh,
  IconGraduation,
  IconShield,
  IconLock,
  IconCheck,
  IconAlert,
  IconInfo,
} from '../ui/Icons';
import { cls, pad } from '../lib/utils';

const PAGE_SIZES = [20, 50, 100];

function Stat({ label, value, tone, hint }) {
  return (
    <div className={cls('cat-kpi', tone && `cat-kpi-${tone}`)}>
      <span className="cat-kpi-label">{label}</span>
      <strong className="mono">{value}</strong>
      <span className="cat-kpi-hint">{hint}</span>
    </div>
  );
}

export default function Catalogue({ session, onResetSession }) {
  const notify = useToast();
  const [programmes, setProgrammes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('az');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const programmeId = session?.student?.programmeId;
  const held = session?.existingSelection;
  const programme = programmes.find((p) => p.id === programmeId);
  const person = session?.student;
  const refreshing = loading && Boolean(data);

  useEffect(() => {
    getProgrammes({ includeInactive: true }).then(setProgrammes);
  }, []);

  const load = useCallback(async () => {
    if (!programmeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getCatalogue({ programmeId, q, status, sort, page, pageSize });
      setData(res);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not load the catalogue.';
      setError(message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [programmeId, q, status, sort, page, pageSize, notify]);

  // Debounce keystrokes so typing does not fire a request on every character.
  useEffect(() => {
    const id = window.setTimeout(load, 260);
    return () => window.clearTimeout(id);
  }, [load]);

  const resetFilters = () => {
    setQ('');
    setStatus('all');
    setSort('az');
    setPageSize(20);
    setPage(1);
  };

  const initials = (person?.names || '?')
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="cat-page">
      {/* -------------------------------------------------- session identity */}
      <div className="identity-bar">
        <div className="container identity-inner cat-identity">
          <div className="identity-person">
            <div className="identity-avatar" aria-hidden="true">
              {initials}
            </div>
            <div>
              <span className="cat-identity-label mono">Student session</span>
              <strong>{person?.names}</strong>
              <div className="identity-meta">
                <span className="mono">{person?.regNo}</span>
                <span>·</span>
                <span className="mono">{person?.phone}</span>
                <span>·</span>
                <span>{programme ? `${programme.code} — ${programme.name}` : 'Loading programme…'}</span>
              </div>
            </div>
          </div>

          <div className="identity-actions">
            <span className="tag tag-amber">
              <IconInfo size={13} /> Not verified identity
            </span>
            <Btn variant="outline" size="sm" icon={IconX} onClick={onResetSession}>
              Change details
            </Btn>
          </div>
        </div>
      </div>

      <div className="container cat-container">
        {/* ------------------------------------------------------- page hero */}
        <header className="cat-hero">
          <div className="cat-hero-copy">
            <nav className="cat-crumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <IconChevronRight size={13} />
              <span>Catalogue</span>
            </nav>
            <span className="eyebrow">Step 02 · Title selection</span>
            <h1>Find your research title</h1>
            <p className="lead">
              {held
                ? 'You already hold a title, so selection is locked. You can still browse the catalogue below.'
                : 'Search and compare approved titles. Selecting a title does not reserve it — the reservation is confirmed on the next screen.'}
            </p>
            <div className="cat-programme-chip">
              <IconGraduation size={16} />
              <span>{programme?.name || 'Your programme'}</span>
              <b className="mono">{programme?.code || '—'}</b>
            </div>
          </div>

          <div className="cat-kpis" aria-label="Catalogue summary">
            <Stat
              label="In catalogue"
              value={data ? data.catalogueTotal.toLocaleString('en-GB') : '—'}
              hint="Approved titles"
            />
            <Stat
              label="Available"
              value={data ? data.available.toLocaleString('en-GB') : '—'}
              tone="green"
              hint="Open to select"
            />
            <Stat
              label="Reserved"
              value={data ? data.unavailable.toLocaleString('en-GB') : '—'}
              tone="red"
              hint="Already committed"
            />
          </div>
        </header>

        {held && (
          <Notice tone="warn" icon={IconLock}>
            <strong>You hold {held.ref}.</strong> One student may hold only one active title. To take
            a different topic, an authorised release is required first.
          </Notice>
        )}

        {error && (
          <Notice tone="error" icon={IconAlert}>
            <strong>Could not refresh the catalogue.</strong> {error}{' '}
            <button type="button" className="text-btn" onClick={load}>
              Try again
            </button>
          </Notice>
        )}

        <div className="cat-workspace">
          <div className="cat-main">
            {/* -------------------------------------------------- filter bar */}
            <div className="cat-toolbar">
              <div className="cat-toolbar-main">
                <div className="search-box cat-search">
                  <IconSearch size={18} />
                  <input
                    className="inp"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by keyword, title or category…"
                    aria-label="Search titles"
                  />
                  {q && (
                    <button className="search-clear" onClick={() => setQ('')} aria-label="Clear search">
                      <IconX size={15} />
                    </button>
                  )}
                </div>
                <Btn
                  variant="outline"
                  size="sm"
                  icon={IconRefresh}
                  onClick={load}
                  disabled={loading}
                  aria-label="Refresh catalogue"
                >
                  Refresh
                </Btn>
              </div>

              <div className="cat-toolbar-filters">
                <span className="cat-filter-label">
                  <IconFilter size={15} /> Filters
                </span>
                <select
                  className="select cat-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by availability"
                >
                  <option value="all">All availability</option>
                  <option value="available">Available only</option>
                  <option value="unavailable">Unavailable only</option>
                </select>
                <select
                  className="select cat-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Sort titles"
                >
                  <option value="az">Sort: A – Z</option>
                  <option value="za">Sort: Z – A</option>
                  <option value="new">Newest first</option>
                  <option value="old">Oldest first</option>
                </select>
                {(q || status !== 'all' || sort !== 'az') && (
                  <Btn variant="ghost" size="sm" icon={IconX} onClick={resetFilters}>
                    Reset
                  </Btn>
                )}
                <span className="cat-result-count mono">
                  {data ? `${data.total.toLocaleString('en-GB')} records` : 'Loading…'}
                </span>
              </div>
            </div>

            {/* --------------------------------------------------- title list */}
            <div className="cat-table-head" aria-hidden="true">
              <span>Record</span>
              <span>Approved title</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            <div className={cls('list cat-list', refreshing && 'is-refreshing')}>
              {loading && !data ? (
                <SkeletonRows rows={7} />
              ) : !data || data.total === 0 ? (
                <Empty
                  icon={IconFileText}
                  title={q ? 'No titles match your search' : 'No titles in this view'}
                  text={
                    q
                      ? `Nothing found for “${q}”. Try a shorter keyword or clear the filters.`
                      : 'Adjust the availability filter to see more of the catalogue.'
                  }
                  action={
                    <Btn variant="outline" size="sm" icon={IconX} onClick={resetFilters}>
                      Clear search &amp; filters
                    </Btn>
                  }
                />
              ) : (
                data.rows.map((title, i) => (
                  <article
                    key={title.id}
                    className={cls('cat-row', !title.available && 'is-taken')}
                  >
                    <div className="cat-row-ref">
                      <b className="mono">{pad(data.from + i, 4)}</b>
                      <span className="mono">{title.code}</span>
                    </div>

                    <div className="cat-row-main">
                      <h3>{title.text}</h3>
                      <div className="cat-row-tags">
                        <span className="cat-chip">{title.category}</span>
                        <span className="cat-chip mono">{programme?.code || '—'}</span>
                      </div>
                    </div>

                    <div className="cat-row-status">
                      <StatusTag status={title.available ? 'available' : 'unavailable'} />
                    </div>

                    <div className="cat-row-action">
                      {title.available && !held ? (
                        <Btn
                          variant="primary"
                          size="sm"
                          icon={IconArrowRight}
                          onClick={() => navigate(`/confirm?title=${encodeURIComponent(title.id)}`)}
                        >
                          Review &amp; select
                        </Btn>
                      ) : title.available && held ? (
                        <span className="cat-row-note">
                          <IconLock size={14} /> Selection locked
                        </span>
                      ) : (
                        <span className="cat-row-note">
                          <IconCheck size={14} /> Taken
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {data && data.total > 0 && (
              <>
                <Pager
                  page={data.page}
                  totalPages={data.totalPages}
                  onPage={setPage}
                  from={data.from}
                  to={data.to}
                  total={data.total}
                />
                <div className="table-note cat-table-note">
                  <span>
                    Availability is confirmed by the portal each time this list loads — a title can
                    still be taken while you read this page.
                  </span>
                  <div className="page-size">
                    <label htmlFor="psize">Rows per page</label>
                    <select
                      id="psize"
                      className="select"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      {PAGE_SIZES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* --------------------------------------------------- side panel */}
          <aside className="cat-aside" aria-label="Catalogue guidance">
            <section className="cat-aside-card">
              <span className="eyebrow">Status key</span>
              <h3>Read the record, not just the colour</h3>
              <ul className="cat-legend-list">
                <li>
                  <span className="legend-mark legend-available">
                    <IconCheck size={13} />
                  </span>
                  <div>
                    <strong>Available</strong>
                    <p>You may review and select this title.</p>
                  </div>
                </li>
                <li>
                  <span className="legend-mark legend-unavailable">
                    <IconLock size={13} />
                  </span>
                  <div>
                    <strong>Unavailable</strong>
                    <p>Already reserved by another student.</p>
                  </div>
                </li>
              </ul>
              <div className="cat-server-note">
                <IconShield size={15} />
                <span>Status is decided by the portal, never by this screen.</span>
              </div>
            </section>

            <section className="cat-aside-card cat-aside-accent">
              <span className="cat-aside-icon">
                <IconShield size={18} />
              </span>
              <h3>One title. One student.</h3>
              <p>
                Your reservation is created only after you confirm the next step. After that, only
                an authorised administrator can release it.
              </p>
              <Link to="/help" className="btn btn-outline btn-sm">
                How selection works <IconArrowRight size={15} />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
