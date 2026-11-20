import PageIntro from '../components/PageIntro';
import FeaturesSection from '../sections/Features';

export default function Features() {
  return (
    <>
      <PageIntro
        eyebrow="The platform"
        title="Everything the portal does, in one place"
        lead="A catalogue, a reservation rule the system enforces itself, and a record of every change — built so that no two students can claim the same title."
        primary={{ label: 'Browse titles', to: '/catalogue' }}
        secondary={{ label: 'How the process works', to: '/help' }}
      />
      <FeaturesSection />
    </>
  );
}
