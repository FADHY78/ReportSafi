import { navigate } from '../lib/router';
import { goSection } from '../lib/scroll';
import { Btn } from '../ui/primitives';
import { IconArrowRight, IconFileText } from '../ui/Icons';
import { useLanguage } from '../lib/i18n';

/** Closing call to action — sits directly above the footer on the home page. */
export default function CtaBand() {
  const { t } = useLanguage();

  return (
    <section className="cta-band" id="get-started">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow eyebrow-light">{t('cta_eyebrow', 'Dirisha la Uchaguzi · 2026 / 2027')}</span>
          <h2>{t('cta_heading', 'Chagua mada yako mapema kabla hazijachukuliwa.')}</h2>
          <p>
            {t(
              'cta_lead',
              'Taarifa sita, dakika moja, namba moja ya kumbukumbu. Upatikanaji unakaguliwa unapoithibitisha — siyo ukurasa ulipofunguka.'
            )}
          </p>
        </div>
        <div className="cta-actions">
          <Btn variant="gold" size="lg" icon={IconArrowRight} onClick={() => navigate('/catalogue')}>
            {t('cta_btn_browse', 'Angalia mada zilizopo')}
          </Btn>
          <Btn variant="ghost-light" size="lg" icon={IconFileText} onClick={() => goSection('identify')}>
            {t('cta_btn_identify', 'Jaza taarifa zako kwanza')}
          </Btn>
        </div>
      </div>
    </section>
  );
}
