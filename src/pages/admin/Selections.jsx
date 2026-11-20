import { useCallback, useEffect, useState } from 'react';
import { listSelections, releaseSelection, getProgrammes, ApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Field, Modal, Notice, StatusTag, Pager, Empty, SkeletonRows } from '../../ui/primitives';
import { IconSearch, IconDownload, IconUndo, IconUsers, IconAlert } from '../../ui/Icons';
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
      await releaseSelection({ selectionId: releasing.id, reason, admin });
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
        ['reference', 'reg_no', 'names', 'phone', 'programme', 'title_code', 'title', 'status', 'selected_at', 'released_at', 'release_reason'],
        res.rows.map((s) => [
          s.ref,
          s.student?.regNo || '',
          s.student?.names || '',
          s.student?.phone || '',
          s.programme?.code || '',
          s.title?.code || '',
          s.title?.text || '',
          s.status,
          s.selectedAt,
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
            placeholder="Search reference, reg no, name, phone or title…"
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
            text="Once students confirm a title, their records appear here with the reference number, phone number and timestamp."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Student</th>
                <th>Phone</th>
                <th>Programme</th>
                <th>Title</th>
                <th>Selected</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((s) => (
                <tr key={s.id}>
                  <td className="mono strong">{s.ref}</td>
                  <td>
                    <span className="strong">{s.student?.names || '—'}</span>
                    <div className="mono small">{s.student?.regNo || '—'}</div>
                  </td>
                  <td className="mono">{phoneDisplay(s.student?.phone)}</td>
                  <td className="mono">{s.programme?.code || '—'}</td>
                  <td className="title-cell">
                    <span className="mono small" style={{ display: 'block', color: 'var(--muted)' }}>
                      {s.title?.code || '—'}
                    </span>
                    {s.title?.text || 'Title removed'}
                  </td>
                  <td className="mono small">{fmtDateTime(s.selectedAt)}</td>
                  <td>
                    <StatusTag status={s.status} />
                    {s.status === 'released' && (
                      <div className="small muted" style={{ marginTop: 6, maxWidth: 190 }}>
                        {s.releaseReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions">
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
              {data.total.toLocaleString('en-GB')} records · phone numbers are visible to authorised
              administrators only
            </span>
          </div>
        </>
      )}

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
