import { useEffect, useRef, useState } from 'react';
import { navigate } from '../lib/router';
import { getProgrammes, getPublicStats, getSelectionByRef, identify, ApiError } from '../lib/api';
import { useToast } from '../lib/toast';
import { useLanguage } from '../lib/i18n';
import { DAR_ES_SALAAM_UNIVERSITIES } from '../lib/institutions';
import { Btn, Field, Notice } from '../ui/primitives';
import {
  IconArrowRight,
  IconCheck,
  IconShield,
  IconUsers,
  IconUserCheck,
  IconHash,
  IconPhone,
  IconGraduation,
  IconAlert,
  IconFileText,
  IconPencil,
  IconBuilding,
} from '../ui/Icons';

import SelectionRecord from '../components/SelectionRecord';
import LogoCloud from '../sections/LogoCloud';
import Showcase from '../sections/Showcase';
import WhySafi from '../sections/WhySafi';
import CtaBand from '../sections/CtaBand';

function AnimatedStat({ value, label }) {
  const hostRef = useRef(null);
  const shownRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (value === null || value === undefined) return undefined;
    const target = Number(value);
    if (!Number.isFinite(target)) return undefined;
    if (!visible) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || target === 0) {
      shownRef.current = target;
      setDisplay(target);
      return undefined;
    }

    const from = shownRef.current || 0;
    const duration = target >= 1000 ? 1200 : target >= 30 ? 850 : 600;
    let rafId = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      shownRef.current = current;
      setDisplay(current);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        shownRef.current = target;
        setDisplay(target);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [value, visible]);

  return (
    <div className="stat" ref={hostRef}>
      <div className="stat-value">
        {value === null || value === undefined
          ? '—'
          : Number(display ?? 0).toLocaleString('en-GB')}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Welcome({ session, onIdentified }) {
  const notify = useToast();
  const { t } = useLanguage();
  const [programmes, setProgrammes] = useState([]);
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    regNo: '',
    names: '',
    phone: '',
    institution: '',
    supervisorName: '',
    programmeId: '',
  });
  const [errors, setErrors] = useState({});
  const [refLookup, setRefLookup] = useState('');
  const [refBusy, setRefBusy] = useState(false);
  const [refError, setRefError] = useState('');

  const needs = [
    {
      icon: IconHash,
      title: t('need_reg_title', 'Namba ya usajili wa chuo'),
      text: t('need_reg_text', 'Namba yako ya chuo, kama ilivyoandikwa kwenye kitambulisho chako cha mwanafunzi.'),
    },
    {
      icon: IconUsers,
      title: t('need_names_title', 'Majina kamili'),
      text: t('need_names_text', 'Majina yako yote kama yanavyoonekana kwenye orodha rasmi ya chuo — bila vifupisho.'),
    },
    {
      icon: IconBuilding,
      title: t('need_inst_title', 'Chuo Kikuu / Taasisi (Dar es Salaam)'),
      text: t('need_inst_text', 'Chuo kikuu au taasisi unayosoma hapa Dar es Salaam (mf. CBE, DMI, NIT, IFM, TIA, n.k.).'),
    },
    {
      icon: IconUserCheck,
      title: t('need_supervisor_title', 'Msimamizi wa utafiti (Supervisor)'),
      text: t('need_supervisor_text', 'Jina kamili la msimamizi wako wa utafiti au mradi uliyepangiwa na chuo.'),
    },
    {
      icon: IconPhone,
      title: t('need_phone_title', 'Namba ya simu inayopatikana'),
      text: t('need_phone_text', 'Namba ya simu unayotumia na inayopokea simu na SMS mara moja.'),
    },
    {
      icon: IconGraduation,
      title: t('need_prog_title', 'Programu / Kozi ya masomo'),
      text: t('need_prog_text', 'Unaweza tu kuona na kuchagua mada zinazohusu fani au kozi unayosomea.'),
    },
  ];

  useEffect(() => {
    let alive = true;
    getProgrammes().then((p) => alive && setProgrammes(p));
    getPublicStats().then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (form.regNo.trim().length < 5) next.regNo = t('err_reg', 'Weka namba yako halisi ya usajili wa chuo.');
    if (form.names.trim().split(/\s+/).filter(Boolean).length < 2)
      next.names = t('err_names', 'Weka majina yako kamili (angalau majina mawili).');
    if (!form.institution)
      next.institution = t('err_inst', 'Chagua chuo kikuu au taasisi yako ya Dar es Salaam.');
    if (form.supervisorName.trim().length < 2)
      next.supervisorName = t('err_supervisor', 'Weka jina kamili la msimamizi wako wa utafiti.');
    if (!form.phone.trim()) next.phone = t('err_phone', 'Weka namba sahihi ya simu inayopatikana.');
    if (!form.programmeId) next.programmeId = t('err_prog', 'Chagua programu au kozi unayosomea.');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openByRef = async (e) => {
    e.preventDefault();
    const clean = refLookup.trim().toUpperCase();
    setRefError('');
    if (!clean) {
      setRefError('Weka namba yako ya kumbukumbu (mfano: RS-TS-2026-00001).');
      return;
    }
    setRefBusy(true);
    try {
      const record = await getSelectionByRef(clean);
      if (!record) {
        setRefError(`Hakuna rekodi ya mada iliyopatikana kwa ${clean}. Hakiki namba yako.`);
        return;
      }
      if (record.student && record.programme) {
        onIdentified({ student: record.student, programme: record.programme });
      }
      navigate(`/reference?ref=${encodeURIComponent(record.ref)}`);
    } catch (err) {
      setRefError(err instanceof ApiError ? err.message : 'Imeshindwa kukagua namba hiyo ya kumbukumbu.');
    } finally {
      setRefBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const result = await identify(form);
      onIdentified(result);
      if (result.existingSelection) {
        notify('Tayari unamiliki mada — inaonyesha uthibitisho wako.', 'success');
        navigate(`/reference?ref=${encodeURIComponent(result.existingSelection.ref)}`);
      } else {
        notify('Utambulisho umethibitishwa. Orodha ya mada iko wazi sasa.', 'success');
        navigate('/catalogue');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Kuna hitilafu imetokea. Tafadhali jaribu tena.';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{t('hero_eyebrow', 'Mada za Utafiti · Research & Project Titles')}</span>
            <h1>
              {t('hero_title_lead', 'Mwanafunzi mmoja, mada moja — ')}
              <em>{t('hero_title_em', 'kwa haki, uwazi na utaratibu.')}</em>
            </h1>
            <p className="lead">
              {t(
                'hero_lead',
                'Tafuta kwenye orodha ya Report Safi iliyoidhinishwa, jua mara moja mada ipi iko wazi, na chagua mada yako ya utafiti au mradi kwa hatua moja iliyothibitishwa. Hakuna foleni, hakuna kurudia mada, hakuna kubahatisha.'
              )}
            </p>

            <div className="hero-actions">
              <Btn variant="gold" size="lg" icon={IconArrowRight} onClick={() => navigate('/catalogue')}>
                {t('hero_btn_catalogue', 'Angalia mada zilizopo')}
              </Btn>
              <Btn variant="outline" size="lg" icon={IconFileText} onClick={() => navigate('/help')}>
                {t('hero_btn_works', 'Jinsi mfumo unavyofanya kazi')}
              </Btn>
            </div>

            <p className="hero-note">
              <IconShield size={16} />
              {t(
                'hero_note',
                'Upatikanaji unathibitishwa na mfumo papo hapo unapochagua — siyo kivinjari chako pekee.'
              )}
            </p>
          </div>

          <SelectionRecord completed={stats?.completed} />
        </div>
      </section>

      {/* --------------------------------------------------- stat strip */}
      <div className="container">
        <div className="stat-strip">
          <AnimatedStat value={stats?.titles ?? null} label={t('stat_titles', 'Mada kwenye orodha')} />
          <AnimatedStat value={stats?.available ?? null} label={t('stat_available', 'Zinazopatikana sasa')} />
          <AnimatedStat value={stats?.programmes ?? null} label={t('stat_programmes', 'Programu / Kozi wazi')} />
          <AnimatedStat value={stats?.today ?? null} label={t('stat_today', 'Zilizochaguliwa leo')} />
        </div>
      </div>

      <LogoCloud />

      {/* ----------------------------------------------- identify + need */}
      <section className="section" id="identify">
        <div className="container two-col">
          <div>
            <span className="eyebrow">{t('id_eyebrow', 'Hatua ya 01 · Utambulisho wa Mwanafunzi')}</span>
            <div className="section-head" style={{ marginBottom: 8 }}>
              <h2>{t('id_heading', 'Kabla hujaingia kwenye orodha ya mada')}</h2>
              <p>
                {t(
                  'id_intro',
                  'Idara ya utafiti inahitaji kujua ni nani anayehifadhi kila mada. Andaa taarifa hizi sita — fomu inachukua chini ya dakika moja.'
                )}
              </p>
            </div>

            <ul className="need-list">
              {needs.map((n) => (
                <li className="need-item" key={n.title}>
                  <span className="need-icon">
                    <n.icon size={17} />
                  </span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Notice tone="warn" icon={IconAlert}>
              <strong>{t('id_disclaimer', 'Taarifa hizi hazithibitishi usajili rasmi wa chuo.')}</strong>
            </Notice>

            {session && (
              <div className="notice notice-info" style={{ marginTop: 14 }}>
                <IconCheck size={17} />
                <div style={{ flex: 1 }}>
                  <strong>
                    {t('id_identified_as', 'Umetambuliwa kama')} {session.student.names}
                  </strong>{' '}
                  ({session.student.regNo}).
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalogue')}>
                      {t('id_continue_cat', 'Endelea kwenye orodha ya mada')} <IconArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            <form className="ref-lookup-card" onSubmit={openByRef} noValidate>
              <div className="ref-lookup-head">
                <span className="eyebrow">{t('ref_lookup_eyebrow', 'Umeshachagua mada tayari?')}</span>
                <h3>
                  {t(
                    'ref_lookup_heading',
                    'Tumia namba yako ya kumbukumbu (Reference) kurekebisha taarifa au kubadilisha mada'
                  )}
                </h3>
                <p className="small muted">
                  {t(
                    'ref_lookup_text',
                    'Weka namba ya kumbukumbu uliyopewa ulipochagua mada (mfano: RS-TS-2026-00001) kurekebisha taarifa za msimamizi, chuo au kuchagua mada nyingine iliyo wazi.'
                  )}
                </p>
              </div>
              <div className="ref-lookup-row">
                <input
                  className="inp mono"
                  value={refLookup}
                  onChange={(e) => {
                    setRefLookup(e.target.value);
                    setRefError('');
                  }}
                  placeholder="RS-TS-2026-00001"
                  aria-label="Selection reference number"
                  spellCheck="false"
                />
                <Btn type="submit" variant="outline" icon={IconPencil} disabled={refBusy}>
                  {refBusy ? t('ref_lookup_checking', 'Inakagua…') : t('ref_lookup_btn', 'Fungua / Rekebisha')}
                </Btn>
              </div>
              {refError && (
                <span className="field-error" style={{ marginTop: 8 }}>
                  <IconAlert size={14} /> {refError}
                </span>
              )}
            </form>
          </div>

          <form className="form-panel" onSubmit={submit} noValidate>
            <div className="form-panel-head">
              <span className="eyebrow">{t('form_eyebrow', 'Taarifa za mwanafunzi')}</span>
              <h2>{t('form_heading', 'Jitambulishe')}</h2>
              <p>{t('form_sub', 'Namba ya usajili · Majina · Chuo · Msimamizi · Simu · Kozi')}</p>
            </div>

            <div className="form-panel-body">
              {error && (
                <Notice tone="error" icon={IconAlert}>
                  {error}
                </Notice>
              )}

              <Field
                label={t('form_reg_label', 'Namba ya usajili wa chuo')}
                required
                htmlFor="regNo"
                error={errors.regNo}
                hint={t('form_reg_hint', 'Mfano: 03.6773.01.01.2022')}
              >
                <input
                  id="regNo"
                  className="inp mono"
                  value={form.regNo}
                  onChange={set('regNo')}
                  placeholder="03.6773.01.01.2022"
                  autoComplete="off"
                  spellCheck="false"
                />
              </Field>

              <div className="field-disclaimer" role="note">
                <IconAlert size={16} />
                <div>
                  <strong>{t('form_reg_disclaimer', 'Tumia namba yako halisi ya usajili wa chuo. Weka namba kamili iliyopo kwenye kitambulisho chako rasmi cha chuo — usitumie namba ya kubahatisha au ya mwanafunzi mwingine.')}</strong>
                </div>
              </div>

              <Field
                label={t('form_names_label', 'Majina kamili')}
                required
                htmlFor="names"
                error={errors.names}
              >
                <input
                  id="names"
                  className="inp"
                  value={form.names}
                  onChange={set('names')}
                  placeholder={t('form_names_placeholder', 'Neema Baraka Mushi')}
                  autoComplete="name"
                />
              </Field>

              <Field
                label={t('form_inst_label', 'Chuo Kikuu / Taasisi (Dar es Salaam)')}
                required
                htmlFor="institution"
                error={errors.institution}
                hint={t('form_inst_hint', 'CBE, DMI, NIT, IFM, TIA, UDSM, DIT, MUHAS, n.k.')}
              >
                <select
                  id="institution"
                  className="select"
                  value={form.institution}
                  onChange={set('institution')}
                >
                  <option value="">
                    {t('form_inst_placeholder', '-- Chagua Chuo Kikuu / Taasisi ya Dar es Salaam --')}
                  </option>
                  {DAR_ES_SALAAM_UNIVERSITIES.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label={t('form_supervisor_label', 'Msimamizi wa Utafiti (Supervisor)')}
                required
                htmlFor="supervisorName"
                error={errors.supervisorName}
                hint={t('form_supervisor_hint', 'Mfano: Dr. Asha Mnyamzi')}
              >
                <input
                  id="supervisorName"
                  className="inp"
                  value={form.supervisorName}
                  onChange={set('supervisorName')}
                  placeholder={t('form_supervisor_placeholder', 'Dr. Asha Mnyamzi')}
                  autoComplete="off"
                />
              </Field>

              <div className="form-grid-2">
                <Field
                  label={t('form_phone_label', 'Namba ya simu inayopatikana')}
                  required
                  htmlFor="phone"
                  error={errors.phone}
                  hint={t('form_phone_placeholder', '0712 345 678')}
                >
                  <input
                    id="phone"
                    className="inp mono"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="0712 345 678"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>

                <Field
                  label={t('form_prog_label', 'Programu / Kozi ya masomo')}
                  required
                  htmlFor="prog"
                  error={errors.programmeId}
                  hint={
                    programmes.length
                      ? `${programmes.length} approved programmes available`
                      : 'Loading approved programmes…'
                  }
                >
                  <select id="prog" className="select" value={form.programmeId} onChange={set('programmeId')}>
                    <option value="">{t('form_prog_placeholder', '-- Chagua kozi unayosomea --')}</option>
                    {['Basic Technician Certificate', 'Ordinary Diploma', 'Bachelor Degree'].map(
                      (award) => {
                        const group = programmes.filter((p) => p.award === award);
                        if (!group.length) return null;
                        return (
                          <optgroup key={award} label={award}>
                            {group.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code} — {p.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      }
                    )}
                  </select>
                </Field>
              </div>

              <div className="form-actions">
                <Btn type="submit" variant="primary" size="lg" disabled={busy} icon={IconArrowRight}>
                  {busy
                    ? t('form_submitting', 'Inathibitisha…')
                    : t('form_submit', 'Thibitisha na Uendelee kwenye Orodha ya Mada')}
                </Btn>
                <span className="small muted">Inachukua chini ya dakika 1.</span>
              </div>

              <p className="form-footnote">
                <IconShield size={14} />
                Uthibitisho unahifadhiwa mara moja. Hifadhi namba yako ya kumbukumbu (Reference) —
                unaweza kuitumia wakati wowote kurekebisha taarifa za msimamizi au kubadilisha mada
                nyingine iliyo wazi.
              </p>
            </div>
          </form>
        </div>
      </section>

      <Showcase />

      <WhySafi />
      <CtaBand />
    </>
  );
}
