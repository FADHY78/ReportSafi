import PageIntro from '../components/PageIntro';
import PricingSection from '../sections/Pricing';
import { useLanguage } from '../lib/i18n';

export default function Pricing({ session }) {
  const { t } = useLanguage();

  return (
    <>
      <PageIntro
        eyebrow={t('pricing_eyebrow', 'Vifurushi vya Utafiti na Ripoti')}
        title={t('pricing_title', 'Gharama na Vifurushi vya Kitaalamu')}
        lead={t(
          'pricing_lead',
          'Kuchagua mada ni bure 100%. Ukihitaji uandishi wa kitaalamu wa andiko (proposal) au ripoti kamili ya utafiti (chapters 1–5), chagua kifurushi chako hapa.'
        )}
        primary={{ label: t('hero_btn_catalogue', 'Angalia mada zilizopo'), to: '/catalogue' }}
        secondary={{ label: t('hero_btn_works', 'Jinsi mfumo unavyofanya kazi'), to: '/help' }}
      />
      <PricingSection session={session} />
    </>
  );
}
