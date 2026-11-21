import { Link } from '../lib/router';
import { IconClock, IconSearch, IconPrinter, IconGraduation, IconArrowRight } from '../ui/Icons';
import { useLanguage } from '../lib/i18n';

export default function WhySafi() {
  const { t } = useLanguage();

  const values = [
    {
      no: '01',
      icon: IconClock,
      title: t('why_card1_title', 'Okoa muda na usumbufu'),
      text: t(
        'why_card1_text',
        'Hakuna foleni ofisini, hakuna kubishania mada wala kukagua spreadsheets. Mfumo unakuonyesha papo hapo kama mada bado iko wazi.'
      ),
    },
    {
      no: '02',
      icon: IconSearch,
      title: t('why_card2_title', 'Rahisi kwenye simu au kompyuta'),
      text: t(
        'why_card2_text',
        'Chagua kozi yako, tafuta mada na uihifadhi kupitia simu yako popote ulipo — mfumo huo huo unafanya kazi kompyuta za maabara ya chuo.'
      ),
    },
    {
      no: '03',
      icon: IconPrinter,
      title: t('why_card3_title', 'Tayari kwa msimamizi wako'),
      text: t(
        'why_card3_text',
        'Uthibitisho wako unakuja na namba rasmi ya kumbukumbu (Reference) na tarehe unayoweza kuichapa au kuituma kwa msimamizi wako bila kuambiwa “njoo kesho”.'
      ),
    },
    {
      no: '04',
      icon: IconGraduation,
      title: t('why_card4_title', 'Kulingana na vigezo vya Tanzania'),
      text: t(
        'why_card4_text',
        'Mada zote na ripoti zinafuata miongozo ya vyuo vikuu vya Tanzania na Tume ya Vyuo Vikuu (TCU), zikiwa na kumbukumbu kamili ya ukaguzi.'
      ),
    },
  ];

  return (
    <section className="section" id="why-safi">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('why_eyebrow', 'Kwa Nini Report Safi')}</span>
          <h2>{t('why_heading', 'Kazi ngumu na usumbufu tuachie sisi')}</h2>
          <p>
            {t(
              'why_sub',
              'Report Safi ilianza kwa kuondoa msongo wa mawazo kwenye uandishi wa ripoti na proposals za utafiti. Mfumo huu unaendeleza ahadi hiyo kwa uchaguzi wa mada: hakuna foleni, kumbukumbu safi, na kazi iliyo tayari kuwasilishwa.'
            )}
          </p>
        </div>

        <div className="value-grid">
          {values.map((v) => (
            <article className="value-card" key={v.no}>
              <span className="value-no">{v.no}</span>
              <span className="value-icon">
                <v.icon size={19} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>

        <div className="value-banner">
          <div>
            <span className="eyebrow-light">Dhamira Kuu</span>
            <h2>Mada moja. Mwanafunzi mmoja. Uthibitisho mmoja wa maandishi.</h2>
            <p>
              Mfumo unadhibiti kanuni kiotomatiki wakati unachagua, ili idara ya utafiti isipate mkanganyiko wa wanafunzi wawili kudai mada moja.
            </p>
          </div>
          <Link to="/help" className="btn btn-outline">
            {t('hero_btn_works', 'Jinsi Mfumo Unavyofanya Kazi')} <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
