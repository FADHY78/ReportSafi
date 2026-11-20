import { useState } from 'react';
import { Notice } from '../ui/primitives';
import { IconAlert, IconShield, IconLock, IconMail, IconPhone, IconClock } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';

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

export default function Help() {
  const [open, setOpen] = useState(0);
  const { rules, faqs, contact, meta } = useSiteContent();

  return (
    <>
      {/* ------------------------------------------------------------- intro */}
      <section className="help-hero">
        <div className="container">
          <span className="eyebrow">Help centre · {meta.academicYear}</span>
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
                  <a href={`mailto:${contact.email}`}>
                    <IconMail size={15} /> {contact.email}
                  </a>
                  <a href={contact.phoneHref}>
                    <IconPhone size={15} /> {contact.phone}
                  </a>
                  <span>
                    <IconClock size={15} /> {contact.hours}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rule-list">
            {rules.map((r) => (
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
            {faqs.map((f, i) => (
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
