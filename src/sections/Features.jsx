import {
  IconGauge,
  IconShield,
  IconHistory,
  IconUpload,
  IconLayers,
  IconEye,
} from '../ui/Icons';
import { useLanguage } from '../lib/i18n';

const FEATURES_SW = [
  {
    icon: IconGauge,
    title: 'Upatikanaji wa uhakika, unaoamuliwa na seva',
    text: 'Unapobonyeza thibitisha, mfumo unakagua daftari upya kwenye seva. Kivinjari hakina mamlaka ya mwisho — kwa hiyo wanafunzi wawili hawawezi kupewa mada moja kamwe.',
    rule: 'BR-03 / BR-04',
  },
  {
    icon: IconShield,
    title: 'Mwanafunzi mmoja, mada moja',
    text: 'Ombi la pili la kuhifadhi mada hukataliwa kwa utaratibu na heshima, na mada inayoshikiliwa haiwezi kuchukuliwa na mtu mwingine. Sheria inatekelezwa kwenye mfumo moja kwa moja.',
    rule: 'BR-01 / BR-02',
  },
  {
    icon: IconHistory,
    title: 'Kila mabadiliko yana kumbukumbu',
    text: 'Kuachia mada, kubadilisha taarifa, au kuongeza mada mpya — kila hatua inarekodiwa na nani aliifanya, lini na kwa nini. Mada haiwezi kuachiwa bila kutoa sababu.',
    rule: 'BR-07',
  },
  {
    icon: IconUpload,
    title: 'Kuingiza na kutoa faili za Excel / CSV',
    text: 'Orodha ya mada inaweza kuingizwa kwa mkupuo kutoka kwenye spreadsheet na kukaguliwa kabla ya kuhifadhiwa. Ripoti zote za uchaguzi zinaweza kupakuliwa wakati wowote.',
    rule: 'BR-08',
  },
  {
    icon: IconLayers,
    title: 'Kulingana na kozi na fani yako',
    text: 'Wanafunzi wanaona tu mada zinazohusu fani na kozi wanayosomea, na kila kozi ina orodha kubwa ya mada zaidi ya 1,000 zilizoidhinishwa.',
    rule: 'BR-06 / BR-09',
  },
  {
    icon: IconEye,
    title: 'Inasomeka kwa kila mtu',
    text: 'Hakuna hali inayoonyeshwa kwa rangi pekee — kila kibandiko kina maandishi wazi. Mfumo mzima unafanya kazi vizuri kwenye simu, kompyuta na hata mtandao ukiwa wa polepole.',
    rule: 'PRD §10',
  },
];

const FEATURES_EN = [
  {
    icon: IconGauge,
    title: 'Live availability, decided by the server',
    text: 'The moment you press confirm, the portal re-checks the register itself. Your browser never gets to decide — so two students cannot walk away with the same title.',
    rule: 'BR-03 / BR-04',
  },
  {
    icon: IconShield,
    title: 'One student, one title',
    text: 'A second reservation is refused politely and clearly, and a title already held cannot be claimed by anyone else. The rule is enforced on every write, not just in the form.',
    rule: 'BR-01 / BR-02',
  },
  {
    icon: IconHistory,
    title: 'Every change leaves a trail',
    text: 'Release a title, edit a wording, import a batch — each action is stamped with who did it, when, and why. Releases cannot be saved without a reason.',
    rule: 'BR-07',
  },
  {
    icon: IconUpload,
    title: 'CSV in, CSV out',
    text: 'Import a whole catalogue from a spreadsheet and see exactly which rows will be rejected before anything is committed. Export selections or the audit log at any time.',
    rule: 'BR-08',
  },
  {
    icon: IconLayers,
    title: 'Scoped to your programme',
    text: 'Students only ever see titles belonging to their own course, and each programme carries a thousand-plus approved titles to choose from.',
    rule: 'BR-06 / BR-09',
  },
  {
    icon: IconEye,
    title: 'Readable by everyone',
    text: 'No status is shown by colour alone — every badge carries a word. The whole flow works from a keyboard, on a phone, and on a slow campus connection.',
    rule: 'PRD §10',
  },
];

export default function Features() {
  const { t, isSwahili } = useLanguage();
  const features = isSwahili ? FEATURES_SW : FEATURES_EN;

  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('feat_eyebrow', 'Ndani ya Mfumo')}</span>
          <h2>{t('feat_heading', 'Mfumo rasmi wa kumbukumbu, siyo fomu ya kawaida')}</h2>
          <p>
            {t(
              'feat_lead',
              'Makosa ya mada hutokea kwa njia ndogo: mada kurudiwa, taarifa kufutwa kisiri, au mabadiliko yasiyokuwa na maelezo. Report Safi imejengwa kuzuia haya yote.'
            )}
          </p>
        </div>

        <div className="feature-grid">
          {features.map((f) => (
            <article className="feature-card" key={f.title}>
              <span className="feature-icon">
                <f.icon size={20} />
              </span>
              <span className="feature-rule">{f.rule}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
