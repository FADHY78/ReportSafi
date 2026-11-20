import { useCallback, useEffect, useState } from 'react';
import { listSelections, releaseSelection, getProgrammes, ApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Field, Modal, Notice, StatusTag, Pager, Empty, SkeletonRows } from '../../ui/primitives';
import { IconSearch, IconDownload, IconUndo, IconUsers, IconAlert, IconEye, IconHistory } from '../../ui/Icons';
import { fmtDateTime, phoneDisplay, toCSV, downloadFile } from '../../lib/utils';

export default function Selections({ admin }) {
  const notify = useToast();

  const [programmes, setProgrammes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [programmeId, setProgrammeId] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [inspecting, setInspecting] = useState(null);
  const [releasing, setReleasing] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await listSelections({ q, status, programmeId, page, pageSize }));
    } catch {
      notify('Could not load selections.', 'error');
    } finally {
      setLoading(false);
    }
  }, [q, status, programmeId, page, notify]);

  useEffect(() => {
    getProgrammes({ includeInactive: true }).then(setProgrammes);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(load, 260);
    return () => window.clearTimeout(id);
  }, [load]);

  const confirmRelease = async () => {
    setBusy(true);
    try {
      await releaseSelection({ selectionId: releasing.id, reason, actor: admin });
      notify(`${releasing.ref} released — the title is available again.`, 'success');
      setReleasing(null);
      setReason('');
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not release the selection.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await listSelections({ q, status, programmeId, page: 1, pageSize: 100000 });
      const csv = toCSV(
        [
          'reference',
          'reg_no',
          'names',
          'phone',
          'supervisor_name',
          'programme',
          'title_code',
          'title',
          'status',
          'selected_at',
          'edit_count',
          'edited_at',
          'previous_title_code',
          'previous_title_text',
          'edit_note',
          'released_at',
          'release_reason',
        ],
        res.rows.map((s) => [
          s.ref,
          s.student?.regNo || '',
          s.student?.names || '',
          s.student?.phone || '',
          s.student?.supervisorName || '',
          s.programme?.code || '',
          s.title?.code || '',
          s.title?.text || '',
          s.status,
          s.selectedAt,
          s.editCount || 0,
          s.editedAt || '',
          s.previousTitleCode || '',
          s.previousTitleText || '',
          s.editNote || '',
          s.releasedAt || '',
          s.releaseReason || '',
        ])
      );
      downloadFile('reportsafi-selection-records.csv', csv);
      notify(`Exported ${res.rows.length} records.`, 'success');
    } catch {
      notify('Export failed.', 'error');
    }
  };

  return (
    <>
      <div className="table-toolbar">
        <div className="search-box" style={{ maxWidth: 340 }}>
          <IconSearch size={17} />
          <input
            className="inp"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search reference, reg no, name, supervisor, phone or title…"
            aria-label="Search selections"
          />
        </div>

        <select
          className="select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="edited">Edited by student</option>
          <option value="released">Released</option>
        </select>

        <select
          className="select"
          value={programmeId}
          onChange={(e) => {
            setProgrammeId(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by programme"
        >
          <option value="all">All programmes</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />
        <Btn variant="outline" size="sm" icon={IconDownload} onClick={exportCsv}>
          Export records
        </Btn>
      </div>

      <div className="table-wrap">
        {loading && !data ? (
          <SkeletonRows rows={7} />
        ) : !data || data.total === 0 ? (
          <Empty
            icon={IconUsers}
            title="No selection records"
            text="Once students confirm a title, their records appear here with the reference number, supervisor name, phone number and edit history."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Student &amp; Supervisor</th>
                <th>Phone</th>
                <th>Programme</th>
                <th>Title</th>
                <th>Selected / Edited</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((s) => (
                <tr key={s.id}>
                  <td className="mono strong nowrap">{s.ref}</td>
                  <td>
                    <span className="strong">{s.student?.names || '—'}</span>
                    <div className="mono small">{s.student?.regNo || '—'}</div>
                    {s.student?.supervisorName && (
                      <div className="small muted">Sup: {s.student.supervisorName}</div>
                    )}
                  </td>
                  <td className="mono small">{phoneDisplay(s.student?.phone)}</td>
                  <td className="mono">{s.programme?.code || '—'}</td>
                  <td className="title-cell">
                    <span className="mono small" style={{ display: 'block', color: 'var(--muted)' }}>
                      {s.title?.code || '—'}
                    </span>
                    {s.title?.text || 'Title removed'}
                    {s.previousTitleText && (
                      <div className="small muted" style={{ marginTop: 6 }}>
                        <span className="mono">Was {s.previousTitleCode}:</span>{' '}
                        <span style={{ textDecoration: 'line-through', opacity: 0.78 }}>
                          {s.previousTitleText}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="mono small">
                    <div>{fmtDateTime(s.selectedAt)}</div>
                    {s.editedAt && (
                      <div className="small" style={{ color: 'var(--gold-ink)', marginTop: 4 }}>
                        Edited: {fmtDateTime(s.editedAt)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                      <StatusTag status={s.status} />
                      {(s.editCount || 0) > 0 && (
                        <StatusTag status="edited" label={`Edited (${s.editCount})`} />
                      )}
                    </div>
                    {s.status === 'released' && (
                      <div className="small muted" style={{ marginTop: 6, maxWidth: 190 }}>
                        {s.releaseReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        title="View details & edit history"
                        aria-label={`Inspect ${s.ref}`}
                        onClick={() => setInspecting(s)}
                      >
                        <IconEye size={15} />
                      </button>
                      {s.status === 'active' ? (
                        <button
                          className="icon-btn danger"
                          title="Release selection"
                          aria-label={`Release ${s.ref}`}
                          onClick={() => {
                            setReleasing(s);
                            setReason('');
                          }}
                        >
                          <IconUndo size={15} />
                        </button>
                      ) : (
                        <span className="small muted nowrap">by {s.releasedBy || '—'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="table-note">
            <span>
              {data.total.toLocaleString('en-GB')} records · student edits made via reference number
              are highlighted with full history
            </span>
          </div>
        </>
      )}

      {/* Inspect & edit history modal */}
      <Modal
        open={Boolean(inspecting)}
        onClose={() => setInspecting(null)}
        wide
        title={`Selection record · ${inspecting?.ref || ''}`}
        sub={
          inspecting
            ? `${inspecting.student?.names || '—'} (${inspecting.student?.regNo || '—'})`
            : ''
        }
        foot={
          <Btn variant="primary" onClick={() => setInspecting(null)}>
            Close
          </Btn>
        }
      >
        {inspecting && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="order-summary-grid">
              <div>
                <span className="order-k">Student</span>
                <span className="order-v">{inspecting.student?.names || '—'}</span>
              </div>
              <div>
                <span className="order-k">Registration number</span>
                <span className="order-v mono">{inspecting.student?.regNo || '—'}</span>
              </div>
              <div>
                <span className="order-k">Supervisor name</span>
                <span className="order-v">{inspecting.student?.supervisorName || '—'}</span>
              </div>
              <div>
                <span className="order-k">Phone</span>
                <span className="order-v mono">{phoneDisplay(inspecting.student?.phone)}</span>
              </div>
              <div className="order-span-2">
                <span className="order-k">Current title ({inspecting.title?.code || '—'})</span>
                <span className="order-v">{inspecting.title?.text || '—'}</span>
              </div>
              {inspecting.previousTitleText && (
                <div className="order-span-2">
                  <span className="order-k">
                    Previous title ({inspecting.previousTitleCode || '—'})
                  </span>
                  <span className="order-v small muted">{inspecting.previousTitleText}</span>
                </div>
              )}
            </div>

            <div>
              <div className="edit-history-head" style={{ marginBottom: 10 }}>
                <IconHistory size={16} />
                <strong>Edit history ({(inspecting.editHistory || []).length})</strong>
              </div>
              {!(inspecting.editHistory || []).length ? (
                <p className="small muted">No student edits have been made on this selection yet.</p>
              ) : (
                <ul className="edit-history-list">
                  {inspecting.editHistory.map((item, idx) => (
                    <li key={`${item.at}-${idx}`}>
                      <div className="edit-history-top">
                        <strong>{item.summary}</strong>
                        <span className="mono small muted">{fmtDateTime(item.at)}</span>
                      </div>
                      <div className="small muted">
                        <span style={{ textDecoration: 'line-through', opacity: 0.75 }}>
                          {item.before}
                        </span>{' '}
                        → <span>{item.after}</span>
                      </div>
                      {item.reason && item.reason !== '—' && (
                        <div className="small muted">Reason: {item.reason}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Release modal */}
      <Modal
        open={!!releasing}
        onClose={() => setReleasing(null)}
        title={`Release ${releasing?.ref}?`}
        sub="The title returns to the available pool and the action is written to the audit log."
        foot={
          <>
            <Btn variant="outline" onClick={() => setReleasing(null)}>
              Cancel
            </Btn>
            <Btn variant="danger" icon={IconUndo} onClick={confirmRelease} disabled={busy}>
              {busy ? 'Working…' : 'Release selection'}
            </Btn>
          </>
        }
      >
        <Notice tone="warn" icon={IconAlert}>
          <strong>{releasing?.student?.names}</strong> ({releasing?.student?.regNo}) currently holds{' '}
          <strong>{releasing?.title?.code}</strong>. Releasing frees that title for other students
          immediately.
        </Notice>

        <div style={{ marginTop: 16 }}>
          <Field
            label="Reason for release"
            required
            htmlFor="rreason"
            hint="Minimum 5 characters — required by rule BR-07"
          >
            <textarea
              id="rreason"
              className="inp"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Student withdrawn from the programme this semester"
            />
          </Field>
        </div>

        {reason.trim().length > 0 && reason.trim().length < 5 && (
          <p className="field-error">
            <IconAlert size={14} /> A little more detail is needed ({reason.trim().length}/5).
          </p>
        )}
      </Modal>
    </>
  );
}
