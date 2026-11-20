import { useCallback, useEffect, useState } from 'react';
import { listProgrammesAdmin, createProgramme, updateProgramme, ApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Field, Modal, Notice, StatusTag, Empty, SkeletonRows } from '../../ui/primitives';
import { IconPlus, IconSearch, IconFolder, IconPencil, IconLock, IconCheck } from '../../ui/Icons';

const EMPTY = { code: '', name: '', award: 'Bachelor Degree', department: '' };

export default function Programmes({ admin }) {
  const notify = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const [modal, setModal] = useState(null); // 'add' | programme object
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [closing, setClosing] = useState(null); // programme being closed
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listProgrammesAdmin());
    } catch {
      notify('Could not load programmes.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm(EMPTY);
    setError('');
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({ code: p.code, name: p.name, award: p.award, department: p.department, id: p.id });
    setError('');
    setModal(p);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (modal === 'add') {
        await createProgramme(form, admin);
        notify(`Programme ${form.code.toUpperCase()} created.`, 'success');
      } else {
        await updateProgramme(
          form.id,
          { name: form.name, award: form.award, department: form.department },
          admin,
          'Programme details corrected'
        );
        notify('Programme updated.', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the programme.');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    if (!closing) return;
    setBusy(true);
    try {
      const next = closing.status === 'active' ? 'inactive' : 'active';
      await updateProgramme(closing.id, { status: next }, admin, reason.trim() || '—');
      notify(next === 'active' ? 'Programme reopened.' : 'Programme closed for selection.', 'success');
      setClosing(null);
      setReason('');
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not update the status.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const filtered = rows.filter(
    (p) =>
      !q.trim() ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.code.toLowerCase().includes(q.toLowerCase()) ||
      p.department.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="table-toolbar">
        <div className="search-box" style={{ maxWidth: 340 }}>
          <IconSearch size={17} />
          <input
            className="inp"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search programme, code or department…"
            aria-label="Search programmes"
          />
        </div>
        <div style={{ flex: 1 }} />
        <Btn variant="primary" size="sm" icon={IconPlus} onClick={openAdd}>
          New programme
        </Btn>
      </div>

      <div className="table-wrap">
        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <Empty
            icon={IconFolder}
            title="No programmes match"
            text="Clear the search or create a new programme."
            action={
              <Btn variant="outline" size="sm" icon={IconPlus} onClick={openAdd}>
                New programme
              </Btn>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Programme</th>
                <th>Department</th>
                <th className="right">Titles</th>
                <th className="right">Available</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="mono strong">{p.code}</td>
                  <td>
                    <span className="strong">{p.name}</span>
                    <div className="small muted">{p.award}</div>
                  </td>
                  <td className="small">{p.department}</td>
                  <td className="mono right">{p.titleCount.toLocaleString('en-GB')}</td>
                  <td className="mono right" style={{ color: 'var(--green)' }}>
                    {p.available.toLocaleString('en-GB')}
                  </td>
                  <td>
                    <StatusTag status={p.status === 'active' ? 'available' : 'inactive'} label={p.status === 'active' ? 'Open' : 'Closed'} />
                  </td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" onClick={() => openEdit(p)} title="Edit programme" aria-label={`Edit ${p.code}`}>
                        <IconPencil size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setClosing(p);
                          setReason('');
                        }}
                        title={p.status === 'active' ? 'Close programme' : 'Reopen programme'}
                        aria-label={`${p.status === 'active' ? 'Close' : 'Reopen'} ${p.code}`}
                      >
                        {p.status === 'active' ? <IconLock size={15} /> : <IconCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-note">
        <span>
          {filtered.length} of {rows.length} programmes · counts include admin additions and
          withdrawals
        </span>
      </div>

      {/* ------------------------------------------------ add / edit */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'New programme' : `Edit ${form.code}`}
        sub={modal === 'add' ? 'Students will be able to select titles under this programme.' : 'Changes are written to the audit log.'}
        foot={
          <>
            <Btn variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={save} disabled={busy} icon={IconCheck}>
              {busy ? 'Saving…' : modal === 'add' ? 'Create programme' : 'Save changes'}
            </Btn>
          </>
        }
      >
        <form onSubmit={save}>
          {error && (
            <Notice tone="error">{error}</Notice>
          )}
          <div className="form-grid-2" style={{ marginTop: 14 }}>
            <Field label="Code" required htmlFor="pcode" hint="BAF, BBA, DACC…">
              <input
                id="pcode"
                className="inp mono"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                disabled={modal !== 'add'}
                placeholder="BAF"
              />
            </Field>
            <Field label="Award level" htmlFor="paward">
              <select
                id="paward"
                className="select"
                value={form.award}
                onChange={(e) => setForm({ ...form, award: e.target.value })}
              >
                <option>Bachelor Degree</option>
                <option>Ordinary Diploma</option>
                <option>Higher Diploma</option>
                <option>Master Degree</option>
                <option>Certificate</option>
              </select>
            </Field>
          </div>

          <Field label="Programme name" required htmlFor="pname">
            <input
              id="pname"
              className="inp"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Bachelor of Accounting and Finance"
            />
          </Field>

          <Field label="Department" htmlFor="pdept">
            <input
              id="pdept"
              className="inp"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Department of Accounting and Finance"
            />
          </Field>

          {/* hidden submit so Enter works */}
          <button type="submit" hidden />
        </form>
      </Modal>

      {/* ------------------------------------------------ close / open */}
      <Modal
        open={!!closing}
        onClose={() => setClosing(null)}
        title={closing?.status === 'active' ? `Close ${closing?.code} for selection?` : `Reopen ${closing?.code}?`}
        sub="A reason is recorded in the audit log with your name against it."
        foot={
          <>
            <Btn variant="outline" onClick={() => setClosing(null)}>
              Cancel
            </Btn>
            <Btn variant={closing?.status === 'active' ? 'danger' : 'primary'} onClick={toggleStatus} disabled={busy}>
              {busy ? 'Working…' : closing?.status === 'active' ? 'Close programme' : 'Reopen programme'}
            </Btn>
          </>
        }
      >
        <Notice tone="warn">
          {closing?.status === 'active'
            ? 'Students will no longer be able to start a selection under this programme. Existing selections are untouched.'
            : 'Students will be able to select titles under this programme again.'}
        </Notice>
        <div style={{ marginTop: 16 }}>
          <Field label="Reason" htmlFor="reason" required hint="Minimum 5 characters">
            <textarea
              id="reason"
              className="inp"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Intake closed for the 2026/2027 semester"
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
