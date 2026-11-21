import { useState } from 'react';
import { Notice } from '../ui/primitives';
import { IconAlert, IconShield, IconLock, IconMail, IconPhone, IconClock } from '../ui/Icons';
import { useSiteContent } from '../lib/useSiteContent';
import { useLanguage } from '../lib/i18n';

const STEPS_SW = [
  {
    n: '01',
    title: 'Jitambulishe',
    text: 'Namba ya usajili, majina kamili, chuo chako cha Dar es Salaam, msimamizi na kozi unayosomea.',
  },
  {
    n: '02',
    title: 'Tafuta kwenye orodha',
    text: 'Tafuta kwa neno kuu na fani. Mistari ya kijani iko wazi; mistari ya nyekundu imeshachukuliwa.',
  },
  {
    n: '03',
    title: 'Kagua na uthibitishe',
    text: 'Kagua taarifa zako na maelezo ya mada kabla ya kuhifadhi rasmi.',
  },
  {
    n: '04',
    title: 'Hifadhi namba ya kumbukumbu',
    text: 'Mada inafungwa kwa wengine na unapata namba rasmi ya kumbukumbu (Reference) yenye tarehe.',
  },
];

const STEPS_EN = [
  {
    n: '01',
    title: 'Identify yourself',
    text: 'Registration number, full names, Dar es Salaam institution, supervisor name and programme.',
  },
  {
    n: '02',
    title: 'Search the catalogue',
    text: 'Filter by keyword and availability. Green rows are free; red rows are already reserved.',
  },
  {
    n: '03',
    title: 'Review and confirm',
    text: 'Check your details against the title before anything is saved. This is your last chance to stop.',
  },
  {
    n: '04',
    title: 'Keep your reference',
    text: 'The title closes to everyone else and you receive a dated reference you can print or copy.',
  },
];

const RULES_SW = [
  { id: 'BR-01', title: 'Mada moja kwa mwanafunzi mmoja', text: 'Mwanafunzi anaruhusiwa kuwa na mada moja tu inayofanya kazi kwa wakati mmoja.' },
  { id: 'BR-02', title: 'Mwanafunzi mmoja kwa kila mada', text: 'Mada moja haiwezi kushikiliwa au kuchaguliwa na wanafunzi wawili.' },
  { id: 'BR-03', title: 'Haipatikani inamaanisha imeshachaguliwa', text: 'Mada inakuwa imechukuliwa pale tu mwanafunzi anapomaliza kuthibitisha kikamilifu.' },
  { id: 'BR-04', title: 'Mfumo unaamua kwenye seva', text: 'Kivinjari chako kinaonyesha upatikanaji pekee; hakina mamlaka ya kuthibitisha umiliki.' },
  { id: 'BR-05', title: 'Taarifa zote sita ni lazima', text: 'Namba ya usajili, majina kamili, chuo cha Dar es Salaam, msimamizi, simu na kozi ni lazima.' },
  { id: 'BR-06', title: 'Kozi na fani yako pekee', text: 'Unaweza kuchagua mada zinazohusu fani au kozi unayosomea pekee.' },
  { id: 'BR-07', title: 'Mabadiliko yote yanakaguliwa', text: 'Watumishi wanapoachia au kurekebisha mada, lazima watoe sababu na jina lao linarekodiwa.' },
  { id: 'BR-08', title: 'Orodha kubwa ya mada', text: 'Kila kozi inatoa zaidi ya mada 1,000+ zilizoidhinishwa ili kutoa wigo mpana wa uchaguzi.' },
  { id: 'BR-09', title: 'Hakuna usajili mara mbili', text: 'Namba moja ya usajili wa chuo haiwezi kufanya chaguzi mbili tofauti.' },
];

const FAQS_SW = [
  {
    q: 'Najua vipi kuwa mada bado iko wazi?',
    a: 'Upatikanaji unathibitishwa na seva papo hapo unapobonyeza thibitisha. "Inapatikana" (kijani) inamaanisha mada iko wazi; "Imechukuliwa" (nyekundu) inamaanisha mwanafunzi mwingine ameshahifadhi.',
  },
  {
    q: 'Je, ninaweza kuchagua zaidi ya mada moja?',
    a: 'Hapana. Sheria ya BR-01 inaruhusu mada moja tu kwa kila mwanafunzi, na mfumo unazuia uchaguzi wa pili.',
  },
  {
    q: 'Je, ninaweza kubadilisha mada baada ya kuchagua?',
    a: 'Ndio. Weka namba yako ya kumbukumbu (Reference) kwenye ukurasa wa mwanzo au bofya "Badilisha Mada" kwenye ukurasa wa kumbukumbu yako ili kuchagua mada nyingine iliyo wazi.',
  },
  {
    q: 'Nini maana ya "taarifa hazijahakikiwa chuoni"?',
    a: 'Mfumo unahifadhi taarifa ulizoingiza kwa ajili ya utaratibu wa mada, lakini hauziunganishi moja kwa moja na mifumo ya usajili wa chuo.',
  },
  {
    q: 'Mwanafunzi mwingine akichukua mada niliyotaka, nifanyeje?',
    a: 'Hifadhi yako haitakamilika, kwa hiyo rudi kwenye orodha ya mada na uchague mada nyingine iliyo wazi. Kuna maelfu ya mada zilizoidhinishwa.',
  },
  {
    q: 'Je, kuchagua mada kuna gharama yoyote?',
    a: 'Hapana. Kuchagua na kuhifadhi mada kwenye Report Safi ni bure 100%. Vifurushi vya hiari vya uandishi wa kitaalamu wa ripoti au proposal vinatozwa ada kulingana na mahitaji yako.',
  },
];

