import { useEffect, useMemo, useState } from 'react';
import { getProgrammes } from '../lib/api';
import { useSiteContent } from '../lib/useSiteContent';
import { useToast } from '../lib/toast';
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

const ORDERS_STORAGE_KEY = 'rs_package_orders';

function makeOrderRef() {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `RS-ORD-${year}-${suffix}`;
}

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
    institution: '',
    programme: progLabel,
    title: session?.existingSelection?.title?.text || '',
    selectionRef: session?.existingSelection?.ref || '',
    notes: '',
  };
}

function formatOrderMessage(order) {
  const lines = [
    'Hello Report Safi, I would like to place a package order:',
    '',
    `Order Ref: ${order.ref}`,
    `Package: ${order.packageName} (${order.price} · ${order.unit})`,
    '',
    'Student details:',
    `- Full names: ${order.names}`,
    `- Registration number: ${order.regNo}`,
    `- Active phone / WhatsApp: ${phoneDisplay(order.phone)}`,
  ];
  if (order.institution) lines.push(`- College / Institution: ${order.institution}`);
  lines.push(`- Programme / Course: ${order.programme}`);
  if (order.selectionRef) lines.push(`- Portal title ref: ${order.selectionRef}`);
  if (order.title) lines.push(`- Research title / topic: ${order.title}`);
  if (order.notes) lines.push(`- Notes / deadline: ${order.notes}`);
  lines.push('', 'Please confirm next steps and payment instructions. Thank you.');
  return lines.join('\n');
}

export default function PackageOrderModal({ open, selectedPackage, packages = [], session, onClose }) {
  const { contact, institutions } = useSiteContent();
  const notify = useToast();

  const [programmes, setProgrammes] = useState([]);
  const [form, setForm] = useState(() => buildInitialForm(selectedPackage, packages, session));
  const [errors, setErrors] = useState({});
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
    setSubmitted(null);
  }, [open, selectedPackage, packages, session]);

  const currentPlan = useMemo(
    () => packages.find((p) => p.name === form.packageName) || selectedPackage || packages[0] || null,
    [packages, form.packageName, selectedPackage]
  );

  const institutionOptions = useMemo(() => {
    const set = new Set(['CBE', ...(institutions || [])]);
    return Array.from(set);
  }, [institutions]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedPhone = normPhone(form.phone);
    const order = {
      ref: makeOrderRef(),
      createdAt: new Date().toISOString(),
      packageName: currentPlan.name,
      price: currentPlan.price,
      unit: currentPlan.unit,
      names: form.names.trim().replace(/\s+/g, ' '),
      regNo: normReg(form.regNo),
      phone: normalizedPhone,
      institution: form.institution.trim(),
      programme: form.programme.trim(),
      title: form.title.trim(),
      selectionRef: form.selectionRef.trim(),
      notes: form.notes.trim(),
    };

    const message = formatOrderMessage(order);
    const whatsappUrl = `https://wa.me/${waDigits(contact.phone)}?text=${encodeURIComponent(message)}`;
    const mailSubject = `Package Order ${order.ref} — ${order.packageName}`;
    const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(message)}`;

    try {
      const existing = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
      const updated = [order, ...(Array.isArray(existing) ? existing : [])].slice(0, 20);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* private mode — order stays in memory */
    }

    setSubmitted({ order, message, whatsappUrl, mailtoUrl });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    notify('Order prepared — send it in WhatsApp to confirm with Report Safi.', 'success');
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
      title={submitted ? 'Order ready to send' : 'Place your package order'}
      sub={
        submitted
          ? `Order reference ${submitted.order.ref} · ${submitted.order.packageName}`
          : 'Fill in your student details below to place your order directly with Report Safi.'
      }
      foot={
        submitted ? (
          <>
            <Btn variant="outline" onClick={resetForAnother}>
              Edit order
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
            <Btn type="submit" form="package-order-form" variant="gold" icon={IconArrowRight}>
              Place order via WhatsApp
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
              <strong>Your order summary is ready ({submitted.order.ref})</strong>
              <p className="small muted">
                WhatsApp should open in a new tab with your full order pre-filled. If it did not
                open, tap the WhatsApp button below or send it by email.
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
              hint="Example: BAF/2024/01234"
            >
              <input
                id="order-reg"
                className="inp mono"
                value={form.regNo}
                onChange={setField('regNo')}
                placeholder="BAF/2024/01234"
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
              label="College / institution"
              htmlFor="order-inst"
              hint="Optional — e.g. CBE, IFM, UDSM, TIA"
            >
              <input
                id="order-inst"
                className="inp"
                list="order-institutions"
                value={form.institution}
                onChange={setField('institution')}
                placeholder="CBE"
              />
              <datalist id="order-institutions">
                {institutionOptions.map((inst) => (
                  <option key={inst} value={inst} />
                ))}
              </datalist>
            </Field>
          </div>

          <Field
            label="Programme / course"
            required
            htmlFor="order-prog"
            error={errors.programme}
            hint="Select from the list or type your programme name"
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
            Submitting prepares your official order summary and opens WhatsApp directly with{' '}
            <strong>{contact.phone}</strong> so you can confirm payment and start immediately.
          </Notice>
        </form>
      )}
    </Modal>
  );
}
