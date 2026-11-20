import { useEffect, useState } from 'react';
import { navigate } from '../lib/router';
import { reserve, getTitleById, ApiError } from '../lib/api';
import { useToast } from '../lib/toast';
import { Btn, Notice, SkeletonRows } from '../ui/primitives';
import { IconArrowLeft, IconCheck, IconAlert, IconLock, IconShield } from '../ui/Icons';

export default function Confirm({ session }) {
  const notify = useToast();
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const titleId = params.get('title');

  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const student = session?.student;
  const programme = session?.programme;

  useEffect(() => {
    let alive = true;
    if (!titleId) {
      setLoading(false);
      return () => {};
    }
    getTitleById(titleId)
      .then((t) => {
        if (!alive) return;
        // PRD BR-06 — you may only confirm a title from your own programme
        if (t && student?.programmeId && t.programmeId !== student.programmeId) setTitle(null);
        else setTitle(t);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [titleId, student?.programmeId]);

  const confirm = async () => {
    if (!title || busy) return;
    setBusy(true);
    setError('');
    try {
      const selection = await reserve({ studentId: student.id, titleId: title.id });
      notify('Title reserved successfully.', 'success');
      navigate(`/reference?ref=${encodeURIComponent(selection.ref)}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'The selection could not be completed.';
      setError(msg);
      notify(msg, 'error');
      if (err.code === 'unavailable' || err.code === 'already_selected') {
        window.setTimeout(() => navigate('/catalogue'), 1600);
      }
      setBusy(false);
    }
  };

  if (!student) return null;

  return (
    <div className="container">
      <div className="cat-head">
        <span className="eyebrow">Step 03 · Confirmation</span>
        <h1>Confirm this title for yourself</h1>
        <p className="lead" style={{ maxWidth: '62ch' }}>
          Check every field below. Pressing confirm sends the request to the portal, which checks
          availability one final time before it commits.
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
            <IconShield size={17} /> Selection summary
          </span>
          <span className="tag tag-amber">Not yet reserved</span>
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
                onClick={() => navigate('/catalogue')}
              >
                Back to catalogue
              </button>
            </Notice>
          ) : (
            <>
              <div className="review-grid">
                <div className="review-item wide">
                  <div className="k">Title to be reserved</div>
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
                  <div className="k">Phone number</div>
                  <div className="v mono">{student.phone}</div>
                </div>
                <div className="review-item">
                  <div className="k">Programme</div>
                  <div className="v">
                    {programme?.code} — {programme?.name}
                  </div>
                </div>
              </div>

              <Notice tone="warn" icon={IconLock}>
                <strong>Only one title per student.</strong> After confirming you cannot change this
                selection yourself. A correction or release must be requested from the Research
                Office and is recorded in the audit log with a reason.
              </Notice>

              <div className="confirm-actions">
                <Btn variant="gold" size="lg" icon={IconCheck} onClick={confirm} disabled={busy}>
                  {busy ? 'Confirming with the portal…' : 'Confirm selection'}
                </Btn>
                <Btn variant="outline" size="lg" icon={IconArrowLeft} onClick={() => navigate('/catalogue')}>
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
