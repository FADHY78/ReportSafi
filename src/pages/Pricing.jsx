import PageIntro from '../components/PageIntro';
import PricingSection from '../sections/Pricing';

export default function Pricing() {
  return (
    <>
      <PageIntro
        eyebrow="Report services"
        title="Support for your proposal, your report, or both"
        lead="Straight per-project pricing in Tanzanian Shillings. Choose the package you need — reserving a title in the portal itself is always free."
        primary={{ label: 'See the catalogue', to: '/catalogue' }}
        secondary={{ label: 'Ask the research office', to: '/help' }}
      />
      <PricingSection />
    </>
  );
}
