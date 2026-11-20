import { useCallback, useEffect, useState } from 'react';
import { navigate } from '../../lib/router';
import { getAdminStats } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, StatusTag, SkeletonRows, Empty } from '../../ui/primitives';
import {
  IconFolder,
  IconFileText,
  IconCheckCircle,
  IconAlert,
  IconUsers,
  IconClock,
  IconHistory,
  IconArrowRight,
  IconRefresh,
  IconUpload,
} from '../../ui/Icons';
import { fmtDateTime, relativeTime } from '../../lib/utils';

function Kpi({ label, value, note, tone, icon: Icon }) {
  return (
    <div className={`kpi${tone ? ` is-${tone}` : ''}`}>
      <div className="kpi-head">
        <span className="kpi-label">{label}</span>
        <Icon size={17} />
      </div>
      <div className="kpi-value">{Number(value || 0).toLocaleString('en-GB')}</div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}

export default function Dashboard() {
  const notify = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await getAdminStats());
    } catch {
      notify('Could not load the dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !stats) {
    return (
      <>
        <div className="kpi-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="kpi" key={i}>
              <div className="skeleton" style={{ height: 14, width: '60%' }} />
              <div className="skeleton" style={{ height: 30, width: '45%', marginTop: 16 }} />
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-body">
            <SkeletonRows rows={5} />
          </div>
        </div>
      </>
    );
  }

  if (!stats) return <Empty title="Dashboard unavailable" text="Try refreshing the page." />;

  const maxTotal = Math.max(...stats.perProgramme.map((p) => p.total), 1);

  return (
    <>
      <div className="row-between">
        <p className="muted small" style={{ maxWidth: '54ch' }}>
          Live view of the catalogue and every reservation committed by the portal. Figures refresh
          from the store each time you load this page.
        </p>
        <div className="row-between" style={{ gap: 12 }}>
          <span className="status-pill" title="All nine business rules are re-checked on every write">
            <span className="dot dot-green" />
            Rules enforcing · BR-01 … BR-09
          </span>
          <Btn variant="outline" size="sm" icon={IconRefresh} onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Btn>
        </div>
      </div>

      <div className="quick-grid">
        <button className="quick-card" onClick={() => navigate('/titles')}>
          <span className="quick-icon"><IconUpload size={17} /></span>
          <span>
            <strong>Import a catalogue</strong>
            <span>Upload CSV with a validation preview</span>
          </span>
          <IconArrowRight size={15} />
        </button>
        <button className="quick-card" onClick={() => navigate('/selections')}>
          <span className="quick-icon"><IconUsers size={17} /></span>
          <span>
            <strong>Review selections</strong>
            <span>Release a title with a recorded reason</span>
          </span>
          <IconArrowRight size={15} />
        </button>
        <button className="quick-card" onClick={() => navigate('/audit')}>
          <span className="quick-icon"><IconHistory size={17} /></span>
          <span>
            <strong>Read the audit log</strong>
            <span>Actor, time, reason and before / after</span>
          </span>
          <IconArrowRight size={15} />
        </button>
        <button className="quick-card" onClick={() => navigate('/programmes')}>
          <span className="quick-icon"><IconFolder size={17} /></span>
          <span>
            <strong>Programme structure</strong>
            <span>Codes, awards, departments, status</span>
          </span>
          <IconArrowRight size={15} />
        </button>
      </div>

      <div className="kpi-grid">
        <Kpi label="Programmes" value={stats.programmes} note={`${stats.activeProgrammes} open for selection`} tone="navy" icon={IconFolder} />
        <Kpi label="Titles" value={stats.titles} note="Active in catalogue" icon={IconFileText} />
        <Kpi label="Available" value={stats.available} note="Free to reserve" tone="green" icon={IconCheckCircle} />
        <Kpi label="Unavailable" value={stats.unavailable} note="Reserved or withdrawn" tone="red" icon={IconAlert} />
        <Kpi label="Active selections" value={stats.selections} note={`${stats.students} student records`} tone="gold" icon={IconUsers} />
        <Kpi label="Selected today" value={stats.today} note={`${stats.released} released historically`} icon={IconClock} />
      </div>

      <div className="split-2">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-title">
              <IconFolder size={17} /> Availability by programme
            </span>
            <span className="mono small muted">green = available · red = taken</span>
          </div>
          <div className="panel-body">
            <div className="bar-list">
              {stats.perProgramme.map((p) => {
                const availPct = p.total ? (p.available / maxTotal) * 100 : 0;
                const takenPct = p.total ? (p.unavailable / maxTotal) * 100 : 0;
                return (
                  <div className="bar-item" key={p.id} title={`${p.name}: ${p.available} available of ${p.total}`}>
                    <span className="bar-label">{p.code}</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ width: `${availPct}%` }} />
                      <span className="bar-fill taken" style={{ width: `${takenPct}%` }} />
                    </span>
                    <span className="bar-value">
                      {p.available.toLocaleString('en-GB')} / {p.total.toLocaleString('en-GB')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="row-between" style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
              <span className="small muted">
                {stats.titles.toLocaleString('en-GB')} titles across {stats.programmes} programmes
              </span>
              <Btn variant="outline" size="sm" icon={IconArrowRight} onClick={() => navigate('/titles')}>
                Manage titles
              </Btn>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gap: 20 }}>
          <section className="panel">
            <div className="panel-head">
              <span className="panel-title">
                <IconUsers size={17} /> Latest selections
              </span>
            </div>
            <div className="panel-body" style={{ paddingTop: 6 }}>
              {stats.recent.length === 0 ? (
                <Empty title="No selections yet" text="Reservations appear here the moment students confirm." />
              ) : (
                <div className="feed">
                  {stats.recent.map((r) => (
                    <div className="feed-item" key={r.id}>
                      <span className="feed-dot" />
                      <div style={{ flex: 1 }}>
                        <strong>{r.student?.names || 'Unknown student'}</strong>
                        <p>
                          {r.title?.code} — {r.title?.text?.slice(0, 68)}
                          {r.title?.text?.length > 68 ? '…' : ''}
                        </p>
                        <time>{relativeTime(r.selectedAt)}</time>
                      </div>
                      <StatusTag status={r.status === 'active' ? 'active' : 'released'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-title">
                <IconHistory size={17} /> Recent audit entries
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/audit')}>
                View all
              </button>
            </div>
            <div className="panel-body" style={{ paddingTop: 6 }}>
              <div className="feed">
                {stats.audit.map((a) => (
                  <div className="feed-item" key={a.id}>
                    <span className="feed-dot" style={{ background: 'var(--navy)' }} />
                    <div style={{ flex: 1 }}>
                      <strong>{a.summary}</strong>
                      <p>
                        {a.actor} · {a.role}
                      </p>
                      <time title={fmtDateTime(a.at)}>{relativeTime(a.at)}</time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
