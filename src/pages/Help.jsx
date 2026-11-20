import { useState } from 'react';
import { Notice } from '../ui/primitives';
import { IconAlert, IconShield, IconLock, IconMail, IconPhone, IconClock } from '../ui/Icons';

const STEPS = [
  {
    n: '01',
    title: 'Identify yourself',
    text: 'Registration number, full names, active phone number and programme. Details are stored but not verified against the student register.',
  },
  {
    n: '02',
    title: 'Search the catalogue',
    text: 'Filter by keyword and availability. Green rows are free; red rows are already reserved.',
  },
  {
    n: '03',
    title: 'Review and confirm',
    text: 'Check your details against the title before anything is saved. This is your last chance to stop.',
  },
  {
    n: '04',
    title: 'Keep your reference',
    text: 'The title closes to everyone else and you receive a dated reference you can print or copy.',
  },
];

const RULES = [
  { id: 'BR-01', title: 'One title per student', text: 'Only one active title at a time.' },
  { id: 'BR-02', title: 'One student per title', text: 'A title cannot be held by two students.' },
  { id: 'BR-03', title: 'Unavailable means committed', text: 'A title turns red only after a successful reservation.' },
  { id: 'BR-04', title: 'The portal decides', text: 'Your browser only displays availability; it never confirms it.' },
  { id: 'BR-05', title: 'Four details required', text: 'Registration number, names, phone and programme are mandatory.' },
  { id: 'BR-06', title: 'Your programme only', text: 'You can reserve titles from your own programme.' },
  { id: 'BR-07', title: 'Changes are audited', text: 'Staff releases need a reason and are recorded by name.' },
  { id: 'BR-08', title: 'A deep catalogue', text: 'Every programme offers at least 1,000 titles.' },
  { id: 'BR-09', title: 'No double registration', text: 'One registration number cannot make two selections.' },
];

const FAQS = [
  {
    q: 'How do I know a title is still free?',
    a: 'Availability is decided at the moment you confirm. Green means available; red means another student has already completed a selection.',
  },
  {
    q: 'Can I select more than one title?',
    a: 'No. BR-01 allows exactly one active title per student, and the portal blocks a second selection.',
  },
  {
    q: 'What does “not verified identity” mean?',
    a: 'The portal has recorded what you typed but has not checked it against the official student register. It proves data entry, not enrolment.',
  },
  {
    q: 'Someone else got my title. What now?',
    a: 'Your reservation was not created, so return to the catalogue and choose another available title. Availability is re-checked each time.',
  },
  {
    q: 'Can my supervisor change my title?',
    a: 'Not directly. The Research Office releases the selection with a recorded reason and the change appears in the audit log.',
  },
  {
    q: 'Do I pay to reserve a title?',
    a: 'No. Reserving a title is free. Optional report-writing packages are priced separately.',
  },
];

export default function Help() {
  const [open, setOpen] = useState(0);

  return (
    <>
      {/* ------------------------------------------------------------- intro */}
      <section className="help-hero">
        <div className="container">
          <span className="eyebrow">Help centre · 2026 / 2027</span>
          <h1>Title selection, explained simply.</h1>
          <p className="lead">
            Identify yourself, reserve one available title and keep your reference. Everything below
            is checked by the portal before a selection is saved.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- process */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The process</span>
            <h2>Four steps</h2>
            <p>From identification to your reference number.</p>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <article className="step" key={s.n}>
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- rules/change */}
      <section className="section" id="help-rules">
        <div className="container two-col">
          <div>
            <span className="eyebrow">Business rules</span>
            <div className="section-head">
              <h2>Nine rules the portal enforces</h2>
              <p>Checked at confirmation — never only in your browser.</p>
            </div>

            <Notice tone="info" icon={IconShield}>
              If two students confirm the same title at the same moment, exactly one succeeds.
            </Notice>

            <div className="panel help-change-panel" id="help-changes">
              <div className="panel-head">
                <span className="panel-title">
                  <IconLock size={17} /> Need a change?
                </span>
              </div>
              <div className="panel-body">
                <p className="small muted" style={{ lineHeight: 1.7 }}>
                  Students cannot edit a selection. Contact us with your registration number and
                  reference; an administrator releases it with a recorded reason.
                </p>
                <div className="help-contact-lines">
                  <a href="mailto:info@reportsafi.me">
                    <IconMail size={15} /> info@reportsafi.me
                  </a>
                  <a href="tel:+255613328915">
                    <IconPhone size={15} /> +255 613 328 915
                  </a>
                  <span>
                    <IconClock size={15} /> Mon – Fri, 08:00 – 17:00
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rule-list">
            {RULES.map((r) => (
              <div className="rule-row" key={r.id}>
                <span className="mono">{r.id}</span>
                <div>
                  <strong>{r.title}</strong>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      <section className="section section-alt" id="help-faq">
        <div className="container two-col">
          <div>
            <span className="eyebrow">Questions</span>
            <div className="section-head">
              <h2>Frequently asked</h2>
              <p>The answers the Research Office gives most often.</p>
            </div>
            <div className="notice notice-warn" style={{ marginTop: 0 }}>
              <IconAlert size={17} />
              <div>
                <strong>After the deadline.</strong> New selections require an administrator.
              </div>
            </div>
          </div>

          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div className={`faq-item${open === i ? ' is-open' : ''}`} key={f.q}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  {f.q}
                  <span className="faq-mark" aria-hidden="true">
                    +
                  </span>
                </button>
                {open === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
