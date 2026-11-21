import { useEffect, useMemo, useState } from 'react';
import { createOrder, getProgrammes, ApiError } from '../lib/api';
import { useSiteContent } from '../lib/useSiteContent';
import { useToast } from '../lib/toast';
import { DAR_ES_SALAAM_UNIVERSITIES } from '../lib/institutions';
import { normPhone, normReg, phoneDisplay } from '../lib/utils';
import { Btn, Field, Modal, Notice } from '../ui/primitives';
import {
  IconAlert,
  IconArrowRight,
  IconCheckCircle,
  IconCopy,
  IconMail,
  IconShield,
  IconWhatsApp,
} from '../ui/Icons';

function waDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits : '255613328915';
}

function buildInitialForm(selectedPackage, packages, session) {
  const pkgName = selectedPackage?.name || packages[1]?.name || packages[0]?.name || '';
  const progLabel = session?.programme
    ? `${session.programme.code} — ${session.programme.name}`
    : '';
  return {
    packageName: pkgName,
    names: session?.student?.names || '',
    regNo: session?.student?.regNo || '',
    phone: session?.student?.phone || '',
    supervisorName: session?.student?.supervisorName || '',
    institution: session?.student?.institution || '',
    programme: progLabel,
    title: session?.existingSelection?.title?.text || '',
    selectionRef: session?.existingSelection?.ref || '',
    notes: '',
  };
}

function formatOrderMessage(order) {
  const lines = [
    'Hello Report Safi, I have placed a package order:',
    '',
    `Order Ref: ${order.ref}`,
    `Package: ${order.packageName} (${order.price} · ${order.unit})`,
    '',
    'Student details:',
    `- Full names: ${order.names}`,
    `- Registration number: ${order.regNo}`,
    `- Active phone / WhatsApp: ${phoneDisplay(order.phone)}`,
  ];
  if (order.supervisorName) lines.push(`- Supervisor name: ${order.supervisorName}`);
  if (order.institution) lines.push(`- College / Institution: ${order.institution}`);
  lines.push(`- Programme / Course: ${order.programme}`);
  if (order.selectionRef) lines.push(`- Portal title ref: ${order.selectionRef}`);
  if (order.title) lines.push(`- Research title / topic: ${order.title}`);
  if (order.notes) lines.push(`- Notes / deadline: ${order.notes}`);
  lines.push('', 'Please confirm next steps and payment instructions. Thank you.');
  return lines.join('\n');
}