export default function Help() {
  const [open, setOpen] = useState(0);
  const { rules: siteRules, faqs: siteFaqs, contact, meta } = useSiteContent();
  const { t, isSwahili } = useLanguage();

  const steps = isSwahili ? STEPS_SW : STEPS_EN;
  const rules = isSwahili ? RULES_SW : siteRules;
  const faqs = isSwahili ? FAQS_SW : siteFaqs;

  return (
    <>
      {/* ------------------------------------------------------------- intro */}
      <section className="help-hero">
        <div className="container">
          <span className="eyebrow">{t('help_eyebrow', `Kituo cha Msaada · ${meta.academicYear}`)}</span>
          <h1>{t('help_heading', 'Uchaguzi wa mada kwa lugha rahisi.')}</h1>
          <p className="lead">
            {t(
              'help_lead',
              'Jitambulishe, hifadhi mada moja iliyo wazi, na uhifadhi namba yako ya kumbukumbu. Kila hatua inakaguliwa na mfumo kabla ya kuhifadhiwa.'
            )}
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- process */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t('help_steps_eyebrow', 'Utaratibu')}</span>
            <h2>{t('help_steps_heading', 'Hatua nne')}</h2>
            <p>{t('help_steps_sub', 'Kuanzia kujitambulisha hadi kupata namba ya kumbukumbu.')}</p>
          </div>
          <div className="steps">
            {steps.map((s) => (
              <article className="step" key={s.n}>
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- rules/change */}
      <section className="section" id="help-rules">
        <div className="container two-col">
          <div>
            <span className="eyebrow">{t('help_rules_eyebrow', 'Sheria za Mfumo')}</span>
            <div className="section-head">
              <h2>{t('help_rules_heading', 'Sheria tisa zinazosimamiwa na mfumo')}</h2>
              <p>{t('help_rules_sub', 'Zinakaguliwa wakati wa kuthibitisha — kamwe siyo kwenye kivinjari pekee.')}</p>
            </div>

            <Notice tone="info" icon={IconShield}>
              {t('help_rules_notice', 'Wanafunzi wawili wakithibitisha mada moja sekunde moja, mmoja pekee ndiye anayefanikiwa.')}
            </Notice>

            <div className="panel help-change-panel" id="help-changes">
              <div className="panel-head">
                <span className="panel-title">
                  <IconLock size={17} /> {t('help_change_title', 'Unahitaji kufanya mabadiliko?')}
                </span>
              </div>
              <div className="panel-body">
                <p className="small muted" style={{ lineHeight: 1.7 }}>
                  {t(
                    'help_change_desc',
                    'Wanafunzi hawawezi kubadilisha au kuachia mada bila utaratibu. Wasiliana nasi ukiwa na namba yako ya usajili na namba ya kumbukumbu (Reference) ili kubadilisha mada au kurekebisha taarifa.'
                  )}
                </p>
                <div className="help-contact-lines">
                  <a href={`mailto:${contact.email}`}>
                    <IconMail size={15} /> {contact.email}
                  </a>
                  <a href={contact.phoneHref}>
                    <IconPhone size={15} /> {contact.phone}
                  </a>
                  <span>
                    <IconClock size={15} /> {contact.hours}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rule-list">
            {rules.map((r) => (
              <div className="rule-row" key={r.id}>
                <span className="mono">{r.id}</span>
                <div>
                  <strong>{r.title}</strong>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      <section className="section section-alt" id="help-faq">
        <div className="container two-col">
          <div>
            <span className="eyebrow">{t('help_faq_eyebrow', 'Maswali')}</span>
            <div className="section-head">
              <h2>{t('help_faq_heading', 'Maswali yanayoulizwa mara kwa mara')}</h2>
              <p>{t('why_card3_title', 'Majibu kutoka idara ya utafiti.')}</p>
            </div>
            <div className="notice notice-warn" style={{ marginTop: 0 }}>
              <IconAlert size={17} />
              <div>
                <strong>{t('ref_history_title', 'Msaada wa haraka:')}</strong> {t('whatsapp_tooltip', 'Wasiliana nasi WhatsApp kwa msaada wa haraka.')}
              </div>
            </div>
          </div>

          <div className="faq-list">
            {faqs.map((f, i) => (
              <div className={`faq-item${open === i ? ' is-open' : ''}`} key={f.q}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  {f.q}
                  <span className="faq-mark" aria-hidden="true">
                    +
                  </span>
                </button>
                {open === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
