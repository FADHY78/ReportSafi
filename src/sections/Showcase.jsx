import { useEffect, useState } from 'react';
import { getCatalogue, getProgrammes } from '../lib/api';
import { StatusTag } from '../ui/primitives';
import { IconSearch, IconFilter, IconCheck, IconShield } from '../ui/Icons';
import { useLanguage } from '../lib/i18n';

/**
 * Live preview of the catalogue. The rows, codes and availability flags are
 * real records read from Supabase — nothing here is mock data.
 */
export default function Showcase() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [programme, setProgramme] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const programmes = await getProgrammes();
      if (!alive || !programmes.length) return;
      const first = programmes[0];
      const result = await getCatalogue({ programmeId: first.id, status: 'all', pageSize: 4 });
      if (!alive) return;
      setProgramme(first);
      setRows(result.rows || []);
      setTotal(result.total ?? null);
    })().catch(() => {
      /* the rest of the page still renders if the preview is unavailable */
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="section section-alt" id="product">
      <div className="container">
        <div className="showcase">
          <div className="showcase-copy">
            <span className="eyebrow">{t('showcase_eyebrow', 'Orodha ya Mada')}</span>
            <div className="section-head" style={{ marginBottom: 20 }}>
              <h2>{t('showcase_heading', 'Ona mada zilizo wazi kabla ya kuchagua')}</h2>
              <p>{t('showcase_lead', 'Tafuta kwa neno kuu, chagua fani yako, na uone upatikanaji mara moja. Kijani inamaanisha Inapatikana, nyekundu inamaanisha Imechukuliwa — maneno yanaonekana wazi wakati wote.')}</p>
            </div>

            <ul className="showcase-points">
              <li>
                <span className="tick">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                {t('showcase_p1', 'Mpangilio wa kurasa kwa mistari 20, 50 au 100 kwa orodha ya mada 1,000+')}
              </li>
              <li>
                <span className="tick">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                {t('showcase_p2', 'Utafutaji wa haraka kwa jina la mada na fani')}
              </li>
              <li>
                <span className="tick">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                {t('showcase_p3', 'Upatikanaji unathibitishwa upya na mfumo punde unapobonyeza kuthibitisha')}
              </li>
            </ul>
          </div>

          <div className="showcase-app" aria-hidden="true">
            <div className="app-chrome">
              <span className="app-dot" />
              <span className="app-dot" />
              <span className="app-dot" />
              <span className="app-url mono">reportsafi.me/#/catalogue</span>
            </div>

            <div className="app-toolbar">
              <span className="app-search">
                <IconSearch size={15} />
                {programme ? `${programme.code} · case study…` : t('showcase_loading', 'Mada zilizopo zinapakuliwa…')}
              </span>
              <span className="app-filter">
                <IconFilter size={14} /> {programme?.code || 'Programme'}
              </span>
            </div>

            <div className="app-rows">
              {rows.length ? (
                rows.map((r) => (
                  <div className="app-row" key={r.id}>
                    <span className="app-row-code mono">{r.code}</span>
                    <span className="app-row-title">{r.text}</span>
                    <StatusTag status={r.available ? 'available' : 'unavailable'} />
                  </div>
                ))
              ) : (
                <div className="app-row">
                  <span className="app-row-title">{t('showcase_loading', 'Mada zilizopo zinapakuliwa…')}</span>
                </div>
              )}
            </div>

            <div className="app-foot">
              <span className="mono">
                {rows.length} / {total == null ? '—' : total.toLocaleString('en-GB')} {t('cat_records', 'mada')}
              </span>
              <span className="app-confirm">
                <IconShield size={14} /> {t('confirm_btn', 'Thibitisha Uchaguzi')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
