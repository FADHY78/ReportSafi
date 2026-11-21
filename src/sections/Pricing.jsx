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

const PLANS_SW = [
  {
    icon: 'clipboard',
    name: 'Andiko la Utafiti (Proposal)',
    price: 'TSh 25,000',
    unit: 'kwa proposal',
    note: 'Kila kitu kinachohitajika ili proposal yako ikubalike chuoni.',
    features: [
      'Utengenezaji wa mada na uthibitisho',
      'Kauli ya tatizo na malengo ya utafiti',
      'Muhtasari wa mapitio ya fasihi (Lit. Review)',
      'Muundo na mbinu za utafiti (Methodology)',
      'Marekebisho mpaka uwasilishe chuoni',
      'Kukabidhiwa haraka (Fast delivery)',
    ],
    cta: 'Agiza Proposal Hii',
    tone: 'plain',
  },
  {
    icon: 'graduation',
    name: 'Proposal + Ripoti Kamili ya Utafiti',
    price: 'TSh 40,000',
    unit: 'kifurushi kamili',
    note: 'Kuanzia kuidhinishwa kwa proposal hadi kukamilika kwa ripoti kamili.',
    features: [
      'Kila kitu kilichopo kwenye Proposal',
      'Sura zote za ripoti (Chapters 1 – 5)',
      'Mwongozo wa ukusanyaji na uchambuzi wa data',
      'Majedwali, grafu na marejeleo yaliyopangwa',
      'Ripoti ya ukaguzi wa plagiarism',
      'Marekebisho mpaka ukubaliwe chuoni',
      'Kukabidhiwa haraka (Fast delivery)',
    ],
    cta: 'Agiza Kifurushi Kamili',
    tone: 'featured',
  },
  {
    icon: 'book',
    name: 'Ripoti Kamili ya Utafiti',
    price: 'TSh 30,000',
    unit: 'kwa ripoti',
    note: 'Umeshapitishiwa proposal? Tunakamilisha ripoti nzima ya utafiti.',
    features: [
      'Sura zote za ripoti (Chapters 1 – 5)',
      'Uchambuzi wa data na tafsiri ya matokeo',
      'Majedwali, grafu na marejeleo yaliyopangwa',
      'Majadiliano, muhtasari na hitimisho',
      'Marekebisho mpaka ukubaliwe chuoni',
      'Kukabidhiwa haraka (Fast delivery)',
    ],
    cta: 'Agiza Ripoti Hii',
    tone: 'plain',
  },
];

export default function Pricing({ session }) {
  const { pricing: sitePricing } = useSiteContent();
  const { t, isSwahili } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const pricing = isSwahili ? PLANS_SW : sitePricing;

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
                {p.tone === 'featured' && (
                  <span className="plan-flag">
                    {isSwahili ? 'Kifurushi Bora Zaidi' : 'Best value'}
                  </span>
                )}
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
                  {p.cta}
                </Btn>
              </article>
            );
          })}
        </div>

        <p className="plan-footnote">
          {isSwahili
            ? 'Bei zote ziko katika Shilingi ya Kitanzania (TSh). Muda wa kuandaa unaanza pale mada inapoidhinishwa na taarifa za awali kupokelewa — kuchagua mada kwenye mfumo ni bure 100%.'
            : 'Prices are in Tanzanian Shillings and exclude VAT. Delivery timelines start once topic approval and the draft materials are received — title selection in the portal stays free.'}
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
