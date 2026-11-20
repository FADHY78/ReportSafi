import { useEffect, useState } from 'react';
import { navigate, useRoute } from '../lib/router';
import {
  reserve,
  changeSelectionTitle,
  getSelectionByRef,
  getTitleById,
  ApiError,
} from '../lib/api';
import { useToast } from '../lib/toast';
import { Btn, Field, Notice, SkeletonRows } from '../ui/primitives';
import { IconArrowLeft, IconCheck, IconAlert, IconLock, IconShield, IconRefresh } from '../ui/Icons';

export default function Confirm({ session, onSyncSession }) {
  const notify = useToast();
  const { query } = useRoute();
  const titleId = query?.get('title') || '';
  const editRef = (query?.get('editRef') || '').trim().toUpperCase();

  const [title, setTitle] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [supervisorName, setSupervisorName] = useState(session?.student?.supervisorName || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const student = session?.student;
  const programme = session?.programme;
  const isEditMode = Boolean(editRef);

  useEffect(() => {
    let alive = true;
    if (!titleId) {
      setLoading(false);
      return () => {};
    }
    Promise.all([
      getTitleById(titleId),
      editRef ? getSelectionByRef(editRef) : Promise.resolve(null),
    ])
      .then(([t, sel]) => {
        if (!alive) return;
        const targetProgId = student?.programmeId || sel?.student?.programmeId;
        if (t && targetProgId && t.programmeId !== targetProgId) setTitle(null);
        else setTitle(t);
        setCurrentSelection(sel);
        if (sel?.student?.supervisorName) {
          setSupervisorName(sel.student.supervisorName);
        } else if (student?.supervisorName) {
          setSupervisorName(student.supervisorName);
        }
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [titleId, editRef, student?.programmeId, student?.supervisorName]);

  const confirm = async () => {
    if (!title || busy) return;
    setBusy(true);
    setError('');
    try {
      if (isEditMode) {
        const updated = await changeSelectionTitle({
          ref: editRef,
          newTitleId: title.id,
          supervisorName,
          reason,
        });
        if (updated?.student && updated?.programme && onSyncSession) {
          onSyncSession({ student: updated.student, programme: updated.programme });
        }
        notify('Title changed successfully and recorded in the database.', 'success');
        navigate(`/reference?ref=${encodeURIComponent(updated.ref)}`);
      } else {
        const selection = await reserve({ studentId: student.id, titleId: title.id });
        notify('Title reserved successfully.', 'success');
        navigate(`/reference?ref=${encodeURIComponent(selection.ref)}`);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'The selection could not be completed.';
      setError(msg);
      notify(msg, 'error');
      if (err.code === 'unavailable' || err.code === 'already_selected') {
        const dest = isEditMode ? `/catalogue?editRef=${encodeURIComponent(editRef)}` : '/catalogue';
        window.setTimeout(() => navigate(dest), 1600);
      }
      setBusy(false);
    }
  };

  if (!student) return null;

  const backTarget = isEditMode
    ? `/catalogue?editRef=${encodeURIComponent(editRef)}`
    : '/catalogue';

  return (
    <div className="container">
      <div className="cat-head">
        <span className="eyebrow">
          {isEditMode ? `Change Title · ${editRef}` : 'Step 03 · Confirmation'}
        </span>
        <h1>{isEditMode ? 'Confirm your new title' : 'Confirm this title for yourself'}</h1>
        <p className="lead" style={{ maxWidth: '62ch' }}>
          {isEditMode
            ? 'Review the title change below. Confirming frees your previous title immediately, reserves the new title under the same reference number, and logs the edit.'
            : 'Check every field below. Pressing confirm sends the request to the portal, which checks availability one final time before it commits.'}
        </p>
      </div>

      {error && (
        <Notice tone="error" icon={IconAlert}>
          {error}
        </Notice>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <span className="panel-title">
            <IconShield size={17} /> {isEditMode ? 'Title change summary' : 'Selection summary'}
          </span>
          <span className="tag tag-amber">
            {isEditMode ? `Editing ${editRef}` : 'Not yet reserved'}
          </span>
        </div>

        <div className="panel-body">
          {loading ? (
            <SkeletonRows rows={3} />
          ) : !title ? (
            <Notice tone="error" icon={IconAlert}>
              That title could not be found in your programme.{' '}
              <button
                className="btn btn-outline btn-sm"
                style={{ marginLeft: 8 }}
                onClick={() => navigate(backTarget)}
              >
                Back to catalogue
              </button>
            </Notice>
          ) : (
            <>
              <div className="review-grid">
                {isEditMode && currentSelection?.title && (
                  <div className="review-item wide">
                    <div className="k">Previous title (will be released)</div>
                    <div className="v small muted" style={{ lineHeight: 1.5 }}>
                      <span className="mono">{currentSelection.title.code}</span> —{' '}
                      {currentSelection.title.text}
                    </div>
                  </div>
                )}
                <div className="review-item wide">
                  <div className="k">{isEditMode ? 'New title to reserve' : 'Title to be reserved'}</div>
                  <div className="v" style={{ fontFamily: 'var(--serif)', fontSize: '1.08rem', lineHeight: 1.5 }}>
                    {title.text}
                  </div>
                </div>
                <div className="review-item">
                  <div className="k">Title code</div>
                  <div className="v mono">{title.code}</div>
                </div>
                <div className="review-item">
                  <div className="k">Category</div>
                  <div className="v">{title.category}</div>
                </div>
                <div className="review-item">
                  <div className="k">Student</div>
                  <div className="v">{student.names}</div>
                </div>
                <div className="review-item">
                  <div className="k">Registration number</div>
                  <div className="v mono">{student.regNo}</div>
                </div>
                <div className="review-item">
                  <div className="k">Supervisor name</div>
                  <div className="v">{student.supervisorName || '—'}</div>
                </div>
                <div className="review-item">
                  <div className="k">Phone number</div>
                  <div className="v mono">{student.phone}</div>
                </div>
                <div className="review-item wide">
                  <div className="k">Programme</div>
                  <div className="v">
                    {programme?.code} — {programme?.name}
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="form-grid-2" style={{ marginTop: 18 }}>
                  <Field
                    label="Supervisor name"
                    htmlFor="change-sup"
                    hint="Edit your supervisor info if it has changed"
                  >
                    <input
                      id="change-sup"
                      className="inp"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="Dr. Asha Mnyamzi"
                    />
                  </Field>
                  <Field
                    label="Reason for changing title (optional)"
                    htmlFor="change-reason"
                    hint="Recorded in the database and visible to administrators"
                  >
                    <input
                      id="change-reason"
                      className="inp"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Supervisor advised selecting a more specific topic"
                    />
                  </Field>
                </div>
              )}

              <Notice tone={isEditMode ? 'info' : 'warn'} icon={isEditMode ? IconRefresh : IconLock}>
                {isEditMode ? (
                  <>
                    <strong>Your reference number stays {editRef}.</strong> Your previous title will
                    become available for other students immediately, and both the old and new titles
                    will be recorded in your edit history.
                  </>
                ) : (
                  <>
                    <strong>Keep your reference number after confirming.</strong> One student holds
                    one active title at a time — if you ever need to edit your details or switch to
                    another available title, you can use your reference number to do so.
                  </>
                )}
              </Notice>

              <div className="confirm-actions">
                <Btn
                  variant="gold"
                  size="lg"
                  icon={isEditMode ? IconRefresh : IconCheck}
                  onClick={confirm}
                  disabled={busy}
                >
                  {busy
                    ? 'Saving with the portal…'
                    : isEditMode
                    ? 'Confirm title change'
                    : 'Confirm selection'}
                </Btn>
                <Btn variant="outline" size="lg" icon={IconArrowLeft} onClick={() => navigate(backTarget)}>
                  Go back and browse
                </Btn>
              </div>

              <p className="form-footnote">
                <IconShield size={14} />
                The portal re-checks that this title is still free at the moment you confirm. If
                another student wins the race you will be told immediately and returned to the
                catalogue.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
