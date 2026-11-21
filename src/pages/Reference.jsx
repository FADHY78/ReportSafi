import { useCallback, useEffect, useState } from 'react';
import { navigate, useRoute } from '../lib/router';
import { getSelectionByRef, updateSelectionDetails, ApiError } from '../lib/api';
import { useToast } from '../lib/toast';
import { useLanguage } from '../lib/i18n';
import { DAR_ES_SALAAM_UNIVERSITIES, getInstitutionName } from '../lib/institutions';
import { Btn, Field, SkeletonRows, Notice, StatusTag } from '../ui/primitives';
import {
  IconCheck,
  IconCopy,
  IconPrinter,
  IconArrowRight,
  IconFileText,
  IconClock,
  IconInfo,
  IconPencil,
  IconRefresh,
  IconAlert,
  IconHistory,
  IconUserCheck,
} from '../ui/Icons';
import { fmtDateTime, phoneDisplay } from '../lib/utils';

export default function Reference({ onSyncSession }) {
  const notify = useToast();
  const { query } = useRoute();
  const ref = (query?.get('ref') || '').trim();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(Boolean(ref));
  const [lookupInput, setLookupInput] = useState(ref);

  const { t } = useLanguage();
  const [editBusy, setEditBusy] = useState(false);
  const [editForm, setEditForm] = useState({ names: '', phone: '', supervisorName: '', institution: '', reason: '' });
  const [editErrors, setEditErrors] = useState({});

  const syncFormFromRecord = (r) => {
    if (!r) return;
    setEditForm({
      names: r.student?.names || '',
      phone: r.student?.phone || '',
      supervisorName: r.student?.supervisorName || '',
      institution: r.student?.institution || '',
      reason: '',
    });
    setEditErrors({});
  };

  const loadRecord = useCallback(
    async (targetRef) => {
      if (!targetRef) {
        setRecord(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const r = await getSelectionByRef(targetRef);
        setRecord(r);
        syncFormFromRecord(r);
        if (r?.student && r?.programme && onSyncSession) {
          onSyncSession({ student: r.student, programme: r.programme });
        }
      } catch {
        setRecord(null);
      } finally {
        setLoading(false);
      }
    },
    [onSyncSession]
  );

  useEffect(() => {
    setLookupInput(ref);
    loadRecord(ref);
  }, [ref, loadRecord]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(record.ref);
      notify(t('ref_copied', 'Imenakiliwa!'), 'success');
    } catch {
      notify('Copy not available — write the number down instead.', 'error');
    }
  };

  const saveEditDetails = async (e) => {
    e.preventDefault();
    const errs = {};
    if (editForm.names.trim().split(/\s+/).filter(Boolean).length < 2) {
      errs.names = t('err_names', 'Weka majina yako kamili (angalau majina mawili).');
    }
    if (!editForm.phone.trim()) {
      errs.phone = t('err_phone', 'Weka namba sahihi ya simu.');
    }
    if (editForm.supervisorName.trim().length < 2) {
      errs.supervisorName = t('err_supervisor', 'Weka jina kamili la msimamizi wako.');
    }
    setEditErrors(errs);
    if (Object.keys(errs).length) return;

    setEditBusy(true);
    try {
      const updated = await updateSelectionDetails({
        ref: record.ref,
        names: editForm.names,
        phone: editForm.phone,
        supervisorName: editForm.supervisorName,
        institution: editForm.institution,
        reason: editForm.reason,
      });
      setRecord(updated);
      syncFormFromRecord(updated);
      if (updated?.student && updated?.programme && onSyncSession) {
        onSyncSession({ student: updated.student, programme: updated.programme });
      }
      notify('Taarifa za msimamizi na mwanafunzi zimehifadhiwa kikamilifu.', 'success');
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Imeshindwa kurekebisha taarifa zako.', 'error');
    } finally {
      setEditBusy(false);
    }
  };

  const goChangeTitle = () => {
    if (!record) return;
    if (record.student && record.programme && onSyncSession) {
      onSyncSession({ student: record.student, programme: record.programme });
    }
    navigate(`/catalogue?editRef=${encodeURIComponent(record.ref)}`);
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    const clean = lookupInput.trim().toUpperCase();
    if (!clean) {
      notify('Enter your reference number first.', 'error');
      return;
    }
    navigate(`/reference?ref=${encodeURIComponent(clean)}`);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 56 }}>
        <div className="panel">
          <div className="panel-body">
            <SkeletonRows rows={4} />
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container" style={{ paddingTop: 56 }}>
        <div className="panel" style={{ maxWidth: 620, margin: '0 auto' }}>
          <div className="panel-body center" style={{ padding: '48px 28px' }}>
            <div className="empty-icon">
              <IconInfo size={24} />
            </div>
            <h2 style={{ marginBottom: 10 }}>
              {ref ? 'Reference not found' : 'Open your selection by reference number'}
            </h2>
            <p className="muted" style={{ marginBottom: 22 }}>
              {ref ? (
                <>
                  No selection matches <span className="mono">{ref}</span>. Check the reference
                  number on your confirmation and try again.
                </>
              ) : (
                'Enter your reservation reference number below to view your confirmation, edit your supervisor and student details, or select another title.'
              )}
            </p>

            <form
              className="ref-lookup-row"
              style={{ maxWidth: 460, margin: '0 auto 20px' }}
              onSubmit={handleLookupSubmit}
            >
              <input
                className="inp mono"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="RS-TS-2026-00001"
                aria-label="Selection reference number"
                spellCheck="false"
              />
              <Btn type="submit" variant="gold" icon={IconArrowRight}>
                Find
              </Btn>
            </form>

            <Btn variant="outline" icon={IconFileText} onClick={() => navigate('/')}>
              Back to home
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  const { title, student, programme } = record;
  const editHistory = Array.isArray(record.editHistory) ? record.editHistory : [];
  const isEdited = (record.editCount || 0) > 0;

  return (
    <div className="container">
      <div className="success-wrap">
        <div className="success-mark">
          <IconCheck size={36} strokeWidth={2.6} />
        </div>
        <span className="eyebrow">Step 04 · Selection confirmed</span>
        <h1>{isEdited ? 'Your reservation is updated' : 'Your title is reserved'}</h1>
        <p>
          The portal committed your selection and marked the title unavailable for everyone else.
          Keep the reference number below — you can use it anytime to edit your supervisor info,
          update student details, or select another available title.
        </p>

        <div className="ref-card">
          <div className="ref-label">Selection reference</div>
          <div className="ref-code">{record.ref}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={copy}>
              <IconCopy size={15} /> Copy reference
            </button>
            {isEdited && (
              <StatusTag status="edited" label={`Edited (${record.editCount})`} />
            )}
          </div>

          <div className="detail-list">
            <div className="detail-row">
              <span className="k">Title</span>
              <span className="v" style={{ maxWidth: '62%', fontFamily: 'var(--serif)' }}>
                {title?.text || '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Title code</span>
              <span className="v mono">{title?.code || '—'}</span>
            </div>
            {record.previousTitleText && (
              <div className="detail-row">
                <span className="k">Previous title</span>
                <span className="v small muted" style={{ maxWidth: '62%' }}>
                  <span className="mono">{record.previousTitleCode}</span> — {record.previousTitleText}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="k">Student</span>
              <span className="v">{student?.names || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Namba ya usajili</span>
              <span className="v mono">{student?.regNo || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Chuo Kikuu / Taasisi</span>
              <span className="v">{getInstitutionName(student?.institution) || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Msimamizi wa Utafiti (Supervisor)</span>
              <span className="v">
                {student?.supervisorName || <span className="muted">Haijawekwa — jaza hapa chini</span>}
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Programme</span>
              <span className="v">
                {programme ? `${programme.code} — ${programme.name}` : '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Phone number</span>
              <span className="v mono">{phoneDisplay(student?.phone)}</span>
            </div>
            <div className="detail-row">
              <span className="k">Reserved on</span>
              <span className="v mono">{fmtDateTime(record.selectedAt)}</span>
            </div>
            {record.editedAt && (
              <div className="detail-row">
                <span className="k">Last edited</span>
                <span className="v mono">{fmtDateTime(record.editedAt)}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="k">Status</span>
              <span className="v">
                <StatusTag status={record.status === 'active' ? 'active' : 'released'} />
              </span>
            </div>
          </div>

          {editHistory.length > 0 && (
            <div className="edit-history-box no-print">
              <div className="edit-history-head">
                <IconHistory size={15} />
                <strong>Edit history ({editHistory.length})</strong>
              </div>
              <ul className="edit-history-list">
                {editHistory.map((item, idx) => (
                  <li key={`${item.at}-${idx}`}>
                    <div className="edit-history-top">
                      <strong>{item.summary}</strong>
                      <span className="mono small muted">{fmtDateTime(item.at)}</span>
                    </div>
                    <div className="small muted">
                      <span style={{ textDecoration: 'line-through', opacity: 0.75 }}>{item.before}</span>{' '}
                      → <span>{item.after}</span>
                    </div>
                    {item.reason && item.reason !== '—' && (
                      <div className="small muted">Note: {item.reason}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {record.status === 'active' ? (
          <form className="panel ref-edit-panel no-print" onSubmit={saveEditDetails} noValidate>
            <div className="panel-head">
              <span className="panel-title">
                <IconUserCheck size={17} /> Edit supervisor &amp; student info
              </span>
              <span className="mono small muted">{record.ref}</span>
            </div>
            <div className="panel-body">
              <p className="small muted" style={{ marginBottom: 16 }}>
                Update your supervisor name, full names, or active phone number using your reference
                number. All edits are saved to the database and recorded in your edit history.
              </p>

              <Field
                label="Chuo Kikuu / Taasisi (Dar es Salaam)"
                htmlFor="ed-inst"
                hint="CBE, DMI, NIT, IFM, TIA, UDSM, DIT, MUHAS, n.k."
              >
                <select
                  id="ed-inst"
                  className="select"
                  value={editForm.institution}
                  onChange={(e) => setEditForm((f) => ({ ...f, institution: e.target.value }))}
                >
                  <option value="">-- Chagua Chuo Kikuu / Taasisi ya Dar es Salaam --</option>
                  {DAR_ES_SALAAM_UNIVERSITIES.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Msimamizi wa Utafiti (Supervisor)"
                required
                htmlFor="ed-sup"
                error={editErrors.supervisorName}
                hint="Mfano: Dr. Asha Mnyamzi"
              >
                <input
                  id="ed-sup"
                  className="inp"
                  value={editForm.supervisorName}
                  onChange={(e) => {
                    setEditForm((f) => ({ ...f, supervisorName: e.target.value }));
                    setEditErrors((er) => ({ ...er, supervisorName: '' }));
                  }}
                  placeholder="Dr. Asha Mnyamzi"
                />
              </Field>

              <div className="form-grid-2">
                <Field label="Full names" required htmlFor="ed-names" error={editErrors.names}>
                  <input
                    id="ed-names"
                    className="inp"
                    value={editForm.names}
                    onChange={(e) => {
                      setEditForm((f) => ({ ...f, names: e.target.value }));
                      setEditErrors((er) => ({ ...er, names: '' }));
                    }}
                  />
                </Field>
                <Field label="Active phone" required htmlFor="ed-phone" error={editErrors.phone}>
                  <input
                    id="ed-phone"
                    className="inp mono"
                    value={editForm.phone}
                    onChange={(e) => {
                      setEditForm((f) => ({ ...f, phone: e.target.value }));
                      setEditErrors((er) => ({ ...er, phone: '' }));
                    }}
                    inputMode="tel"
                  />
                </Field>
              </div>

              <Field
                label="Reason for update (optional)"
                htmlFor="ed-reason"
                hint="Briefly note what changed (e.g. assigned new supervisor)"
              >
                <input
                  id="ed-reason"
                  className="inp"
                  value={editForm.reason}
                  onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Updated assigned supervisor"
                />
              </Field>

              <div className="ref-edit-actions">
                <Btn type="submit" variant="gold" icon={IconPencil} disabled={editBusy}>
                  {editBusy ? 'Saving changes…' : 'Save supervisor & details'}
                </Btn>
                <Btn type="button" variant="outline" icon={IconRefresh} onClick={goChangeTitle}>
                  Select another title
                </Btn>
              </div>
            </div>
          </form>
        ) : (
          <Notice tone="warn" icon={IconAlert}>
            <strong>This reservation was released.</strong> Reason: {record.releaseReason || '—'}.
            You can identify yourself again on the home page to select a new title.
          </Notice>
        )}

        <Notice tone="info" icon={IconClock}>
          <strong>Tracked in the database.</strong> Every update to your supervisor info, student
          details, or selected title is recorded against reference{' '}
          <span className="mono">{record.ref}</span> for your supervisor and the Research Office.
        </Notice>

        <div className="success-actions" style={{ marginTop: 26 }}>
          <Btn variant="primary" icon={IconPrinter} onClick={() => window.print()}>
            Print confirmation
          </Btn>
          {record.status === 'active' && (
            <Btn variant="outline" icon={IconRefresh} onClick={goChangeTitle}>
              Select another title
            </Btn>
          )}
          <Btn variant="ghost" icon={IconArrowRight} onClick={() => navigate('/')}>
            Finish
          </Btn>
        </div>
      </div>
    </div>
  );
}
