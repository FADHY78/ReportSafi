import { useCallback, useEffect, useState } from 'react';
import { Link, navigate, useRoute } from '../lib/router';
import { getCatalogue, getProgrammes, ApiError } from '../lib/api';
import { useToast } from '../lib/toast';
import { useLanguage } from '../lib/i18n';
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
  const { t, isSwahili } = useLanguage();
  const { query } = useRoute();
  const editRef = (query?.get('editRef') || '').trim().toUpperCase();

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
  const isEditMode = Boolean(editRef && held && held.ref?.toUpperCase() === editRef);
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
      const message = err instanceof ApiError ? err.message : (isSwahili ? 'Imeshindwa kupakia orodha ya mada.' : 'Could not load the catalogue.');
      setError(message);
      notify(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [programmeId, q, status, sort, page, pageSize, notify, isSwahili]);

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
              <span className="cat-identity-label mono">
                {isSwahili ? 'Kipindi cha mwanafunzi' : 'Student session'}
              </span>
              <strong>{person?.names}</strong>
              <div className="identity-meta">
                <span className="mono">{person?.regNo}</span>
                <span>·</span>
                <span className="mono">{person?.phone}</span>
                {person?.supervisorName && (
                  <>
                    <span>·</span>
                    <span>{isSwahili ? 'Msimamizi' : 'Sup'}: {person.supervisorName}</span>
                  </>
                )}
                <span>·</span>
                <span>{programme ? `${programme.code} — ${programme.name}` : (isSwahili ? 'Inapakua kozi…' : 'Loading programme…')}</span>
              </div>
            </div>
          </div>

          <div className="identity-actions">
            <span className="tag tag-amber">
              <IconInfo size={13} /> {isSwahili ? 'Taarifa hazijahakikiwa chuoni' : 'Not verified identity'}
            </span>
            <Btn variant="outline" size="sm" icon={IconX} onClick={onResetSession}>
              {isSwahili ? 'Badilisha taarifa' : 'Change details'}
            </Btn>
          </div>
        </div>
      </div>

      <div className="container cat-container">
        {/* ------------------------------------------------------- page hero */}
        <header className="cat-hero">
          <div className="cat-hero-copy">
            <nav className="cat-crumb" aria-label="Breadcrumb">
              <Link to="/">{t('nav_home', 'Mwanzo')}</Link>
              <IconChevronRight size={13} />
              <span>{t('nav_catalogue', 'Mada za Utafiti')}</span>
            </nav>
            <span className="eyebrow">{t('id_eyebrow', 'Hatua ya 02 · Uchaguzi wa Mada')}</span>
            <h1>{isEditMode ? (isSwahili ? 'Chagua mada mpya ya utafiti' : 'Select a new research title') : t('cat_title', 'Tafuta mada yako ya utafiti')}</h1>
            <p className="lead">
              {isEditMode
                ? (isSwahili
                  ? `Unabadilisha mada kwa namba ya kumbukumbu ${held.ref}. Chagua mada yoyote iliyo wazi hapa chini kuchukua nafasi ya mada yako ya sasa.`
                  : `Changing title for reference ${held.ref}. Choose any available title below to replace your current title.`)
                : held
                ? (isSwahili
                  ? 'Tayari unamiliki mada moja. Tumia namba yako ya kumbukumbu hapa chini ikiwa unataka kurekebisha taarifa au kubadilisha mada nyingine iliyo wazi.'
                  : 'You currently hold one title. Use your reference number below to edit your details or switch to another available title.')
                : (isSwahili
                  ? 'Tafuta na linganisha mada zilizoidhinishwa. Kuchagua mada bado haihifadhi moja kwa moja — utathibitisha hatua ya mwisho kwenye ukurasa unaofuata.'
                  : 'Search and compare approved titles. Selecting a title does not save it yet — you will confirm the final step on the next screen.')}
            </p>
            <div className="cat-programme-chip">
              <IconGraduation size={16} />
              <span>{programme?.name || (isSwahili ? 'Programu yako' : 'Your programme')}</span>
              <b className="mono">{programme?.code || '—'}</b>
            </div>
          </div>

          <div className="cat-kpis" aria-label="Catalogue summary">
            <Stat
              label={t('cat_filter_all', 'Mada zote')}
              value={data ? data.catalogueTotal.toLocaleString('en-GB') : '—'}
              hint={isSwahili ? 'Mada zilizoidhinishwa' : 'Approved titles'}
            />
            <Stat
              label={t('cat_filter_avail', 'Zinazopatikana')}
              value={data ? data.available.toLocaleString('en-GB') : '—'}
              tone="green"
              hint={isSwahili ? 'Ziko wazi kuchaguliwa' : 'Available to select'}
            />
            <Stat
              label={t('cat_filter_taken', 'Zilizochukuliwa')}
              value={data ? data.unavailable.toLocaleString('en-GB') : '—'}
              tone="red"
              hint={isSwahili ? 'Zimekwishachaguliwa' : 'Already taken'}
            />
          </div>
        </header>

        {isEditMode ? (
          <Notice tone="info" icon={IconRefresh}>
            <div style={{ flex: 1 }}>
              <strong>{isSwahili ? `Unabadilisha mada kwa namba ya kumbukumbu ${held.ref}.` : `Changing title using reference ${held.ref}.`}</strong>{' '}
              {isSwahili ? 'Mada ya sasa:' : 'Current title:'}{' '}
              <span className="mono">{held.title?.code}</span> — {held.title?.text}.{' '}
              {isSwahili
                ? 'Chagua mada iliyo wazi hapa chini kuchukua nafasi yake; mada yako ya awali itaachiwa wazi kwa wanafunzi wengine.'
                : 'Choose an available title below to replace it; your old title will return to the available pool.'}
              <div style={{ marginTop: 10 }}>
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/reference?ref=${encodeURIComponent(held.ref)}`)}
                >
                  {isSwahili ? 'Rudi kwenye uthibitisho' : 'Back to confirmation'}
                </Btn>
              </div>
            </div>
          </Notice>
        ) : held ? (
          <Notice tone="warn" icon={IconLock}>
            <div style={{ flex: 1 }}>
              <strong>{isSwahili ? `Kwa sasa unamiliki mada ${held.ref}.` : `You currently hold ${held.ref}.`}</strong>{' '}
              {isSwahili
                ? 'Mwanafunzi mmoja anaruhusiwa kuwa na mada moja inayofanya kazi. Unataka kubadilisha mada nyingine au kurekebisha taarifa zako?'
                : 'One student holds one active title at a time. Want to switch to another available title or edit your details?'}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                <Btn
                  variant="gold"
                  size="sm"
                  icon={IconRefresh}
                  onClick={() => navigate(`/catalogue?editRef=${encodeURIComponent(held.ref)}`)}
                >
                  {isSwahili ? `Badilisha mada na ${held.ref}` : `Change title with ${held.ref}`}
                </Btn>
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/reference?ref=${encodeURIComponent(held.ref)}`)}
                >
                  {isSwahili ? 'Tazama / Rekebisha taarifa' : 'View / Edit details'}
                </Btn>
              </div>
            </div>
          </Notice>
        ) : null}

        {error && (
          <Notice tone="error" icon={IconAlert}>
            <strong>{isSwahili ? 'Haikuweza kusasisha orodha ya mada.' : 'Could not refresh the catalogue.'}</strong> {error}{' '}
            <button type="button" className="text-btn" onClick={load}>
              {isSwahili ? 'Jaribu tena' : 'Try again'}
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
                    placeholder={t('cat_search_placeholder', 'Tafuta kwa mada, nambari ya mada, au maneno muhimu…')}
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
                  {t('cat_refresh', 'Sasisha')}
                </Btn>
              </div>

              <div className="cat-toolbar-filters">
                <span className="cat-filter-label">
                  <IconFilter size={15} /> {t('cat_filter_label', 'Vichujio')}
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
                  <option value="all">{t('cat_filter_all_avail', 'Hali zote')}</option>
                  <option value="available">{t('cat_filter_avail_only', 'Zinazopatikana tu')}</option>
                  <option value="unavailable">{t('cat_filter_unavail_only', 'Zilizochukuliwa tu')}</option>
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
                  <option value="az">{t('cat_sort_az', 'Panga: A – Z')}</option>
                  <option value="za">{t('cat_sort_za', 'Panga: Z – A')}</option>
                  <option value="new">{t('cat_sort_new', 'Mpya kwanza')}</option>
                  <option value="old">{t('cat_sort_old', 'Za zamani kwanza')}</option>
                </select>
                {(q || status !== 'all' || sort !== 'az') && (
                  <Btn variant="ghost" size="sm" icon={IconX} onClick={resetFilters}>
                    {t('cat_reset', 'Weka upya')}
                  </Btn>
                )}
                <span className="cat-result-count mono">
                  {data ? `${data.total.toLocaleString('en-GB')} ${t('cat_records', 'mada')}` : (isSwahili ? 'Inapakia…' : 'Loading…')}
                </span>
              </div>
            </div>

            {/* --------------------------------------------------- title list */}
            <div className="cat-table-head" aria-hidden="true">
              <span>{t('cat_record', 'Rekodi')}</span>
              <span>{t('cat_title_col', 'Mada Iliyoidhinishwa')}</span>
              <span>{t('cat_status_col', 'Hali')}</span>
              <span>{t('cat_action_col', 'Hatua')}</span>
            </div>

            <div className={cls('list cat-list', refreshing && 'is-refreshing')}>
              {loading && !data ? (
                <SkeletonRows rows={7} />
              ) : !data || data.total === 0 ? (
                <Empty
                  icon={IconFileText}
                  title={
                    q
                      ? (isSwahili ? 'Hakuna mada zinazolingana na utafutaji' : 'No titles match your search')
                      : (isSwahili ? 'Hakuna mada katika mwonekano huu' : 'No titles in this view')
                  }
                  text={
                    q
                      ? (isSwahili ? `Hakuna kilichopatikana kwa “${q}”. Jaribu neno fupi zaidi au ondoa vichujio.` : `Nothing found for “${q}”. Try a shorter keyword or clear the filters.`)
                      : (isSwahili ? 'Badilisha vichujio vya upatikanaji ili kuona orodha zaidi ya mada.' : 'Adjust the availability filter to see more of the catalogue.')
                  }
                  action={
                    <Btn variant="outline" size="sm" icon={IconX} onClick={resetFilters}>
                      {isSwahili ? 'Ondoa vichujio na utafutaji' : 'Clear search & filters'}
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
                      {title.available && (!held || isEditMode) ? (
                        <Btn
                          variant={isEditMode ? 'gold' : 'primary'}
                          size="sm"
                          icon={IconArrowRight}
                          onClick={() =>
                            navigate(
                              isEditMode
                                ? `/confirm?title=${encodeURIComponent(title.id)}&editRef=${encodeURIComponent(held.ref)}`
                                : `/confirm?title=${encodeURIComponent(title.id)}`
                            )
                          }
                        >
                          {isEditMode ? t('cat_btn_select_new', 'Chagua kama Mada Mpya') : t('cat_btn_select', 'Kagua na Chagua')}
                        </Btn>
                      ) : held && held.titleId === title.id ? (
                        <span className="cat-row-note">
                          <IconCheck size={14} /> {t('cat_current_title', 'Mada yako ya sasa')}
                        </span>
                      ) : title.available && held ? (
                        <span className="cat-row-note">
                          <IconLock size={14} /> {isSwahili ? `Tumia ${held.ref} kubadilisha` : `Use ${held.ref} to switch`}
                        </span>
                      ) : (
                        <span className="cat-row-note">
                          <IconCheck size={14} /> {t('cat_taken', 'Imechukuliwa')}
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {data && data.total > 0 && (
              <>
                <div className="cat-foot">
                  <Pager
                    page={page}
                    total={data.total}
                    pageSize={pageSize}
                    onPageChange={(next) => {
                      setPage(next);
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                  />

                  <div className="cat-pagesize">
                    <span className="muted small">{t('cat_per_page', 'Mada kwa ukurasa:')}</span>
                    <select
                      className="select select-sm cat-pagesize-select"
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
              <span className="eyebrow">{t('cat_status_key', 'Ufafanuzi wa Hali')}</span>
              <h3>{t('cat_status_key_sub', 'Soma maandishi, usitegemee rangi pekee')}</h3>
              <ul className="cat-legend-list">
                <li>
                  <span className="legend-mark legend-available">
                    <IconCheck size={13} />
                  </span>
                  <div>
                    <strong>{t('cat_badge_avail', 'Inapatikana')}</strong>
                    <p>{t('cat_avail_text', 'Unaweza kuikagua na kuichagua mada hii.')}</p>
                  </div>
                </li>
                <li>
                  <span className="legend-mark legend-unavailable">
                    <IconLock size={13} />
                  </span>
                  <div>
                    <strong>{t('cat_badge_taken', 'Imechukuliwa')}</strong>
                    <p>{t('cat_unavail_text', 'Tayari imeshachukuliwa na mwanafunzi mwingine.')}</p>
                  </div>
                </li>
              </ul>
              <div className="cat-server-note">
                <IconShield size={15} />
                <span>{t('cat_server_note', 'Hali inaamuliwa na mfumo kwenye seva, kamwe siyo skrini hii.')}</span>
              </div>
            </section>

            <section className="cat-aside-card cat-aside-accent">
              <span className="cat-aside-icon">
                <IconShield size={18} />
              </span>
              <h3>{t('cat_one_title_heading', 'Mada moja. Mwanafunzi mmoja.')}</h3>
              <p>
                {t(
                  'cat_one_title_text',
                  'Mada yako inahifadhiwa rasmi pale tu utakapothibitisha hatua inayofuata. Baada ya hapo, namba yako ya kumbukumbu inakupa umiliki kamili.'
                )}
              </p>
              <Link to="/help" className="btn btn-outline btn-sm">
                {t('cat_how_it_works', 'Jinsi mfumo unavyofanya kazi')} <IconArrowRight size={15} />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
