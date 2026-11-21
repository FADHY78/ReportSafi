/**
 * Default site content. The live values are stored in Supabase's `site_content`
 * table and fetched once at startup; these defaults keep the UI usable if the
 * database is temporarily unreachable.
 */
export const DEFAULT_SITE_CONTENT = {
  meta: {
    academicYear: '2026 / 2027',
    refPrefix: 'RS / TS',
  },
  contact: {
    email: 'info@reportsafi.me',
    phone: '+255 613 328 915',
    phoneHref: 'tel:+255613328915',
    hours: 'Mon – Fri, 08:00 – 17:00',
  },
  institutions: [
    'CBE',
    'UDSM',
    'DIT',
    'TIA',
    'MUHAS',
    'Mzumbe',
    'IFM',
    'Ardhi',
    'SAUT',
    'DMI',
    'NIT',
    'OUT',
  ],
  pricing: [
    {
      icon: 'clipboard',
      name: 'Research Proposal',
      price: 'TSh 25,000',
      unit: 'per proposal',
      note: 'Everything needed to get your proposal approved.',
      features: [
        'Topic and title development',
        'Problem statement and objectives',
        'Literature review outline',
        'Research design and methodology',
        'Revisions until you submit',
        'Fast delivery',
      ],
      cta: 'Order a proposal',
      to: '/help',
      tone: 'plain',
    },
    {
      icon: 'graduation',
      name: 'Research Proposal + Research Report',
      price: 'TSh 40,000',
      unit: 'complete package',
      note: 'From proposal approval to the finished report — the full journey.',
      features: [
        'Everything in Research Proposal',
        'Full report chapters 1 – 5',
        'Data capture and analysis guidance',
        'Tables, figures and references formatted',
        'Plagiarism check with report',
        'Revisions until you submit',
        'Fast delivery',
      ],
      cta: 'Order the package',
      to: '/help',
      tone: 'featured',
    },
    {
      icon: 'book',
      name: 'Research Report',
      price: 'TSh 30,000',
      unit: 'per report',
      note: 'Already have an approved proposal? We finish the report.',
      features: [
        'Full report chapters 1 – 5',
        'Data analysis and interpretation',
        'Tables, figures and references formatted',
        'Discussion, summary and conclusion',
        'Revisions until you submit',
        'Fast delivery',
      ],
      cta: 'Order a report',
      to: '/help',
      tone: 'plain',
    },
  ],
  rules: [
    { id: 'BR-01', title: 'One title per student', text: 'Only one active title at a time.' },
    { id: 'BR-02', title: 'One student per title', text: 'A title cannot be held by two students.' },
    { id: 'BR-03', title: 'Unavailable means committed', text: 'A title turns reserved only after a successful reservation.' },
    { id: 'BR-04', title: 'The portal decides', text: 'Your browser only displays availability; it never confirms it.' },
    { id: 'BR-05', title: 'Four details required', text: 'Registration number, names, phone and programme are mandatory.' },
    { id: 'BR-06', title: 'Your programme only', text: 'You can reserve titles from your own programme.' },
    { id: 'BR-07', title: 'Changes are audited', text: 'Staff releases need a reason and are recorded by name.' },
    { id: 'BR-08', title: 'A deep catalogue', text: 'Every programme offers at least 1,000 titles (currently 1,500+).' },
    { id: 'BR-09', title: 'No double registration', text: 'One registration number cannot make two selections.' },
  ],
  faqs: [
    {
      q: 'How do I know a title is still free?',
      a: 'Availability is decided at the moment you confirm. Available means the title is still free; reserved means another student has already completed a selection.',
    },
    {
      q: 'Can I select more than one title?',
      a: 'No. BR-01 allows exactly one active title per student, and the portal blocks a second selection.',
    },
    {
      q: 'What does “not verified identity” mean?',
      a: 'The portal has recorded what you typed but has not checked it against the official student register. It proves data entry, not enrolment.',
    },
    {
      q: 'Someone else got my title. What now?',
      a: 'Your reservation was not created, so return to the catalogue and choose another available title. Availability is re-checked each time.',
    },
    {
      q: 'Can my supervisor change my title?',
      a: 'Not directly. The Research Office releases the selection with a recorded reason and the change appears in the audit log.',
    },
    {
      q: 'Do I pay to reserve a title?',
      a: 'No. Reserving a title is free. Optional report-writing packages are priced separately.',
    },
  ],
};

/** Merge stored values over defaults so a partial row can never break a page. */
export function withDefaults(stored) {
  if (!stored || typeof stored !== 'object') return DEFAULT_SITE_CONTENT;
  return {
    meta: { ...DEFAULT_SITE_CONTENT.meta, ...(stored.meta || {}) },
    contact: { ...DEFAULT_SITE_CONTENT.contact, ...(stored.contact || {}) },
    institutions: stored.institutions?.length ? stored.institutions : DEFAULT_SITE_CONTENT.institutions,
    pricing: stored.pricing?.length ? stored.pricing : DEFAULT_SITE_CONTENT.pricing,
    rules: stored.rules?.length ? stored.rules : DEFAULT_SITE_CONTENT.rules,
    faqs: stored.faqs?.length ? stored.faqs : DEFAULT_SITE_CONTENT.faqs,
  };
}
