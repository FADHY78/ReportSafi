import PageIntro from '../components/PageIntro';
import FeaturesSection from '../sections/Features';
import { useLanguage } from '../lib/i18n';

export default function Features() {
  const { t } = useLanguage();

  return (
    <>
      <PageIntro
        eyebrow={t('feat_page_eyebrow', 'Mfumo Rasmi')}
        title={t('feat_page_heading', 'Kila kitu ambacho mfumo unafanya, sehemu moja')}
        lead={t(
          'feat_page_lead',
          'Orodha ya mada, sheria za uhifadhi zinazotekelezwa na seva, na kumbukumbu ya kila badiliko — ili kuhakikisha hakuna wanafunzi wawili wanaochukua mada moja.'
        )}
        primary={{ label: t('feat_btn_browse', 'Angalia mada zilizopo'), to: '/catalogue' }}
        secondary={{ label: t('feat_btn_works', 'Jinsi mfumo unavyofanya kazi'), to: '/help' }}
      />
      <FeaturesSection />
    </>
  );
}
