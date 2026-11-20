import { useState } from 'react';
import { navigate } from '../../lib/router';
import { adminLogin, ApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Btn, Field, Notice } from '../../ui/primitives';
import { BrandMark, IconLock, IconShield, IconCheck, IconArrowLeft, IconUsers } from '../../ui/Icons';

export default function Login({ onAuthed }) {
  const notify = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const admin = await adminLogin(username, password);
      onAuthed(admin);
      notify(`Welcome back, ${admin.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Sign-in failed. Try again.';
      setError(msg);
      notify(msg, 'error');
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <div>
          <div className="brand">
            <BrandMark size={42} />
            <span className="brand-text">
              <strong style={{ color: '#fff' }}>Report Safi</strong>
              <span style={{ color: '#7f93a4' }}>Administrator workspace</span>
            </span>
          </div>

          <span className="eyebrow" style={{ marginTop: 44, display: 'inline-flex' }}>
            Restricted access
          </span>
          <h1>Manage the catalogue, not the browser.</h1>
          <p>
            Everything you do here — importing titles, correcting a record, releasing a selection —
            is written to the audit log with your name against it.
          </p>

          <ul className="auth-points">
            <li>
              <IconCheck size={16} /> Bulk-import titles with validation before committing
            </li>
            <li>
              <IconCheck size={16} /> Release a selection only with a recorded reason
            </li>
            <li>
              <IconCheck size={16} /> Review who selected what, and exactly when
            </li>
          </ul>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: '0.8rem', color: '#7f93a4' }}>
          Role-based access · Session-only sign-in · Every action attributed
        </div>
      </aside>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={submit} noValidate>
          <span className="eyebrow">Staff sign-in</span>
          <h2>Administrator login</h2>
          <p>Use the account issued to you by the Research Office.</p>

          {error && (
            <Notice tone="error" icon={IconLock}>
              {error}
            </Notice>
          )}

          <div style={{ marginTop: 18 }}>
            <Field label="Username" required htmlFor="user">
              <div className="input-icon">
                <IconUsers size={17} />
                <input
                  id="user"
                  className="inp mono"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </Field>

            <Field label="Password" required htmlFor="pw">
              <div className="input-icon">
                <IconLock size={17} />
                <input
                  id="pw"
                  type="password"
                  className="inp"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </Field>

            <Btn type="submit" variant="primary" size="lg" block disabled={busy} icon={IconShield}>
              {busy ? 'Verifying…' : 'Sign in to the workspace'}
            </Btn>

            <div className="demo-hint">
              <strong>Demo accounts</strong> — this prototype stores data in your browser only:
              <br />
              <code>admin</code> / <code>Report@2026</code> · Administrator
              <br />
              <code>controller</code> / <code>Report@2026</code> · System administrator
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ marginTop: 14 }}
              onClick={() => { window.location.href = '/'; }}
            >
              <IconArrowLeft size={15} /> Back to the student portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
