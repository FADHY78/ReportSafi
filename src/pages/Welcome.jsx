import { useEffect, useState } from 'react';
import { navigate } from '../lib/router';
import { getProgrammes, getPublicStats, identify, ApiError } from '../lib/api';
import { useToast } from '../lib/toast';
import { Btn, Field, Notice } from '../ui/primitives';
import {
  IconArrowRight,
  IconCheck,
  IconShield,
  IconUsers,
  IconHash,
  IconPhone,
  IconGraduation,
  IconAlert,
  IconFileText,
} from '../ui/Icons';

import SelectionRecord from '../components/SelectionRecord';
import LogoCloud from '../sections/LogoCloud';
import Showcase from '../sections/Showcase';
import WhySafi from '../sections/WhySafi';
import CtaBand from '../sections/CtaBand';

const NEEDS = [
  {
    icon: IconHash,
    title: 'Registration number',
    text: 'Your student registration number, exactly as printed on your student card.',
  },
  {
    icon: IconUsers,
    title: 'Full names',
    text: 'All names as they appear in the college register — no abbreviations.',
  },
  {
    icon: IconPhone,
    title: 'Active phone number',
    text: 'A number you can still receive SMS on. It is the only way we can reach you.',
  },
  {
    icon: IconGraduation,
    title: 'Programme / course',
    text: 'You may only browse and reserve titles belonging to your own programme.',
  },
];

