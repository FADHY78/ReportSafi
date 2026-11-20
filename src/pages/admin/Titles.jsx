import { useCallback, useEffect, useState } from 'react';
import {
  listTitlesAdmin,
  getProgrammes,
  addTitle,
  updateTitle,
  setTitleStatus,
  validateImport,
  commitImport,
  ApiError,
} from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Field, Modal, Notice, StatusTag, Pager, Empty, SkeletonRows } from '../../ui/primitives';
import {
  IconSearch,
  IconPlus,
  IconPencil,
  IconUpload,
  IconDownload,
  IconFileText,
  IconCheck,
  IconLock,
  IconAlert,
  IconX,
} from '../../ui/Icons';
import { toCSV, downloadFile } from '../../lib/utils';

const PAGE_SIZES = [20, 50, 100];

export default function Titles({ admin }) {
  const notify = useToast();

  const [programmes, setProgrammes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [programmeId, setProgrammeId] = useState('all');
  const [status, setStatus] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  // editor modal
  const [editor, setEditor] = useState(null); // {mode:'add'|'edit', id?, text, category, programmeId}
  const [editorErr, setEditorErr] = useState('');
  const [busy, setBusy] = useState(false);

  // withdraw modal
  const [withdrawing, setWithdrawing] = useState(null);
  const [reason, setReason] = useState('');

  // import modal
  const [importOpen, setImportOpen] = useState(false);
  const [importProg, setImportProg] = useState('all');
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await listTitlesAdmin({ programmeId, q, status, page, pageSize }));
    } catch {
      notify('Could not load titles.', 'error');
    } finally {
      setLoading(false);
    }
  }, [programmeId, q, status, page, pageSize, notify]);

  useEffect(() => {
    getProgrammes({ includeInactive: true }).then(setProgrammes);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(load, 260);
    return () => window.clearTimeout(id);
  }, [load]);

  const resetFilters = () => {
    setQ('');
    setProgrammeId('all');
    setStatus('all');
    setPage(1);
  };

  /* ------------------------------------------------------------ editor */

  const openAdd = () => {
    setEditor({
      mode: 'add',
      text: '',
      category: '',
      programmeId: programmeId === 'all' ? programmes[0]?.id || '' : programmeId,
    });
    setEditorErr('');
  };

  const openEdit = (t) => {
    setEditor({ mode: 'edit', id: t.id, code: t.code, text: t.text, category: t.category, programmeId: t.programmeId });
    setEditorErr('');
  };

  const saveEditor = async () => {
    setBusy(true);
    setEditorErr('');
    try {
      if (editor.mode === 'add') {
        await addTitle({ programmeId: editor.programmeId, text: editor.text, category: editor.category }, admin);
        notify('Title added to the catalogue.', 'success');
      } else {
        await updateTitle(
          editor.id,
          { text: editor.text, category: editor.category },
          admin,
          'Wording corrected by administrator'
        );
        notify('Title updated.', 'success');
      }
      setEditor(null);
      load();
    } catch (err) {
      setEditorErr(err instanceof ApiError ? err.message : 'Could not save the title.');
    } finally {
      setBusy(false);
    }
  };

  /* --------------------------------------------------------- withdraw */

  const confirmWithdraw = async () => {
    setBusy(true);
    try {
      await setTitleStatus(withdrawing.id, 'inactive', admin, reason);
      notify(`${withdrawing.code} withdrawn from the catalogue.`, 'success');
      setWithdrawing(null);
      setReason('');
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not withdraw the title.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const restore = async (t) => {
    try {
      await setTitleStatus(t.id, 'active', admin, 'Restored to catalogue');
      notify(`${t.code} restored.`, 'success');
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not restore the title.', 'error');
    }
  };

  /* ------------------------------------------------------------ import */

  const runValidate = async () => {
    if (importProg === 'all') {
      notify('Choose a programme to import into.', 'error');
      return;
    }
    try {
      setPreview(await validateImport({ programmeId: importProg, csvText }));
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not read that CSV.', 'error');
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const res = await commitImport({ programmeId: importProg, valid: preview.valid, actor: admin });
      notify(`${res.imported} titles imported.`, 'success');
      setImportOpen(false);
      setCsvText('');
      setPreview(null);
      setProgrammeId(importProg);
      setPage(1);
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Import failed.', 'error');
    } finally {
      setImporting(false);
    }
  };

  const readFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ''));
      setPreview(null);
    };
    reader.readAsText(file);
  };

  const exportCurrent = async () => {
    try {
      const res = await listTitlesAdmin({ programmeId, q, status, page: 1, pageSize: 100000 });
      const csv = toCSV(
        ['title_code', 'title', 'category', 'programme', 'status', 'availability'],
        res.rows.map((t) => [
          t.code,
          t.text,
          t.category,
          t.programme?.code || '',
          t.status,
          t.status === 'inactive' ? 'withdrawn' : t.available ? 'available' : 'unavailable',
        ])
      );
      downloadFile('reportsafi-title-catalogue.csv', csv);
      notify(`Exported ${res.rows.length} titles.`, 'success');
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
            placeholder="Search title, code or category…"
            aria-label="Search titles"
          />
        </div>

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
          <option value="active">Active only</option>
          <option value="inactive">Withdrawn only</option>
        </select>

        <div style={{ flex: 1 }} />

        <Btn variant="outline" size="sm" icon={IconDownload} onClick={exportCurrent}>
          Export
        </Btn>
        <Btn variant="outline" size="sm" icon={IconUpload} onClick={() => { setImportProg(programmeId); setPreview(null); setImportOpen(true); }}>
          Import CSV
        </Btn>
        <Btn variant="primary" size="sm" icon={IconPlus} onClick={openAdd}>
          Add title
        </Btn>
      </div>

      <div className="table-wrap">
        {loading && !data ? (
          <SkeletonRows rows={8} />
        ) : !data || data.total === 0 ? (
          <Empty
            icon={IconFileText}
            title="No titles found"
            text="Adjust the filters, add a single title, or import a CSV catalogue."
            action={
              <Btn variant="outline" size="sm" icon={IconPlus} onClick={openAdd}>
                Add title
              </Btn>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Programme</th>
                <th>Category</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.code}</td>
                  <td className="title-cell">{t.text}</td>
                  <td className="mono">{t.programme?.code || '—'}</td>
                  <td className="small">{t.category}</td>
                  <td>
                    {t.status === 'inactive' ? (
                      <StatusTag status="inactive" />
                    ) : t.available ? (
                      <StatusTag status="available" />
                    ) : (
                      <StatusTag status="unavailable" />
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="icon-btn" onClick={() => openEdit(t)} title="Edit title" aria-label={`Edit ${t.code}`}>
                        <IconPencil size={15} />
                      </button>
                      {t.status === 'active' ? (
                        <button
                          className="icon-btn danger"
                          title="Withdraw title"
                          aria-label={`Withdraw ${t.code}`}
                          onClick={() => {
                            setWithdrawing(t);
                            setReason('');
                          }}
                        >
                          <IconLock size={15} />
                        </button>
                      ) : (
                        <button className="icon-btn" title="Restore title" aria-label={`Restore ${t.code}`} onClick={() => restore(t)}>
                          <IconCheck size={15} />
                        </button>
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
              {data.total.toLocaleString('en-GB')} titles in view · every edit is recorded in the
              audit log
            </span>
            <div className="page-size">
              <label htmlFor="tps">Rows</label>
              <select
                id="tps"
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

      {/* -------------------------------------------------- add / edit */}
      <Modal
        open={!!editor}
        onClose={() => setEditor(null)}
        title={editor?.mode === 'add' ? 'Add a title' : `Edit ${editor?.code}`}
        sub={editor?.mode === 'add' ? 'One title belongs to exactly one programme.' : 'The previous wording stays in the audit log.'}
        foot={
          <>
            <Btn variant="outline" onClick={() => setEditor(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" icon={IconCheck} onClick={saveEditor} disabled={busy}>
              {busy ? 'Saving…' : editor?.mode === 'add' ? 'Add title' : 'Save changes'}
            </Btn>
          </>
        }
      >
        {editorErr && <Notice tone="error">{editorErr}</Notice>}
        <div style={{ marginTop: editorErr ? 14 : 0 }}>
          {editor?.mode === 'add' && (
            <Field label="Programme" required htmlFor="tprog">
              <select
                id="tprog"
                className="select"
                value={editor.programmeId}
                onChange={(e) => setEditor({ ...editor, programmeId: e.target.value })}
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label="Title text"
            required
            htmlFor="ttext"
            hint={`${(editor?.text || '').length} characters — minimum 15`}
          >
            <textarea
              id="ttext"
              className="inp"
              rows="4"
              value={editor?.text || ''}
              onChange={(e) => setEditor({ ...editor, text: e.target.value })}
              placeholder="The Impact of Financial Reporting on the Financial Performance of Small and Medium Enterprises in Dar es Salaam"
            />
          </Field>

          <Field label="Category" htmlFor="tcat" hint="Optional — used for filtering">
            <input
              id="tcat"
              className="inp"
              value={editor?.category || ''}
              onChange={(e) => setEditor({ ...editor, category: e.target.value })}
              placeholder="Financial Reporting"
            />
          </Field>
        </div>
      </Modal>

      {/* ----------------------------------------------------- withdraw */}
      <Modal
        open={!!withdrawing}
        onClose={() => setWithdrawing(null)}
        title={`Withdraw ${withdrawing?.code}?`}
        sub="Withdrawn titles disappear from the student catalogue until restored."
        foot={
          <>
            <Btn variant="outline" onClick={() => setWithdrawing(null)}>
              Cancel
            </Btn>
            <Btn variant="danger" icon={IconLock} onClick={confirmWithdraw} disabled={busy}>
              {busy ? 'Working…' : 'Withdraw title'}
            </Btn>
          </>
        }
      >
        <Notice tone="warn" icon={IconAlert}>
          <strong>{withdrawing?.text}</strong>
        </Notice>
        <div style={{ marginTop: 16 }}>
          <Field label="Reason" required htmlFor="wreason" hint="Minimum 5 characters — stored in the audit log">
            <textarea
              id="wreason"
              className="inp"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate of BAF/0042"
            />
          </Field>
        </div>
      </Modal>

      {/* ------------------------------------------------------ import */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        wide
        title="Import titles from CSV"
        sub="Rows are validated before anything is written. Nothing is committed until you confirm."
        foot={
          <>
            <Btn variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Btn>
            {preview ? (
              <Btn variant="primary" icon={IconUpload} onClick={runImport} disabled={importing || preview.valid.length === 0}>
                {importing ? 'Importing…' : `Import ${preview.valid.length} titles`}
              </Btn>
            ) : (
              <Btn variant="primary" icon={IconCheck} onClick={runValidate} disabled={!csvText.trim()}>
                Validate rows
              </Btn>
            )}
          </>
        }
      >
        <Field label="Target programme" required htmlFor="iprog">
          <select id="iprog" className="select" value={importProg} onChange={(e) => { setImportProg(e.target.value); setPreview(null); }}>
            <option value="all">Select a programme…</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="CSV file" htmlFor="ifile" hint="Comma-separated values, UTF-8">
          <input id="ifile" type="file" accept=".csv,.txt,text/csv" className="inp" onChange={readFile} style={{ padding: 9 }} />
        </Field>

        <Field
          label="…or paste rows"
          htmlFor="icsv"
          hint="First row may be a header. Columns: title, category"
        >
          <textarea
            id="icsv"
            className="inp mono"
            rows="6"
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setPreview(null);
            }}
            placeholder={'title,category\nThe Impact of Digital Marketing on Consumer Behaviour in Dodoma,Digital Marketing'}
          />
        </Field>

        {preview && (
          <div style={{ marginTop: 4 }}>
            <div className="import-stats">
              <span className="import-pill">Rows read: {preview.total}</span>
              <span className="import-pill ok">Ready to import: {preview.valid.length}</span>
              <span className="import-pill bad">Rejected: {preview.rejected.length}</span>
            </div>

            {preview.rejected.length > 0 && (
              <>
                <div className="small muted" style={{ marginBottom: 8 }}>
                  Rejected rows are skipped — fix them and re-import if needed.
                </div>
                <div className="reject-list">
                  {preview.rejected.map((r) => (
                    <div className="reject-row" key={r.line}>
                      <span className="line">Row {r.line}</span>
                      <div>
                        <div>{r.text}</div>
                        <div className="why">{r.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {preview.valid.length > 0 && (
              <div className="template-note">
                First three accepted rows:
                <br />
                {preview.valid.slice(0, 3).map((v) => (
                  <span key={v.line} style={{ display: 'block', marginTop: 6 }}>
                    <code>{v.text.slice(0, 96)}</code>
                    {v.text.length > 96 ? '…' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!preview && (
          <div className="template-note">
            Expected format — <code>title,category</code>:
            <br />
            <code>
              An Assessment of the Role of Auditing in Improving Profitability of Commercial Banks in
              Mwanza,Auditing and Assurance
            </code>
            <br />
            Duplicate rows, titles already in the programme and titles under 15 characters are
            rejected automatically.
          </div>
        )}
      </Modal>

      {/* keeps the reset control reachable when filters return nothing */}
      {data && data.total === 0 && (q || programmeId !== 'all' || status !== 'all') && (
        <div className="table-note">
          <span>Nothing matches the current filters.</span>
          <Btn variant="ghost" size="sm" icon={IconX} onClick={resetFilters}>
            Reset filters
          </Btn>
        </div>
      )}
    </>
  );
}
