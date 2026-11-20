import { useCallback, useEffect, useState } from 'react';
import { listOrders, updateOrder, ApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Field, Modal, StatusTag, Pager, Empty, SkeletonRows } from '../../ui/primitives';
import {
  IconSearch,
  IconDownload,
  IconShoppingBag,
  IconRefresh,
  IconPencil,
  IconWhatsApp,
  IconClock,
  IconCheckCircle,
  IconAlert,
} from '../../ui/Icons';
import { fmtDateTime, phoneDisplay, toCSV, downloadFile } from '../../lib/utils';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PACKAGE_OPTIONS = [
  'Research Proposal',
  'Research Proposal + Research Report',
  'Research Report',
];

function Kpi({ label, value, tone, icon: Icon }) {
  return (
    <div className={`kpi${tone ? ` is-${tone}` : ''}`}>
      <div className="kpi-head">
        <span className="kpi-label">{label}</span>
        <Icon size={17} />
      </div>
      <div className="kpi-value">{Number(value || 0).toLocaleString('en-GB')}</div>
    </div>
  );
}

function waHref(order) {
  const digits = String(order.phone || '').replace(/\D/g, '');
  const text = `Hello ${order.names}, regarding your Report Safi order ${order.ref} (${order.packageName} — ${order.price}).`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default function Orders({ admin }) {
  const notify = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [packageName, setPackageName] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [active, setActive] = useState(null);
  const [nextStatus, setNextStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await listOrders({ q, status, packageName, page, pageSize }));
    } catch {
      notify('Could not load package orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [q, status, packageName, page, notify]);

  useEffect(() => {
    const id = window.setTimeout(load, 220);
    return () => window.clearTimeout(id);
  }, [load]);

  const openManage = (order) => {
    setActive(order);
    setNextStatus(order.status || 'pending');
    setAdminNotes(order.adminNotes || '');
    setReason('');
  };

  const saveOrder = async (e) => {
    e.preventDefault();
    if (!active || busy) return;
    setBusy(true);
    try {
      await updateOrder({
        id: active.id,
        status: nextStatus,
        adminNotes,
        reason,
        actor: admin,
      });
      notify(`Order ${active.ref} updated to ${nextStatus.replace('_', ' ')}.`, 'success');
      setActive(null);
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not update order.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await listOrders({ q, status, packageName, page: 1, pageSize: 100000 });
      const csv = toCSV(
        [
          'order_ref',
          'status',
          'package',
          'price',
          'student_names',
          'reg_no',
          'phone',
          'supervisor_name',
          'institution',
          'programme',
          'selection_ref',
          'title',
          'student_notes',
          'admin_notes',
          'created_at',
        ],
        res.rows.map((o) => [
          o.ref,
          o.status,
          o.packageName,
          o.price,
          o.names,
          o.regNo,
          o.phone,
          o.supervisorName || '',
          o.institution || '',
          o.programme,
          o.selectionRef || '',
          o.title || '',
          o.notes || '',
          o.adminNotes || '',
          o.createdAt,
        ])
      );
      downloadFile('reportsafi-package-orders.csv', csv);
      notify(`Exported ${res.rows.length} orders.`, 'success');
    } catch {
      notify('Export failed.', 'error');
    }
  };

  const counts = data?.counts || { total: 0, pending: 0, in_progress: 0, completed: 0 };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Kpi label="Total orders" value={counts.total} tone="navy" icon={IconShoppingBag} />
        <Kpi label="Pending review" value={counts.pending} tone="gold" icon={IconAlert} />
        <Kpi label="In progress" value={counts.in_progress} icon={IconClock} />
        <Kpi label="Completed" value={counts.completed} tone="green" icon={IconCheckCircle} />
      </div>

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
            placeholder="Search ref, student, reg no, supervisor, title…"
            aria-label="Search orders"
          />
        </div>

        <select
          className="select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by order status"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={packageName}
          onChange={(e) => {
            setPackageName(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by package"
        >
          <option value="all">All packages</option>
          {PACKAGE_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
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
            icon={IconShoppingBag}
            title="No package orders yet"
            text="When students place orders from the Pricing page, they appear here with their full details and status."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ref</th>
                <th>Student &amp; Supervisor</th>
                <th>Package</th>
                <th>Programme &amp; Topic</th>
                <th>Status</th>
                <th>Placed</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((o) => (
                <tr key={o.id}>
                  <td className="mono strong nowrap">{o.ref}</td>
                  <td>
                    <span className="strong">{o.names}</span>
                    <div className="mono small">{o.regNo}</div>
                    <div className="mono small muted">{phoneDisplay(o.phone)}</div>
                    {o.supervisorName && (
                      <div className="small muted">Sup: {o.supervisorName}</div>
                    )}
                  </td>
                  <td>
                    <span className="strong">{o.packageName}</span>
                    <div className="mono small" style={{ color: 'var(--gold-ink)' }}>
                      {o.price}
                    </div>
                  </td>
                  <td className="title-cell">
                    <span className="small strong" style={{ display: 'block' }}>
                      {o.institution ? `${o.institution} · ${o.programme}` : o.programme}
                    </span>
                    {o.title ? (
                      <span className="small muted">
                        {o.selectionRef ? `[${o.selectionRef}] ` : ''}
                        {o.title}
                      </span>
                    ) : (
                      <span className="small muted">No topic specified yet</span>
                    )}
                    {o.notes && (
                      <div className="small muted" style={{ marginTop: 4 }}>
                        Note: {o.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusTag status={o.status} />
                    {o.adminNotes && (
                      <div className="small muted" style={{ marginTop: 6, maxWidth: 180 }}>
                        {o.adminNotes}
                      </div>
                    )}
                  </td>
                  <td className="mono small nowrap">{fmtDateTime(o.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <a
                        className="icon-btn"
                        href={waHref(o)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Message student on WhatsApp"
                        aria-label={`Message ${o.names} on WhatsApp`}
                      >
                        <IconWhatsApp size={15} />
                      </a>
                      <button
                        className="icon-btn"
                        title="Manage order"
                        aria-label={`Manage ${o.ref}`}
                        onClick={() => openManage(o)}
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
        open={Boolean(active)}
        onClose={() => setActive(null)}
        wide
        title={`Manage order · ${active?.ref || ''}`}
        sub={active ? `${active.packageName} · ${active.price}` : ''}
        foot={
          <>
            <Btn variant="outline" onClick={() => setActive(null)}>
              Cancel
            </Btn>
            <Btn type="submit" form="admin-order-form" variant="gold" disabled={busy}>
              {busy ? 'Saving…' : 'Save order status'}
            </Btn>
          </>
        }
      >
        {active && (
          <form id="admin-order-form" onSubmit={saveOrder}>
            <div className="order-summary-grid" style={{ marginBottom: 18 }}>
              <div>
                <span className="order-k">Student</span>
                <span className="order-v">{active.names}</span>
              </div>
              <div>
                <span className="order-k">Registration number</span>
                <span className="order-v mono">{active.regNo}</span>
              </div>
              <div>
                <span className="order-k">Phone / WhatsApp</span>
                <span className="order-v mono">{phoneDisplay(active.phone)}</span>
              </div>
              <div>
                <span className="order-k">Supervisor name</span>
                <span className="order-v">{active.supervisorName || '—'}</span>
              </div>
              <div className="order-span-2">
                <span className="order-k">Programme</span>
                <span className="order-v">
                  {active.institution ? `${active.institution} · ${active.programme}` : active.programme}
                </span>
              </div>
              {active.title && (
                <div className="order-span-2">
                  <span className="order-k">
                    Topic / Title {active.selectionRef ? `(${active.selectionRef})` : ''}
                  </span>
                  <span className="order-v">{active.title}</span>
                </div>
              )}
              {active.notes && (
                <div className="order-span-2">
                  <span className="order-k">Student notes / deadline</span>
                  <span className="order-v">{active.notes}</span>
                </div>
              )}
            </div>

            <Field label="Order status" required htmlFor="ord-status">
              <select
                id="ord-status"
                className="select"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Internal staff notes"
              htmlFor="ord-notes"
              hint="Visible to staff only (payment confirmation, assigned writer, delivery status)"
            >
              <textarea
                id="ord-notes"
                className="inp"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Deposit received via M-Pesa, proposal draft due Monday"
              />
            </Field>

            <Field label="Audit note (optional)" htmlFor="ord-reason">
              <input
                id="ord-reason"
                className="inp"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Confirmed payment and started work"
              />
            </Field>
          </form>
        )}
      </Modal>
    </>
  );
}
