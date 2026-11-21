import { useCallback, useEffect, useState } from 'react';
import {
  listStudentsAdmin,
  updateStudentAdmin,
  getProgrammes,
  ApiError,
} from '../../lib/api';
import { useToast } from '../../lib/toast';
import { DAR_ES_SALAAM_UNIVERSITIES } from '../../lib/institutions';
import { Btn, Field, Modal, StatusTag, Pager, Empty, SkeletonRows } from '../../ui/primitives';
import { IconSearch, IconDownload, IconUsers, IconPencil, IconRefresh } from '../../ui/Icons';
import { fmtDateTime, phoneDisplay, toCSV, downloadFile } from '../../lib/utils';

export default function Students({ admin }) {
  const notify = useToast();
  const [programmes, setProgrammes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [programmeId, setProgrammeId] = useState('all');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ names: '', phone: '', supervisorName: '', reason: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await listStudentsAdmin({ q, programmeId, filter, page, pageSize }));
    } catch {
      notify('Could not load student records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [q, programmeId, filter, page, notify]);

  useEffect(() => {
    getProgrammes({ includeInactive: true }).then(setProgrammes);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(load, 220);
    return () => window.clearTimeout(id);
  }, [load]);

  const openEdit = (st) => {
    setEditing(st);
    setForm({
      names: st.names || '',
      phone: st.phone || '',
      supervisorName: st.supervisorName || '',
      institution: st.institution || '',
      reason: '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    try {
      await updateStudentAdmin({
        id: editing.id,
        names: form.names,
        phone: form.phone,
        supervisorName: form.supervisorName,
        institution: form.institution,
        reason: form.reason,
        actor: admin,
      });
      notify(`Updated student record ${editing.regNo}.`, 'success');
      setEditing(null);
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not update student record.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await listStudentsAdmin({ q, programmeId, filter, page: 1, pageSize: 100000 });
      const csv = toCSV(
        [
          'reg_no',
          'names',
          'phone',
          'supervisor_name',
          'programme_code',
          'programme_name',
          'selection_ref',
          'title_code',
          'title',
          'edit_count',
          'updated_at',
        ],
        res.rows.map((st) => [
          st.regNo,
          st.names,
          st.phone,
          st.supervisorName || '',
          st.programmeCode || '',
          st.programmeName || '',
          st.selection?.ref || '',
          st.selection?.titleCode || '',
          st.selection?.titleText || '',
          st.selection?.editCount || 0,
          st.updatedAt || st.createdAt,
        ])
      );
      downloadFile('reportsafi-students.csv', csv);
      notify(`Exported ${res.rows.length} student records.`, 'success');
    } catch {
      notify('Export failed.', 'error');
    }
  };

  return (
    <>
      <div className="table-toolbar">
        <div className="search-box" style={{ maxWidth: 320 }}>
          <IconSearch size={17} />
          <input
            className="inp"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, reg no, phone, supervisor or ref…"
            aria-label="Search students"
          />
        </div>

        <select
          className="select"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter students"
        >
          <option value="all">All students</option>
          <option value="with_selection">With active title</option>
          <option value="without_selection">No title yet</option>
          <option value="edited">Edited selection</option>
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
        <Btn variant="outline" size="sm" icon={IconRefresh} onClick={load} disabled={loading}>
          Refresh
        </Btn>
        <Btn variant="outline" size="sm" icon={IconDownload} onClick={exportCsv}>
          Export CSV
        </Btn>
      </div>

      <div className="table-wrap">
        {loading && !data ? (
          <SkeletonRows rows={6} />
        ) : !data || data.total === 0 ? (
          <Empty
            icon={IconUsers}
            title="No student records found"
            text="Students appear here as soon as they enter their identification details on the portal."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College / Inst</th>
                <th>Supervisor</th>
                <th>Phone</th>
                <th>Programme</th>
                <th>Active selection</th>
                <th>Updated</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((st) => (
                <tr key={st.id}>
                  <td>
                    <span className="strong">{st.names}</span>
                    <div className="mono small">{st.regNo}</div>
                  </td>
                  <td><span className="badge">{st.institution || '—'}</span></td>
                  <td>{st.supervisorName || <span className="muted">—</span>}</td>
                  <td className="mono small">{phoneDisplay(st.phone)}</td>
                  <td className="mono">{st.programmeCode || '—'}</td>
                  <td className="title-cell">
                    {st.selection ? (
                      <>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="mono small strong">{st.selection.ref}</span>
                          {st.selection.editCount > 0 && (
                            <StatusTag status="edited" label={`Edited (${st.selection.editCount})`} />
                          )}
                        </div>
                        <div className="small muted">
                          <span className="mono">{st.selection.titleCode}</span> — {st.selection.titleText}
                        </div>
                      </>
                    ) : (
                      <span className="small muted">No active title</span>
                    )}
                  </td>
                  <td className="mono small nowrap">{fmtDateTime(st.updatedAt || st.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        title="Edit student details"
                        aria-label={`Edit ${st.regNo}`}
                        onClick={() => openEdit(st)}
                      >
                        <IconPencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.total > 0 && (
        <Pager
          page={data.page}
          totalPages={data.totalPages}
          onPage={setPage}
          from={data.from}
          to={data.to}
          total={data.total}
        />
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit student · ${editing?.regNo || ''}`}
        sub="Changes are saved to the database and recorded in the audit log."
        foot={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Btn>
            <Btn type="submit" form="admin-student-edit" variant="gold" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </Btn>
          </>
        }
      >
        <form id="admin-student-edit" onSubmit={saveEdit}>
          <Field label="Full names" required htmlFor="st-names">
            <input
              id="st-names"
              className="inp"
              value={form.names}
              onChange={(e) => setForm((f) => ({ ...f, names: e.target.value }))}
            />
          </Field>
          <Field label="College / University (Dar es Salaam)" htmlFor="st-inst">
            <select
              id="st-inst"
              className="select"
              value={form.institution}
              onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
            >
              <option value="">-- Select Dar es Salaam University / College --</option>
              {DAR_ES_SALAAM_UNIVERSITIES.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="form-grid-2">
            <Field label="Phone" required htmlFor="st-phone">
              <input
                id="st-phone"
                className="inp mono"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
            <Field label="Supervisor name" htmlFor="st-sup">
              <input
                id="st-sup"
                className="inp"
                value={form.supervisorName}
                onChange={(e) => setForm((f) => ({ ...f, supervisorName: e.target.value }))}
                placeholder="Dr. Asha Mnyamzi"
              />
            </Field>
          </div>
          <Field label="Reason for update (optional)" htmlFor="st-reason">
            <input
              id="st-reason"
              className="inp"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="e.g. Corrected supervisor assignment"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
