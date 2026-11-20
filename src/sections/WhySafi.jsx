import { Link } from '../lib/router';
import { IconClock, IconSearch, IconPrinter, IconGraduation, IconArrowRight } from '../ui/Icons';

/**
 * Replaces the invented testimonial quotes with the reason the service exists.
 * The four value cards follow the "why choose us" block from the legacy site,
 * rewritten for title selection rather than report writing.
 */
const VALUES = [
  {
    no: '01',
    icon: IconClock,
    title: 'Save the chasing',
    text: 'No queue at the office, no shared spreadsheet to cross-check. The catalogue tells you straight away whether a title is still yours to reserve.',
  },
  {
    no: '02',
    icon: IconSearch,
    title: 'Order in a few taps',
    text: 'Choose your programme, search the catalogue and reserve from a phone — the same flow works on a laptop in the campus lab.',
  },
  {
    no: '03',
    icon: IconPrinter,
    title: 'Ready for your supervisor',
    text: 'Your confirmation carries a dated reference number you can print or forward. No photocopy, no “come back tomorrow”.',
  },
  {
    no: '04',
    icon: IconGraduation,
    title: 'Grounded in local standards',
    text: 'The catalogue and report packages follow Tanzanian university guidelines, with a Research Office that can audit every action.',
  },
];

export default function WhySafi() {
  return (
    <section className="section" id="why-safi">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why Report Safi</span>
          <h2>The tedious part is ours, not yours</h2>
          <p>
            Report Safi started by taking the stress out of academic writing. This portal keeps the
            same promise for title selection: less chasing, clearer records, and work that is ready
            to submit.
          </p>
        </div>

        <div className="value-grid">
          {VALUES.map((v) => (
            <article className="value-card" key={v.no}>
              <span className="value-no">{v.no}</span>
              <span className="value-icon">
                <v.icon size={19} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>

        <div className="value-banner">
          <div>
            <span className="eyebrow-light">The whole idea</span>
            <h2>One title. One student. One written record.</h2>
            <p>
              The portal enforces the rules while you work, so the Research Office never has to
              untangle two students claiming the same title.
            </p>
          </div>
          <Link to="/help" className="btn btn-outline">
            See how it works <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
