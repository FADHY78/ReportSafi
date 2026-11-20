import PageIntro from '../components/PageIntro';
import SecuritySection from '../sections/Security';

export default function Security() {
  return (
    <>
      <PageIntro
        eyebrow="Trust & integration"
        title="Built for the questions an auditor asks"
        lead="Every reservation is checked by the portal itself, every staff action is attributed, and every record can be exported as plain CSV."
        primary={{ label: 'Read the business rules', to: '/help' }}
      />
      <SecuritySection />
    </>
  );
}
