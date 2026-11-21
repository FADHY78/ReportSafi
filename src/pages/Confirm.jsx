import { useEffect, useState } from 'react';
import { navigate, useRoute } from '../lib/router';
import {
  reserve,
  changeSelectionTitle,
  getSelectionByRef,
  getTitleById,
  ApiError,
} from '../lib/api';
import { useToast } from '../lib/toast';
import { useLanguage } from '../lib/i18n';
import { DAR_ES_SALAAM_UNIVERSITIES, getInstitutionName } from '../lib/institutions';
import { Btn, Field, Notice, SkeletonRows } from '../ui/primitives';
import { IconArrowLeft, IconCheck, IconAlert, IconLock, IconShield, IconRefresh } from '../ui/Icons';

export default function Confirm({ session, onSyncSession }) {
  const notify = useToast();
  const { t } = useLanguage();
  const { query } = useRoute();
  const titleId = query?.get('title') || '';
  const editRef = (query?.get('editRef') || '').trim().toUpperCase();

  const [title, setTitle] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [supervisorName, setSupervisorName] = useState(session?.student?.supervisorName || '');
  const [institution, setInstitution] = useState(session?.student?.institution || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const student = session?.student;
  const programme = session?.programme;
  const isEditMode = Boolean(editRef);

  useEffect(() => {
    let alive = true;
    if (!titleId) {
      setLoading(false);
      return () => { };
    }
    Promise.all([
      getTitleById(titleId),
      editRef ? getSelectionByRef(editRef) : Promise.resolve(null),
    ])
      .then(([t, sel]) => {
        if (!alive) return;
        const targetProgId = student?.programmeId || sel?.student?.programmeId;
        if (t && targetProgId && t.programmeId !== targetProgId) setTitle(null);
        else setTitle(t);
        setCurrentSelection(sel);
        if (sel?.student?.supervisorName) {
          setSupervisorName(sel.student.supervisorName);
        } else if (student?.supervisorName) {
          setSupervisorName(student.supervisorName);
        }
        if (sel?.student?.institution) {
          setInstitution(sel.student.institution);
        } else if (student?.institution) {
          setInstitution(student.institution);
        }
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [titleId, editRef, student?.programmeId, student?.supervisorName, student?.institution]);

  const confirm = async () => {
    if (!title || busy) return;
    setBusy(true);
    setError('');
    try {
      if (isEditMode) {
        const updated = await changeSelectionTitle({
          ref: editRef,
          newTitleId: title.id,
          supervisorName,
          institution,
          reason,
        });
        if (updated?.student && updated?.programme && onSyncSession) {
          onSyncSession({ student: updated.student, programme: updated.programme });
        }
        notify('Mada imebadilishwa kikamilifu na kuhifadhiwa kwenye mfumo.', 'success');
        navigate(`/reference?ref=${encodeURIComponent(updated.ref)}`);
      } else {
        const selection = await reserve({ studentId: student.id, titleId: title.id });
        notify('Mada imehifadhiwa kikamilifu.', 'success');
        navigate(`/reference?ref=${encodeURIComponent(selection.ref)}`);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Uchaguzi haukuweza kukamilika.';
      setError(msg);
      notify(msg, 'error');
      if (err.code === 'unavailable' || err.code === 'already_selected') {
        const dest = isEditMode ? `/catalogue?editRef=${encodeURIComponent(editRef)}` : '/catalogue';
        window.setTimeout(() => navigate(dest), 1600);
      }
      setBusy(false);
    }
  };

  if (!student) return null;

  const backTarget = isEditMode
    ? `/catalogue?editRef=${encodeURIComponent(editRef)}`
    : '/catalogue';

  return (
    <div className="container">
      <div className="cat-head">
        <span className="eyebrow">
          {isEditMode ? `Badilisha Mada · ${editRef}` : t('id_eyebrow', 'Hatua ya 03 · Uthibitisho')}
        </span>
        <h1>{isEditMode ? t('cat_btn_swap', 'Thibitisha mada yako mpya') : t('confirm_title', 'Thibitisha uchaguzi wa mada yako')}</h1>
        <p className="lead" style={{ maxWidth: '62ch' }}>
          {isEditMode
            ? 'Kagua mabadiliko ya mada hapa chini. Ukithibitisha, mada yako ya awali itaachiwa wazi mara moja kwa ajili ya wanafunzi wengine, na mada mpya itahifadhiwa chini ya namba yako ya kumbukumbu.'
            : 'Kagua taarifa zote hapa chini. Kubonyeza thibitisha kunatuma maombi kwenye mfumo, ambao unakagua upatikanaji mara ya mwisho kabla ya kuhifadhi rasmi.'}
        </p>
      </div>

      {error && (
        <Notice tone="error" icon={IconAlert}>
          {error}
        </Notice>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <span className="panel-title">
            <IconShield size={17} /> {isEditMode ? 'Muhtasari wa mabadiliko ya mada' : 'Muhtasari wa uchaguzi'}
          </span>
          <span className="tag tag-amber">
            {isEditMode ? `Marekebisho ya ${editRef}` : 'Bado haijathibitishwa'}
          </span>
        </div>

        <div className="panel-body">
          {loading ? (
            <SkeletonRows rows={3} />
          ) : !title ? (
            <Notice tone="error" icon={IconAlert}>
              Mada hiyo haikupatikana kwenye programu yako.{' '}
              <button
                className="btn btn-outline btn-sm"
                style={{ marginLeft: 8 }}
                onClick={() => navigate(backTarget)}
              >
                Rudi kwenye orodha ya mada
              </button>
            </Notice>
          ) : (
            <>
              <div className="review-grid">
                {isEditMode && currentSelection?.title && (
                  <div className="review-item wide">
                    <div className="k">Mada ya awali (itaachiwa wazi)</div>
                    <div className="v small muted" style={{ lineHeight: 1.5 }}>
                      <span className="mono">{currentSelection.title.code}</span> —{' '}
                      {currentSelection.title.text}
                    </div>
                  </div>
                )}
                <div className="review-item wide">
                  <div className="k">{isEditMode ? 'Mada mpya itakayohifadhiwa' : 'Mada itakayohifadhiwa'}</div>
                  <div className="v" style={{ fontFamily: 'var(--serif)', fontSize: '1.08rem', lineHeight: 1.5 }}>
                    {title.text}
                  </div>
                </div>
                <div className="review-item">
                  <div className="k">Nambari ya mada</div>
                  <div className="v mono">{title.code}</div>
                </div>
                <div className="review-item">
                  <div className="k">Fani / Kipengele</div>
                  <div className="v">{title.category}</div>
                </div>
                <div className="review-item">
                  <div className="k">Mwanafunzi</div>
                  <div className="v">{student.names}</div>
                </div>
                <div className="review-item">
                  <div className="k">Namba ya usajili</div>
                  <div className="v mono">{student.regNo}</div>
                </div>
                <div className="review-item">
                  <div className="k">Chuo Kikuu / Taasisi</div>
                  <div className="v">{getInstitutionName(student.institution || institution) || '—'}</div>
                </div>
                <div className="review-item">
                  <div className="k">Msimamizi wa Utafiti (Supervisor)</div>
                  <div className="v">{student.supervisorName || supervisorName || '—'}</div>
                </div>
                <div className="review-item">
                  <div className="k">Namba ya simu</div>
                  <div className="v mono">{student.phone}</div>
                </div>
                <div className="review-item wide">
                  <div className="k">Programu / Kozi</div>
                  <div className="v">
                    {programme?.code} — {programme?.name}
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="form-grid-2" style={{ marginTop: 18 }}>
                  <Field
                    label="Chuo Kikuu / Taasisi (Dar es Salaam)"
                    htmlFor="change-inst"
                    hint="Badilisha chuo chako kama kimebadilika"
                  >
                    <select
                      id="change-inst"
                      className="select"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                    >
                      <option value="">-- Chagua Chuo Kikuu / Taasisi --</option>
                      {DAR_ES_SALAAM_UNIVERSITIES.map((u) => (
                        <option key={u.code} value={u.code}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Msimamizi wa Utafiti (Supervisor)"
                    htmlFor="change-sup"
                    hint="Rekebisha jina la msimamizi kama limebadilika"
                  >
                    <input
                      id="change-sup"
                      className="inp"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="Dr. Asha Mnyamzi"
                    />
                  </Field>

                  <Field
                    label="Sababu ya kubadilisha mada (siyo lazima)"
                    htmlFor="change-reason"
                    hint="Inarekodiwa kwenye mfumo na kuonekana na msimamizi"
                  >
                    <input
                      id="change-reason"
                      className="inp"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Mfano: Ushauri wa msimamizi kubadili mlengo wa mada"
                    />
                  </Field>
                </div>
              )}

              <Notice tone={isEditMode ? 'info' : 'warn'} icon={isEditMode ? IconRefresh : IconLock}>
                {isEditMode ? (
                  <>
                    <strong>Namba yako ya kumbukumbu inabaki ile ile: {editRef}.</strong> Mada yako ya
                    awali itaachiwa wazi kwa wanafunzi wengine mara moja, na mada zote mbili zitarekodiwa
                    kwenye historia ya mabadiliko.
                  </>
                ) : (
                  <>
                    <strong>Hifadhi namba yako ya kumbukumbu baada ya kuthibitisha.</strong> Mwanafunzi
                    mmoja anamiliki mada moja kwa wakati mmoja — ukitaka kurekebisha taarifa au kubadilisha
                    mada nyingine iliyo wazi, utatumia namba hii.
                  </>
                )}
              </Notice>

              <div className="confirm-actions">
                <Btn
                  variant="gold"
                  size="lg"
                  icon={isEditMode ? IconRefresh : IconCheck}
                  onClick={confirm}
                  disabled={busy}
                >
                  {busy
                    ? 'Inathibitisha kwenye mfumo…'
                    : isEditMode
                      ? 'Thibitisha mabadiliko ya mada'
                      : 'Thibitisha na hifadhi mada'}
                </Btn>
                <Btn variant="outline" size="lg" icon={IconArrowLeft} onClick={() => navigate(backTarget)}>
                  Rudi kwenye orodha ya mada
                </Btn>
              </div>

              <p className="form-footnote">
                <IconShield size={14} />
                Mfumo unakagua tena kwamba mada bado iko wazi papo hapo unapothibitisha. Ikiwa mwanafunzi
                mwingine atawahi kukamilisha kabla yako, utaarifiwa mara moja na kurudishwa kwenye orodha ya mada.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
