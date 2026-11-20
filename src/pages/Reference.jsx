import { useEffect, useState } from 'react';
import { navigate } from '../lib/router';
import { getSelectionByRef } from '../lib/api';
import { useToast } from '../lib/toast';
import { Btn, SkeletonRows, Notice, StatusTag } from '../ui/primitives';
import {
  IconCheck,
  IconCopy,
  IconPrinter,
  IconArrowRight,
  IconFileText,
  IconClock,
  IconInfo,
} from '../ui/Icons';
import { fmtDateTime, phoneDisplay } from '../lib/utils';

export default function Reference() {
  const notify = useToast();
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const ref = params.get('ref') || '';

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getSelectionByRef(ref)
      .then((r) => alive && setRecord(r))
      .catch(() => alive && setRecord(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ref]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(record.ref);
      notify('Reference number copied.', 'success');
    } catch {
      notify('Copy not available — write the number down instead.', 'error');
    }
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
        <div className="panel">
          <div className="panel-body center" style={{ padding: '52px 28px' }}>
            <div className="empty-icon">
              <IconInfo size={24} />
            </div>
            <h2 style={{ marginBottom: 10 }}>Reference not found</h2>
            <p className="muted" style={{ marginBottom: 22 }}>
              No selection matches <span className="mono">{ref || '—'}</span>. Check the reference
              number on your confirmation, or ask the Research Office.
            </p>
            <Btn variant="primary" icon={IconArrowRight} onClick={() => navigate('/catalogue')}>
              Back to the catalogue
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  const { title, student, programme } = record;

  return (
    <div className="container">
      <div className="success-wrap">
        <div className="success-mark">
          <IconCheck size={36} strokeWidth={2.6} />
        </div>
        <span className="eyebrow">Step 04 · Selection confirmed</span>
        <h1>Your title is reserved</h1>
        <p>
          The portal committed your selection and marked the title unavailable for everyone else.
          Keep the reference number below — it is your proof of reservation.
        </p>

        <div className="ref-card">
          <div className="ref-label">Selection reference</div>
          <div className="ref-code">{record.ref}</div>
          <button className="btn btn-outline btn-sm" onClick={copy}>
            <IconCopy size={15} /> Copy reference
          </button>

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
            <div className="detail-row">
              <span className="k">Student</span>
              <span className="v">{student?.names || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Registration number</span>
              <span className="v mono">{student?.regNo || '—'}</span>
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
            <div className="detail-row">
              <span className="k">Status</span>
              <span className="v">
                <StatusTag status={record.status === 'active' ? 'active' : 'released'} />
              </span>
            </div>
          </div>
        </div>

        <Notice tone="info" icon={IconClock}>
          <strong>What happens next.</strong> Your supervisor and the Research Office see this
          record. Students cannot change a selection themselves — to release or reassign it, an
          authorised administrator records a reason, and the change appears in the audit log.
        </Notice>

        <div className="success-actions" style={{ marginTop: 26 }}>
          <Btn variant="primary" icon={IconPrinter} onClick={() => window.print()}>
            Print this confirmation
          </Btn>
          <Btn variant="outline" icon={IconFileText} onClick={() => navigate('/catalogue')}>
            Browse the catalogue
          </Btn>
          <Btn variant="ghost" icon={IconArrowRight} onClick={() => navigate('/')}>
            Finish
          </Btn>
        </div>
      </div>
    </div>
  );
}
