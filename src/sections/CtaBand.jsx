import { navigate } from '../lib/router';
import { goSection } from '../lib/scroll';
import { Btn } from '../ui/primitives';
import { IconArrowRight, IconFileText } from '../ui/Icons';

/** Closing call to action — sits directly above the footer on the home page. */
export default function CtaBand() {
  return (
    <section className="cta-band" id="get-started">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow eyebrow-light">Selection window · 2026 / 2027</span>
          <h2>Pick your title while the good ones are still free.</h2>
          <p>
            Four fields, one minute, one reference number. Availability is checked the moment you
            confirm — not when your page happened to load.
          </p>
        </div>
        <div className="cta-actions">
          <Btn variant="gold" size="lg" icon={IconArrowRight} onClick={() => navigate('/catalogue')}>
            Browse available titles
          </Btn>
          <Btn variant="ghost-light" size="lg" icon={IconFileText} onClick={() => goSection('identify')}>
            Enter my details first
          </Btn>
        </div>
      </div>
    </section>
  );
}