export default function Welcome({ session, onIdentified }) {
  const notify = useToast();
  const [programmes, setProgrammes] = useState([]);
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ regNo: '', names: '', phone: '', programmeId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let alive = true;
    getProgrammes().then((p) => alive && setProgrammes(p));
    getPublicStats().then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (form.regNo.trim().length < 5) next.regNo = 'Enter your registration number.';
    if (form.names.trim().split(/\s+/).filter(Boolean).length < 2)
      next.names = 'Enter your full names.';
    if (!form.phone.trim()) next.phone = 'Enter your active phone number.';
    if (!form.programmeId) next.programmeId = 'Choose your programme.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const result = await identify(form);
      onIdentified(result);
      if (result.existingSelection) {
        notify('You already hold a title — showing your confirmation.', 'success');
        navigate(`/reference?ref=${encodeURIComponent(result.existingSelection.ref)}`);
      } else {
        notify('Identity captured. The catalogue is open to you.', 'success');
        navigate('/catalogue');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  const stat = (value, label) => (
    <div className="stat">
      <div className="stat-value">
        {value === null ? '—' : Number(value).toLocaleString('en-GB')}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Mada za Utafiti · Research &amp; Project Titles</span>
            <h1>
              One student, one title — <em>chosen fairly</em>, recorded properly.
            </h1>
            <p className="lead">
              Search the approved Report Safi catalogue, see instantly what is still free, and reserve
              your research or project title in a single confirmed step. No queues, no double
              booking, no guessing.
            </p>

            <div className="hero-actions">
              <Btn variant="gold" size="lg" icon={IconArrowRight} onClick={() => navigate('/catalogue')}>
                Browse available titles
              </Btn>
              <Btn variant="outline" size="lg" icon={IconFileText} onClick={() => navigate('/help')}>
                How the process works
              </Btn>
            </div>

            <p className="hero-note">
              <IconShield size={16} />
              Availability is confirmed by the portal at the moment you select — never by your
              browser alone.
            </p>
          </div>

          <SelectionRecord completed={stats?.completed} />
        </div>
      </section>

      {/* --------------------------------------------------- stat strip */}
      <div className="container">
        <div className="stat-strip">
          {stat(stats?.titles, 'Titles in catalogue')}
          {stat(stats?.available, 'Available right now')}
          {stat(stats?.programmes, 'Programmes open')}
          {stat(stats?.today, 'Selections today')}
        </div>
      </div>

      <LogoCloud />

      {/* ----------------------------------------------- identify + need */}
      <section className="section" id="identify">
        <div className="container two-col">
          <div>
            <span className="eyebrow">Step 01 · Identification</span>
            <div className="section-head" style={{ marginBottom: 8 }}>
              <h2>Before you enter the catalogue</h2>
              <p>
                The Research Office needs to know who is reserving each title. Have these four
                details ready — the form takes under a minute.
              </p>
            </div>

            <ul className="need-list">
              {NEEDS.map((n) => (
                <li className="need-item" key={n.title}>
                  <span className="need-icon">
                    <n.icon size={17} />
                  </span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Notice tone="warn" icon={IconAlert}>
              <strong>These details are not identity verification.</strong> In this release they are
              captured and stored, but they are not checked against the official student
              register. Do not treat a successful submission as proof of enrolment.
            </Notice>

            {session && (
              <div className="notice notice-info" style={{ marginTop: 14 }}>
                <IconCheck size={17} />
                <div style={{ flex: 1 }}>
                  <strong>You are identified as {session.student.names}</strong> ({session.student.regNo}).
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalogue')}>
                      Continue to the catalogue <IconArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="form-panel" onSubmit={submit} noValidate>
            <div className="form-panel-head">
              <span className="eyebrow">Student details</span>
              <h2>Identify yourself</h2>
              <p>Registration number · Full names · Active phone · Programme</p>
            </div>

            <div className="form-panel-body">
              {error && (
                <Notice tone="error" icon={IconAlert}>
                  {error}
                </Notice>
              )}

              <Field
                label="Registration number"
                required
                htmlFor="regNo"
                error={errors.regNo}
                hint="Example: BAF/2024/01234"
              >
                <input
                  id="regNo"
                  className="inp mono"
                  value={form.regNo}
                  onChange={set('regNo')}
                  placeholder="BAF/2024/01234"
                  autoComplete="off"
                  spellCheck="false"
                />
              </Field>

              <div className="field-disclaimer" role="note">
                <IconAlert size={16} />
                <div>
                  <strong>Use your real college registration number.</strong> Enter the exact number
                  printed on your official student identity card — do not use a fake, guessed, or
                  another student&rsquo;s registration number.
                </div>
              </div>

              <Field label="Full names" required htmlFor="names" error={errors.names}>
                <input
                  id="names"
                  className="inp"
                  value={form.names}
                  onChange={set('names')}
                  placeholder="Neema Baraka Mushi"
                  autoComplete="name"
                />
              </Field>

              <div className="form-grid-2">
                <Field
                  label="Active phone"
                  required
                  htmlFor="phone"
                  error={errors.phone}
                  hint="0712 345 678"
                >
                  <input
                    id="phone"
                    className="inp mono"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="0712 345 678"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>

                <Field
                  label="Programme / course"
                  required
                  htmlFor="prog"
                  error={errors.programmeId}
                  hint={
                    programmes.length
                      ? `${programmes.length} approved programmes available`
                      : 'Loading approved programmes…'
                  }
                >
                  <select id="prog" className="select" value={form.programmeId} onChange={set('programmeId')}>
                    <option value="">Select programme…</option>
                    {['Basic Technician Certificate', 'Ordinary Diploma', 'Bachelor Degree'].map(
                      (award) => {
                        const group = programmes.filter((p) => p.award === award);
                        if (!group.length) return null;
                        return (
                          <optgroup key={award} label={award}>
                            {group.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code} — {p.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      }
                    )}
                  </select>
                </Field>
              </div>

              <div className="form-actions">
                <Btn type="submit" variant="primary" size="lg" disabled={busy} icon={IconArrowRight}>
                  {busy ? 'Checking…' : 'Open the catalogue'}
                </Btn>
                <span className="small muted">It takes about a minute.</span>
              </div>

              <p className="form-footnote">
                <IconShield size={14} />
                Submitted once. After that you hold exactly one title, and any correction must be
                made by an authorised administrator with a recorded reason.
              </p>
            </div>
          </form>
        </div>
      </section>

      <Showcase />

      <WhySafi />
      <CtaBand />
    </>
  );
}
