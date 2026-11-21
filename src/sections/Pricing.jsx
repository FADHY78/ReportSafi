import { useState } from 'react';
import { Btn } from '../ui/primitives';
import { IconCheck, IconArrowRight, IconClipboard, IconGraduation, IconBook } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';
import PackageOrderModal from '../components/PackageOrderModal';

const ICONS = {
  clipboard: IconClipboard,
  graduation: IconGraduation,
  book: IconBook,
};

/**
 * Report services, priced per project. Reserving a title in the portal itself
 * stays free for students (per the PRD) — these are the research-writing
 * packages the Research Office delivers around it.
 */
export default function Pricing({ session }) {
  const { pricing } = useSiteContent();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <section className="section section-alt" id="pricing">
      <div className="container">
        <div className="section-head center-head">
          <span className="eyebrow">{t('pricing_eyebrow', 'Bei na Vifurushi')}</span>
          <h2>{t('pricing_title', 'Gharama za Kitaalamu kwa Kila Ripoti')}</h2>
          <p>
            {t(
              'pricing_lead',
              'Chagua huduma unayohitaji — andiko la utafiti (proposal), ripoti kamili, au vifurushi vyote viwili pamoja. Kuchagua mada kwenye mfumo ni bure kabisa.'
            )}
          </p>
        </div>

        <div className="plan-grid">
          {pricing.map((p) => {
            const Icon = ICONS[p.icon] || IconClipboard;
            return (
              <article className={`plan-card${p.tone === 'featured' ? ' is-featured' : ''}`} key={p.name}>
                {p.tone === 'featured' && <span className="plan-flag">Best value</span>}
                <span className="plan-icon">
                  <Icon size={19} />
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
                  onClick={() => setSelectedPlan(p)}
                >
                  {p.cta === 'Order the package'
                    ? 'Agiza Kifurushi Kamili'
                    : p.cta === 'Order a proposal'
                    ? 'Agiza Proposal Hii'
                    : p.cta === 'Order a report'
                    ? 'Agiza Ripoti Hii'
                    : p.cta}
                </Btn>
              </article>
            );
          })}
        </div>

        <p className="plan-footnote">
          Prices are in Tanzanian Shillings and exclude VAT. Delivery timelines start once topic
          approval and the draft materials are received — title selection in the portal stays free.
        </p>
      </div>

      <PackageOrderModal
        open={Boolean(selectedPlan)}
        selectedPackage={selectedPlan}
        packages={pricing}
        session={session}
        onClose={() => setSelectedPlan(null)}
      />
    </section>
  );
}
