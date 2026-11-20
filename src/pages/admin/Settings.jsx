import { useEffect, useState } from 'react';
import { getSiteContent, updateSiteContent, ApiError } from '../../lib/api';
import { withDefaults } from '../../lib/content';
import { useToast } from '../../lib/toast';
import { Btn, Field, Notice, SkeletonRows } from '../../ui/primitives';
import { IconCheck, IconShield, IconSliders } from '../../ui/Icons';

export default function Settings({ admin }) {
  const notify = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  const [meta, setMeta] = useState({ academicYear: '', refPrefix: '' });
  const [contact, setContact] = useState({ email: '', phone: '', phoneHref: '', hours: '' });
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    let alive = true;
    getSiteContent()
      .then((stored) => {
        if (!alive) return;
        const c = withDefaults(stored);
        setMeta(c.meta);
        setContact(c.contact);
        setPricing(c.pricing);
      })
      .catch(() => notify('Could not load site settings.', 'error'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [notify]);

  const saveContactAndMeta = async (e) => {
    e.preventDefault();
    setSaving('contact');
    try {
      const phoneDigits = contact.phone.replace(/[^\d+]/g, '');
      const cleanContact = { ...contact, phoneHref: `tel:${phoneDigits}` };
      await updateSiteContent({
        key: 'contact',
        data: cleanContact,
        reason: 'Updated contact information from admin workspace',
        actor: admin,
      });
      await updateSiteContent({
        key: 'meta',
        data: meta,
        reason: 'Updated portal metadata from admin workspace',
        actor: admin,
      });
      setContact(cleanContact);
      notify('Contact details and academic year saved.', 'success');
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Failed to save contact settings.', 'error');
    } finally {
      setSaving('');
    }
  };

  const updatePlan = (idx, field, value) => {
    setPricing((prev) => prev.map((plan, i) => (i === idx ? { ...plan, [field]: value } : plan)));
  };

  const savePricing = async (e) => {
    e.preventDefault();
    setSaving('pricing');
    try {
      await updateSiteContent({
        key: 'pricing',
        data: pricing,
        reason: 'Updated pricing packages from admin workspace',
        actor: admin,
      });
      notify('Pricing cards updated live on the student portal.', 'success');
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Failed to save pricing cards.', 'error');
    } finally {
      setSaving('');
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-body">
          <SkeletonRows rows={6} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <Notice tone="info" icon={IconShield}>
        Changes saved here update the live <span className="mono">site_content</span> store used by
        the student portal and are recorded in the audit log.
      </Notice>

      <section className="panel">
        <div className="panel-head">
          <span className="panel-title">
            <IconSliders size={17} /> Portal metadata &amp; support contact
          </span>
        </div>
        <form className="panel-body" onSubmit={saveContactAndMeta}>
          <div className="form-grid-2">
            <Field label="Academic year" htmlFor="set-year">
              <input
                id="set-year"
                className="inp"
                value={meta.academicYear}
                onChange={(e) => setMeta((m) => ({ ...m, academicYear: e.target.value }))}
              />
            </Field>
            <Field label="Support email" htmlFor="set-email">
              <input
                id="set-email"
                className="inp"
                value={contact.email}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              />
            </Field>
            <Field label="Support phone / WhatsApp" htmlFor="set-phone">
              <input
                id="set-phone"
                className="inp mono"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              />
            </Field>
            <Field label="Office hours" htmlFor="set-hours">
              <input
                id="set-hours"
                className="inp"
                value={contact.hours}
                onChange={(e) => setContact((c) => ({ ...c, hours: e.target.value }))}
              />
            </Field>
          </div>
          <Btn type="submit" variant="gold" icon={IconCheck} disabled={saving === 'contact'}>
            {saving === 'contact' ? 'Saving…' : 'Save contact & metadata'}
          </Btn>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <span className="panel-title">
            <IconSliders size={17} /> Pricing packages
          </span>
          <span className="small muted">{pricing.length} packages</span>
        </div>
        <form className="panel-body" onSubmit={savePricing}>
          <div style={{ display: 'grid', gap: 20 }}>
            {pricing.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  padding: 18,
                  borderRadius: 'var(--r-m)',
                  border: '1px solid var(--line)',
                  background: 'var(--paper-2)',
                }}
              >
                <div className="form-grid-2">
                  <Field label="Package name" htmlFor={`p-name-${idx}`}>
                    <input
                      id={`p-name-${idx}`}
                      className="inp"
                      value={plan.name}
                      onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                    />
                  </Field>
                  <Field label="Price" htmlFor={`p-price-${idx}`}>
                    <input
                      id={`p-price-${idx}`}
                      className="inp mono"
                      value={plan.price}
                      onChange={(e) => updatePlan(idx, 'price', e.target.value)}
                    />
                  </Field>
                  <Field label="Unit" htmlFor={`p-unit-${idx}`}>
                    <input
                      id={`p-unit-${idx}`}
                      className="inp"
                      value={plan.unit}
                      onChange={(e) => updatePlan(idx, 'unit', e.target.value)}
                    />
                  </Field>
                  <Field label="Button label" htmlFor={`p-cta-${idx}`}>
                    <input
                      id={`p-cta-${idx}`}
                      className="inp"
                      value={plan.cta}
                      onChange={(e) => updatePlan(idx, 'cta', e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Short summary" htmlFor={`p-note-${idx}`}>
                  <input
                    id={`p-note-${idx}`}
                    className="inp"
                    value={plan.note}
                    onChange={(e) => updatePlan(idx, 'note', e.target.value)}
                  />
                </Field>
                <Field
                  label="Feature bullets (one per line)"
                  htmlFor={`p-feat-${idx}`}
                >
                  <textarea
                    id={`p-feat-${idx}`}
                    className="inp"
                    rows={5}
                    value={(plan.features || []).join('\n')}
                    onChange={(e) =>
                      updatePlan(
                        idx,
                        'features',
                        e.target.value
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </Field>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <Btn type="submit" variant="gold" icon={IconCheck} disabled={saving === 'pricing'}>
              {saving === 'pricing' ? 'Saving pricing…' : 'Save pricing packages'}
            </Btn>
          </div>
        </form>
      </section>
    </div>
  );
}
