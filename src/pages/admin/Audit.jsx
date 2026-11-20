import { useCallback, useEffect, useState } from 'react';
import { listAudit } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Pager, Empty, SkeletonRows, Notice } from '../../ui/primitives';
import { IconSearch, IconHistory, IconDownload, IconShield } from '../../ui/Icons';
import { fmtDateTime, toCSV, downloadFile } from '../../lib/utils';

const ACTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'selection.create', label: 'Selections made' },
  { value: 'selection.change_title', label: 'Titles changed (student)' },
  { value: 'selection.edit_details', label: 'Details edited (student)' },
  { value: 'selection.release', label: 'Selections released' },
  { value: 'order.create', label: 'Orders placed' },
  { value: 'order.update', label: 'Orders updated' },
  { value: 'student.update', label: 'Students updated' },
  { value: 'content.update', label: 'Site settings updated' },
  { value: 'title.import', label: 'Catalogue imports' },
  { value: 'title.create', label: 'Titles added' },
  { value: 'title.update', label: 'Titles edited' },
  { value: 'title.deactivate', label: 'Titles withdrawn' },
  { value: 'title.reactivate', label: 'Titles restored' },
  { value: 'programme.create', label: 'Programmes created' },
  { value: 'programme.update', label: 'Programmes updated' },
  { value: 'auth.login', label: 'Admin sign-ins' },
  { value: 'auth.failed', label: 'Failed sign-ins' },
];

export default function Audit() {
  const notify = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await listAudit({ q, action, page, pageSize }));
    } catch {
      notify('Could not load the audit log.', 'error');
    } finally {
      setLoading(false);
    }
  }, [q, action, page, notify]);

  useEffect(() => {
    const id = window.setTimeout(load, 260);
    return () => window.clearTimeout(id);
  }, [load]);

  const exportCsv = async () => {
    try {
      const res = await listAudit({ q, action, page: 1, pageSize: 100000 });
      const csv = toCSV(
        ['timestamp', 'actor', 'role', 'action', 'entity', 'record', 'summary', 'reason', 'before', 'after'],
        res.rows.map((r) => [r.at, r.actor, r.role, r.action, r.entity, r.entityId, r.summary, r.reason, r.before, r.after])
      );
      downloadFile('reportsafi-audit-log.csv', csv);
      notify(`Exported ${res.rows.length} entries.`, 'success');
    } catch {
      notify('Export failed.', 'error');
    }
  };

  return (
    <>
      <Notice tone="info" icon={IconShield}>
        The audit log cannot be edited or deleted from this interface. Every administrative action
        — and every failed sign-in — is appended with the actor, the record affected and the reason
        given.
      </Notice>

      <div className="table-toolbar" style={{ borderRadius: 'var(--r-m)', border: '1px solid var(--line)' }}>
        <div className="search-box" style={{ maxWidth: 340 }}>
          <IconSearch size={17} />
          <input
            className="inp"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search actor, record or reason…"
            aria-label="Search audit log"
          />
        </div>

        <select
          className="select"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by action"
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>

        <div style={{ flex: 1 }} />
        <Btn variant="outline" size="sm" icon={IconDownload} onClick={exportCsv}>
          Export log
        </Btn>
      </div>

      <div className="table-wrap">
        {loading && !data ? (
          <SkeletonRows rows={8} />
        ) : !data || data.total === 0 ? (
          <Empty icon={IconHistory} title="No audit entries" text="Actions will appear here as administrators work." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Record</th>
                <th>Detail</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono small nowrap">{fmtDateTime(r.at)}</td>
                  <td>
                    <span className="strong">{r.actor}</span>
                    <div className="small muted">{r.role}</div>
                  </td>
                  <td className="mono small">{r.action}</td>
                  <td className="mono small">
                    {r.entity}
                    <div className="muted">{r.entityId}</div>
                  </td>
                  <td className="small" style={{ minWidth: 260 }}>
                    {r.summary}
                    {(r.before !== '—' || r.after !== '—') && (
                      <div className="small muted" style={{ marginTop: 4 }}>
                        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{r.before}</span>{' '}
                        → <span>{r.after}</span>
                      </div>
                    )}
                  </td>
                  <td className="small muted" style={{ maxWidth: 240 }}>
                    {r.reason}
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
            <span>{data.total.toLocaleString('en-GB')} entries retained (capped at 400 in this prototype)</span>
          </div>
        </>
      )}
    </>
  );
}