export default function PackageOrderModal({ open, selectedPackage, packages = [], session, onClose }) {
  const { contact } = useSiteContent();
  const notify = useToast();

  const [programmes, setProgrammes] = useState([]);
  const [form, setForm] = useState(() => buildInitialForm(selectedPackage, packages, session));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    getProgrammes()
      .then((list) => alive && setProgrammes(list || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(selectedPackage, packages, session));
    setErrors({});
    setBusy(false);
    setSubmitted(null);
  }, [open, selectedPackage, packages, session]);

  const currentPlan = useMemo(
    () => packages.find((p) => p.name === form.packageName) || selectedPackage || packages[0] || null,
    [packages, form.packageName, selectedPackage]
  );

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!currentPlan) next.packageName = 'Choose a package.';
    if (form.names.trim().split(/\s+/).filter(Boolean).length < 2) {
      next.names = 'Enter your full names (at least two names).';
    }
    if (normReg(form.regNo).length < 5) {
      next.regNo = 'Enter your real college registration number.';
    }
    if (!normPhone(form.phone)) {
      next.phone = 'Enter a valid Tanzanian mobile number (e.g. 0712 345 678).';
    }
    if (form.programme.trim().length < 2) {
      next.programme = 'Enter or select your programme / course.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || busy) return;

    setBusy(true);
    try {
      const order = await createOrder({
        packageName: currentPlan.name,
        price: currentPlan.price,
        unit: currentPlan.unit,
        names: form.names.trim().replace(/\s+/g, ' '),
        regNo: normReg(form.regNo),
        phone: form.phone,
        supervisorName: form.supervisorName.trim(),
        institution: form.institution.trim(),
        programme: form.programme.trim(),
        title: form.title.trim(),
        selectionRef: form.selectionRef.trim(),
        notes: form.notes.trim(),
      });

      const message = formatOrderMessage(order);
      const whatsappUrl = `https://wa.me/${waDigits(contact.phone)}?text=${encodeURIComponent(message)}`;
      const mailSubject = `Package Order ${order.ref} — ${order.packageName}`;
      const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(message)}`;

      setSubmitted({ order, message, whatsappUrl, mailtoUrl });
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      notify(`Order ${order.ref} saved — send it in WhatsApp to confirm.`, 'success');
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not submit your order. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const copySummary = async () => {
    if (!submitted) return;
    try {
      await navigator.clipboard.writeText(submitted.message);
      notify('Order summary copied to clipboard.', 'success');
    } catch {
      notify('Unable to copy automatically — please select and copy the summary.', 'error');
    }
  };

  const resetForAnother = () => {
    setSubmitted(null);
    setErrors({});
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={submitted ? 'Order submitted & ready' : 'Place your package order'}
      sub={
        submitted
          ? `Order reference ${submitted.order.ref} · ${submitted.order.packageName}`
          : 'Fill in your student details below to submit your order directly to Report Safi.'
      }
      foot={
        submitted ? (
          <>
            <Btn variant="outline" onClick={resetForAnother}>
              Place another order
            </Btn>
            <Btn variant="primary" onClick={onClose}>
              Done
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" onClick={onClose}>
              Cancel
            </Btn>
            <Btn
              type="submit"
              form="package-order-form"
              variant="gold"
              icon={IconArrowRight}
              disabled={busy}
            >
              {busy ? 'Submitting order…' : 'Place order now'}
            </Btn>
          </>
        )
      }
    >
      {submitted ? (
        <div className="order-confirm">
          <div className="order-confirm-banner">
            <span className="order-confirm-icon">
              <IconCheckCircle size={22} />
            </span>
            <div>
              <strong>Order recorded ({submitted.order.ref})</strong>
              <p className="small muted">
                Your order has been saved for the Report Safi team and WhatsApp should open in a new
                tab. If it did not open, tap the WhatsApp button below or send it by email.
              </p>
            </div>
          </div>

          <div className="order-summary-grid">
            <div>
              <span className="order-k">Package</span>
              <span className="order-v">{submitted.order.packageName}</span>
            </div>
            <div>
              <span className="order-k">Price</span>
              <span className="order-v mono">
                {submitted.order.price} ({submitted.order.unit})
              </span>
            </div>
            <div>
              <span className="order-k">Student</span>
              <span className="order-v">{submitted.order.names}</span>
            </div>
            <div>
              <span className="order-k">Registration number</span>
              <span className="order-v mono">{submitted.order.regNo}</span>
            </div>
            <div>
              <span className="order-k">Phone / WhatsApp</span>
              <span className="order-v mono">{phoneDisplay(submitted.order.phone)}</span>
            </div>
            <div>
              <span className="order-k">Supervisor name</span>
              <span className="order-v">{submitted.order.supervisorName || '—'}</span>
            </div>
            <div className="order-span-2">
              <span className="order-k">Programme</span>
              <span className="order-v">
                {submitted.order.institution
                  ? `${submitted.order.institution} · ${submitted.order.programme}`
                  : submitted.order.programme}
              </span>
            </div>
            {submitted.order.title && (
              <div className="order-span-2">
                <span className="order-k">
                  Research title {submitted.order.selectionRef ? `(${submitted.order.selectionRef})` : ''}
                </span>
                <span className="order-v">{submitted.order.title}</span>
              </div>
            )}
            {submitted.order.notes && (
              <div className="order-span-2">
                <span className="order-k">Notes / deadline</span>
                <span className="order-v">{submitted.order.notes}</span>
              </div>
            )}
          </div>

          <div className="order-confirm-actions">
            <a
              className="btn btn-whatsapp"
              href={submitted.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp size={18} />
              Open WhatsApp to send order
            </a>
            <Btn variant="outline" icon={IconCopy} onClick={copySummary}>
              Copy order details
            </Btn>
            <a className="btn btn-outline" href={submitted.mailtoUrl}>
              <IconMail size={16} />
              Send via email
            </a>
          </div>
        </div>
      ) : (
        <form id="package-order-form" onSubmit={handleSubmit} noValidate>
          {currentPlan && (
            <div className="order-plan-bar">
              <div>
                <span className="eyebrow">Selected package</span>
                <h3>{currentPlan.name}</h3>
                <p className="small muted">{currentPlan.note}</p>
              </div>
              <div className="order-plan-price">
                <strong>{currentPlan.price}</strong>
                <span>{currentPlan.unit}</span>
              </div>
            </div>
          )}

          {packages.length > 1 && (
            <Field label="Package" required htmlFor="order-pkg" error={errors.packageName}>
              <select
                id="order-pkg"
                className="select"
                value={form.packageName}
                onChange={setField('packageName')}
              >
                {packages.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} — {p.price} ({p.unit})
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="form-grid-2">
            <Field label="Full names" required htmlFor="order-names" error={errors.names}>
              <input
                id="order-names"
                className="inp"
                value={form.names}
                onChange={setField('names')}
                placeholder="Neema Baraka Mushi"
                autoComplete="name"
              />
            </Field>

            <Field
              label="Registration number"
              required
              htmlFor="order-reg"
              error={errors.regNo}
              hint="Example: 03.6773.01.01.2022"
            >
              <input
                id="order-reg"
                className="inp mono"
                value={form.regNo}
                onChange={setField('regNo')}
                placeholder="03.6773.01.01.2022"
                autoComplete="off"
                spellCheck="false"
              />
            </Field>
          </div>

          <div className="field-disclaimer" role="note">
            <IconAlert size={16} />
            <div>
              <strong>Use your real college registration number.</strong> Enter the exact number
              printed on your official student identity card — do not use a fake, guessed, or
              another student&rsquo;s registration number.
            </div>
          </div>

          <div className="form-grid-2">
            <Field
              label="Active phone / WhatsApp"
              required
              htmlFor="order-phone"
              error={errors.phone}
              hint="0712 345 678"
            >
              <input
                id="order-phone"
                className="inp mono"
                value={form.phone}
                onChange={setField('phone')}
                placeholder="0712 345 678"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>

            <Field
              label="Supervisor name"
              htmlFor="order-sup"
              hint="Optional — e.g. Dr. Asha Mnyamzi"
            >
              <input
                id="order-sup"
                className="inp"
                value={form.supervisorName}
                onChange={setField('supervisorName')}
                placeholder="Dr. Asha Mnyamzi"
              />
            </Field>
          </div>

          <div className="form-grid-2">
            <Field
              label="Chuo Kikuu / Taasisi (Dar es Salaam)"
              htmlFor="order-inst"
              hint="CBE, DMI, NIT, IFM, TIA, UDSM, DIT, MUHAS, n.k."
            >
              <select
                id="order-inst"
                className="select"
                value={form.institution}
                onChange={setField('institution')}
              >
                <option value="">-- Chagua Chuo Kikuu / Taasisi ya Dar es Salaam --</option>
                {DAR_ES_SALAAM_UNIVERSITIES.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Programme / course"
              required
              htmlFor="order-prog"
              error={errors.programme}
              hint="Select from the list or type your programme"
            >
              <input
                id="order-prog"
                className="inp"
                list="order-programmes"
                value={form.programme}
                onChange={setField('programme')}
                placeholder="BAF — Bachelor of Accounting and Finance"
              />
              <datalist id="order-programmes">
                {programmes.map((p) => (
                  <option key={p.id} value={`${p.code} — ${p.name}`} />
                ))}
              </datalist>
            </Field>
          </div>

          <Field
            label="Research title / topic"
            htmlFor="order-title"
            hint={
              form.selectionRef
                ? `Pre-filled from your portal reservation (${form.selectionRef}).`
                : 'Optional — leave blank if you need help choosing or refining a topic.'
            }
          >
            <input
              id="order-title"
              className="inp"
              value={form.title}
              onChange={setField('title')}
              placeholder="Paste your chosen research title or leave blank"
            />
          </Field>

          <Field
            label="Notes or deadline"
            htmlFor="order-notes"
            hint="Optional — share your submission deadline, supervisor requirements, or questions."
          >
            <textarea
              id="order-notes"
              className="inp"
              rows={3}
              value={form.notes}
              onChange={setField('notes')}
              placeholder="e.g. Proposal submission deadline is next Friday…"
            />
          </Field>

          <Notice tone="info" icon={IconShield}>
            Your order is recorded directly in Report Safi&rsquo;s order queue and opens WhatsApp
            with <strong>{contact.phone}</strong> so our team can get started right away.
          </Notice>
        </form>
      )}
    </Modal>
  );
}
