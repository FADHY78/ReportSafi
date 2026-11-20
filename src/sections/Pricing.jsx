import { navigate } from '../lib/router';
import { Btn } from '../ui/primitives';
import { IconCheck, IconArrowRight, IconClipboard, IconGraduation, IconBook } from '../ui/Icons';

/**
 * Report services, priced per project. Reserving a title in the portal itself
 * stays free for students (per the PRD) — these are the research-writing
 * packages the Research Office delivers around it.
 */
const PLANS = [
  {
    icon: IconClipboard,
    name: 'Research Proposal',
    price: 'TSh 25,000',
    unit: 'per proposal',
    note: 'Everything needed to get your proposal approved.',
    features: [
      'Topic and title development',
      'Problem statement and objectives',
      'Literature review outline',
      'Research design and methodology',
      'Two rounds of revisions',
      'Delivery within 7 working days',
    ],
    cta: 'Order a proposal',
    to: '/help',
    tone: 'plain',
  },
  {
    icon: IconGraduation,
    name: 'Research Proposal + Research Report',
    price: 'TSh 40,000',
    unit: 'complete package',
    note: 'From proposal approval to the finished report — the full journey.',
    features: [
      'Everything in Research Proposal',
      'Full report chapters 1 – 5',
      'Data capture and analysis guidance',
      'Tables, figures and references formatted',
      'Plagiarism check with report',
      'Revisions until you submit',
    ],
    cta: 'Order the package',
    to: '/help',
    tone: 'featured',
  },
  {
    icon: IconBook,
    name: 'Research Report',
    price: 'TSh 30,000',
    unit: 'per report',
    note: 'Already have an approved proposal? We finish the report.',
    features: [
      'Full report chapters 1 – 5',
      'Data analysis and interpretation',
      'Tables, figures and references formatted',
      'Discussion, summary and conclusion',
      'Two rounds of revisions',
      'Delivery within 10 working days',
    ],
    cta: 'Order a report',
    to: '/help',
    tone: 'plain',
  },
];

export default function Pricing() {
  return (
    <section className="section section-alt" id="pricing">
      <div className="container">
        <div className="section-head center-head">
          <span className="eyebrow">Pricing</span>
          <h2>One price per report. No subscriptions.</h2>
          <p>
            Choose the support you need — a proposal, a report, or both together. Selecting a
            title in the portal itself remains free for every student.
          </p>
        </div>

        <div className="plan-grid">
          {PLANS.map((p) => (
            <article className={`plan-card${p.tone === 'featured' ? ' is-featured' : ''}`} key={p.name}>
              {p.tone === 'featured' && <span className="plan-flag">Best value</span>}
              <span className="plan-icon">
                <p.icon size={19} />
              </span>
              <h3>{p.name}</h3>
              <p className="plan-price">
                <strong>{p.price}</strong>
                <span>{p.unit}</span>
              </p>
              <p className="plan-note">{p.note}</p>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}>
                    <IconCheck size={14} strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
              <Btn
                variant={p.tone === 'featured' ? 'gold' : 'outline'}
                className="btn-block"
                icon={IconArrowRight}
                onClick={() => navigate(p.to)}
              >
                {p.cta}
              </Btn>
            </article>
          ))}
        </div>

        <p className="plan-footnote">
          Prices are in Tanzanian Shillings and exclude VAT. Delivery timelines start once topic
          approval and the draft materials are received — title selection in the portal stays free.
        </p>
      </div>
    </section>
  );
}
