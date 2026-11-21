import PageIntro from '../components/PageIntro';
import SecuritySection from '../sections/Security';
import { useLanguage } from '../lib/i18n';

export default function Security() {
  const { t } = useLanguage();

  return (
    <>
      <PageIntro
        eyebrow={t('sec_page_eyebrow', 'Usalama na Kanuni')}
        title={t('sec_page_heading', 'Jinsi mfumo unavyolinda mada yako')}
        lead={t(
          'sec_page_lead',
          'Kuanzia uthibitisho wa seva hadi kumbukumbu isiyoweza kufutika, kila hatua inalindwa.'
        )}
        primary={{ label: t('help_rules_heading', 'Sheria 9 za Mfumo'), to: '/help' }}
      />
      <SecuritySection />
    </>
  );
}
