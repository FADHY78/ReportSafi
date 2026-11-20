import { useEffect } from 'react';
import { cls } from '../lib/utils';
import {
  IconCheckCircle,
  IconAlert,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
} from './Icons';

/* ---------------------------------------------------------------- button */

export function Btn({
  variant = 'primary',
  size,
  icon: Icon,
  children,
  className,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={cls('btn', `btn-${variant}`, size && `btn-${size}`, className)}
      {...rest}
    >
      {Icon ? <Icon size={size === 'sm' ? 15 : 17} /> : null}
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- status */

const TAG_MAP = {
  available: { cls: 'tag-green', label: 'Available' },
  unavailable: { cls: 'tag-red', label: 'Unavailable' },
  active: { cls: 'tag-navy', label: 'Active' },
  inactive: { cls: 'tag-grey', label: 'Withdrawn' },
  released: { cls: 'tag-grey', label: 'Released' },
  pending: { cls: 'tag-amber', label: 'Pending' },
  confirmed: { cls: 'tag-navy', label: 'Confirmed' },
  in_progress: { cls: 'tag-amber', label: 'In progress' },
  completed: { cls: 'tag-green', label: 'Completed' },
  cancelled: { cls: 'tag-red', label: 'Cancelled' },
  edited: { cls: 'tag-amber', label: 'Edited' },
};

export function StatusTag({ status, label }) {
  const conf = TAG_MAP[status] || TAG_MAP.active;
  const dotCls =
    status === 'available' || status === 'active' || status === 'completed'
      ? 'dot-green'
      : status === 'unavailable' || status === 'cancelled'
      ? 'dot-red'
      : 'dot-navy';
  return (
    <span className={cls('tag', conf.cls)}>
      <span className={cls('dot', dotCls)} />
      {label || conf.label}
    </span>
  );
}

/* ----------------------------------------------------------------- field */

export function Field({ label, required, hint, error, htmlFor, children }) {
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error">
          <IconAlert size={14} /> {error}
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- modal */

export function Modal({ open, onClose, title, sub, children, foot, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={cls('modal', wide && 'wide')}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <IconX size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {foot && <div className="modal-foot">{foot}</div>}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- pagination */

function pageWindow(page, totalPages) {
  const pages = [];
  const push = (p) => pages.push(p);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) push(i);
    return pages;
  }
  push(1);
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);
  if (from > 2) push('…');
  for (let i = from; i <= to; i += 1) push(i);
  if (to < totalPages - 1) push('…');
  push(totalPages);
  return pages;
}

export function Pager({ page, totalPages, onPage, from = 0, to = 0, total = 0 }) {
  if (total === 0) return null;
  return (
    <div className="pager">
      <span className="pager-info">
        Showing <strong className="mono">{from}–{to}</strong> of{' '}
        <strong className="mono">{total}</strong> records
      </span>
      <div className="pager-controls">
        <button
          className="pager-btn"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <IconChevronLeft size={15} />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="pager-btn" style={{ border: 'none', background: 'transparent' }}>
              …
            </span>
          ) : (
            <button
              key={p}
              className={cls('pager-btn', p === page && 'is-current')}
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          className="pager-btn"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <IconChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ empty/skel */

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{Icon ? <Icon size={24} /> : <IconInfo size={24} />}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 6 }) {
  return (
    <div style={{ padding: 18 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 44, marginBottom: 12, opacity: 1 - i * 0.09 }}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- misc */

export function Notice({ tone = 'info', icon: Icon, children }) {
  const I = Icon || (tone === 'error' ? IconAlert : tone === 'warn' ? IconAlert : IconInfo);
  return (
    <div className={cls('notice', `notice-${tone}`)}>
      <I size={17} />
      <div>{children}</div>
    </div>
  );
}

export function ConfirmBar({ message, onConfirm, onCancel, busy }) {
  return (
    <div className="notice notice-warn" style={{ marginTop: 0 }}>
      <IconAlert size={17} />
      <div style={{ flex: 1 }}>
        <strong>{message}</strong>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <Btn variant="danger" size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : 'Yes, continue'}
          </Btn>
          <Btn variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function SuccessIcon({ size = 24 }) {
  return <IconCheckCircle size={size} />;
}
