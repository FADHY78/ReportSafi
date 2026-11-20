import { Link, navigate } from '../lib/router';
import { Btn } from '../ui/primitives';
import { IconArrowRight } from '../ui/Icons';

/** Shared header for the single-topic pages (Features, Pricing, Security). */
export default function PageIntro({ eyebrow, title, lead, primary, secondary }) {
  return (
    <section className="section-tight" style={{ paddingTop: 56 }}>
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <div className="section-head">
          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', margin: '14px 0' }}>{title}</h1>
          <p className="lead">{lead}</p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0 }}>
          {primary && (
            <Btn variant="gold" icon={IconArrowRight} onClick={() => navigate(primary.to)}>
              {primary.label}
            </Btn>
          )}
          {secondary && (
            <Link to={secondary.to} className="btn btn-outline">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
