import {
  IconLock,
  IconShield,
  IconHistory,
  IconDownload,
  IconUpload,
  IconRefresh,
} from '../ui/Icons';
import { useLanguage } from '../lib/i18n';

const ITEMS_SW = [
  {
    icon: IconShield,
    title: 'Upatikanaji unaothibitishwa na seva',
    text: 'Kila hifadhi ya mada inasoma daftari rasmi upya na kukagua sheria zote tisa kabla ya kuidhinishwa — kivinjari hakina uamuzi wa mwisho.',
  },
  {
    icon: IconLock,
    title: 'Usimamizi wa vyeo na ruhusa',
    text: 'Vyeo vya msimamizi (Admin) na msimamizi mkuu, kuingia kwa njia salama, na kila hatua ya watumishi inarekodiwa kwa jina lao badala ya jina la jumla.',
  },
  {
    icon: IconHistory,
    title: 'Kumbukumbu ya ukaguzi isiyofutika',
    text: 'Upakiaji wa mada, marekebisho, kuachiliwa kwa mada na uingiaji wa mfumo vinahifadhiwa vikiwa na tarehe, muda, mhusika na sababu kamili.',
  },
  {
    icon: IconUpload,
    title: 'Uhakiki thabiti wa faili za CSV',
    text: 'Faili zinazopakiwa zinakaguliwa kabla ya kuingizwa: mada zilizorudiwa, mada fupi mno na makosa mengine yanaonyeshwa mstari kwa mstari.',
  },
  {
    icon: IconDownload,
    title: 'Taarifa zako ziko huru na salama',
    text: 'Orodha ya mada, kumbukumbu za wanafunzi na ripoti za ukaguzi zinaweza kupakuliwa kama CSV ya Excel wakati wowote bila vikwazo.',
  },
  {
    icon: IconRefresh,
    title: 'Majibu sawa kwenye vifaa vyote',
    text: 'Fungua mfumo kwenye vifaa viwili kwa wakati mmoja, vyote vitaona hali sawa ya mada — mabadiliko yanaonekana moja kwa moja ili mtu asitumie taarifa za zamani.',
  },
];

const ITEMS_EN = [
  {
    icon: IconShield,
    title: 'Server-authoritative availability',
    text: 'Every reservation re-reads the register inside an exclusive lock and re-checks all nine business rules before it commits — the browser never has the final word.',
  },
  {
    icon: IconLock,
    title: 'Role-based staff access',
    text: 'Administrator and system-administrator roles, separate sign-in, and staff actions attributed by name in the log — not by “someone from the office”.',
  },
  {
    icon: IconHistory,
    title: 'Immutable audit history',
    text: 'Imports, edits, releases, sign-ins and rejections are appended with actor, time, reason and before/after values. Nothing is quietly overwritten.',
  },
  {
    icon: IconUpload,
    title: 'Validated CSV import',
    text: 'Uploads are previewed before they land: duplicates, short titles and rows already in the programme are rejected with a plain explanation, row by row.',
  },
  {
    icon: IconDownload,
    title: 'Your data leaves with you',
    text: 'Catalogue, selection records and the audit log export as UTF-8 CSV that opens in Excel or Google Sheets. No lock-in, no proprietary format.',
  },
  {
    icon: IconRefresh,
    title: 'Same answer on every screen',
    text: 'Open the portal in two browsers at once and both see the same availability — changes broadcast live across tabs so nobody works from a stale list.',
  },
];

export default function Security() {
  const { t, isSwahili } = useLanguage();
  const items = isSwahili ? ITEMS_SW : ITEMS_EN;

  return (
    <section className="section" id="security">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('sec_eyebrow', 'Uaminifu na Usalama')}</span>
          <h2>{t('sec_heading', 'Mambo ambayo wakaguzi na vyuo huuliza kwanza')}</h2>
          <p>
            {t(
              'sec_lead',
              'Imejengwa kufuata miongozo na sheria tisa (BR-01 … BR-09), na ulinzi thabiti kwenye seva bila kubahatisha.'
            )}
          </p>
        </div>

        <div className="trust-grid">
          {items.map((i) => (
            <article className="trust-item" key={i.title}>
              <span className="trust-icon">
                <i.icon size={18} />
              </span>
              <h3>{i.title}</h3>
              <p>{i.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
