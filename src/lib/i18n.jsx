import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const STORAGE_KEY = 'rs_preferred_language';

const TRANSLATIONS = {
  sw: {
    // Navigation & header
    nav_home: 'Mwanzo',
    nav_features: 'Vipengele',
    nav_catalogue: 'Mada za Utafiti',
    nav_pricing: 'Bei na Vifurushi',
    nav_help: 'Msaada',
    nav_start: 'Chagua Mada',
    brand_sub: 'Mfumo Rasmi wa Uchaguzi wa Mada',

    // Hero
    hero_eyebrow: 'Mada za Utafiti · Research & Project Titles',
    hero_title_lead: 'Mwanafunzi mmoja, mada moja — ',
    hero_title_em: 'kwa haki, uwazi na utaratibu.',
    hero_lead:
      'Tafuta kwenye orodha ya Report Safi iliyoidhinishwa, jua mara moja mada ipi iko wazi, na chagua mada yako ya utafiti au mradi kwa hatua moja iliyothibitishwa. Hakuna foleni, hakuna kurudia mada, hakuna kubahatisha.',
    hero_btn_catalogue: 'Angalia mada zilizopo',
    hero_btn_works: 'Jinsi mfumo unavyofanya kazi',
    hero_note:
      'Upatikanaji unathibitishwa na mfumo papo hapo unapochagua — siyo kivinjari chako pekee.',

    // Stats
    stat_titles: 'Mada kwenye orodha',
    stat_available: 'Zinazopatikana sasa',
    stat_programmes: 'Programu / Kozi wazi',
    stat_today: 'Zilizochaguliwa leo',

    // Logo Cloud
    logo_label: 'Wanafunzi kutoka vyuo vikuu na taasisi za Dar es Salaam na Tanzania nzima',

    // Identification section
    id_eyebrow: 'Hatua ya 01 · Utambulisho wa Mwanafunzi',
    id_heading: 'Kabla hujaingia kwenye orodha ya mada',
    id_intro:
      'Idara ya utafiti inahitaji kujua ni nani anayehifadhi kila mada. Andaa taarifa hizi sita — fomu inachukua chini ya dakika moja.',
    id_disclaimer:
      'Taarifa hizi hazithibitishi usajili rasmi wa chuo. Katika toleo hili zinakusanywa na kuhifadhiwa kwa utaratibu wa mada, usizichukulie kama uthibitisho wa kujiandikisha rasmi chuoni.',
    id_identified_as: 'Umetambuliwa kama',
    id_continue_cat: 'Endelea kwenye orodha ya mada',

    // Needs list
    need_reg_title: 'Namba ya usajili wa chuo',
    need_reg_text: 'Namba yako ya chuo, kama ilivyoandikwa kwenye kitambulisho chako cha mwanafunzi.',
    need_names_title: 'Majina kamili',
    need_names_text: 'Majina yako yote kama yanavyoonekana kwenye orodha rasmi ya chuo — bila vifupisho.',
    need_inst_title: 'Chuo Kikuu / Taasisi (Dar es Salaam)',
    need_inst_text: 'Chuo kikuu au taasisi unayosoma hapa Dar es Salaam (mf. CBE, DMI, NIT, IFM, TIA, n.k.).',
    need_supervisor_title: 'Msimamizi wa utafiti (Supervisor)',
    need_supervisor_text: 'Jina kamili la msimamizi wako wa utafiti au mradi uliyepangiwa na chuo.',
    need_phone_title: 'Namba ya simu inayopatikana',
    need_phone_text: 'Namba ya simu unayotumia na inayopokea simu na SMS mara moja.',
    need_prog_title: 'Programu / Kozi ya masomo',
    need_prog_text: 'Unaweza tu kuona na kuchagua mada zinazohusu fani au kozi unayosomea.',

    // Reference lookup
    ref_lookup_eyebrow: 'Umeshachagua mada tayari?',
    ref_lookup_heading: 'Tumia namba yako ya kumbukumbu (Reference) kurekebisha taarifa au kubadilisha mada',
    ref_lookup_text:
      'Weka namba ya kumbukumbu uliyopewa ulipochagua mada (mfano: RS-TS-2026-00001) kurekebisha taarifa za msimamizi, chuo au kuchagua mada nyingine iliyo wazi.',
    ref_lookup_btn: 'Fungua / Rekebisha',
    ref_lookup_checking: 'Inakagua…',

    // Student form
    form_eyebrow: 'Taarifa za mwanafunzi',
    form_heading: 'Jitambulishe',
    form_sub: 'Namba ya usajili · Majina · Chuo · Msimamizi · Simu · Kozi',
    form_reg_label: 'Namba ya usajili wa chuo',
    form_reg_hint: 'Mfano: 03.6773.01.01.2022',
    form_reg_disclaimer:
      'Tumia namba yako halisi ya usajili wa chuo. Weka namba kamili iliyopo kwenye kitambulisho chako rasmi cha chuo — usitumie namba ya kubahatisha au ya mwanafunzi mwingine.',
    form_names_label: 'Majina kamili',
    form_names_placeholder: 'Neema Baraka Mushi',
    form_inst_label: 'Chuo Kikuu / Taasisi (Dar es Salaam)',
    form_inst_placeholder: '-- Chagua Chuo Kikuu / Taasisi ya Dar es Salaam --',
    form_inst_hint: 'CBE, DMI, NIT, IFM, TIA, UDSM, DIT, MUHAS, n.k.',
    form_supervisor_label: 'Msimamizi wa Utafiti (Supervisor)',
    form_supervisor_placeholder: 'Dr. Asha Mnyamzi',
    form_supervisor_hint: 'Mfano: Dr. Asha Mnyamzi',
    form_phone_label: 'Namba ya simu inayopatikana',
    form_phone_placeholder: '0712 345 678',
    form_prog_label: 'Programu / Kozi ya masomo',
    form_prog_placeholder: '-- Chagua kozi unayosomea --',
    form_submit: 'Thibitisha na Uendelee kwenye Orodha ya Mada',
    form_submitting: 'Inathibitisha…',

    // Validation errors
    err_reg: 'Weka namba yako halisi ya usajili wa chuo.',
    err_names: 'Weka majina yako kamili (angalau majina mawili).',
    err_inst: 'Chagua chuo kikuu au taasisi yako ya Dar es Salaam.',
    err_supervisor: 'Weka jina kamili la msimamizi wako wa utafiti.',
    err_phone: 'Weka namba sahihi ya simu inayopatikana.',
    err_prog: 'Chagua programu au kozi unayosomea.',

    // Values / Why Report Safi
    why_eyebrow: 'Kwa Nini Report Safi',
    why_heading: 'Kazi ngumu na usumbufu tuachie sisi',
    why_sub:
      'Report Safi ilianza kwa kuondoa msongo wa mawazo kwenye uandishi wa ripoti na proposals za utafiti. Mfumo huu unaendeleza ahadi hiyo kwa uchaguzi wa mada: hakuna foleni, kumbukumbu safi, na kazi iliyo tayari kuwasilishwa.',
    why_card1_title: 'Okoa muda na usumbufu',
    why_card1_text:
      'Hakuna foleni ofisini, hakuna kubishania mada wala kukagua spreadsheets. Mfumo unakuonyesha papo hapo kama mada bado iko wazi.',
    why_card2_title: 'Rahisi kwenye simu au kompyuta',
    why_card2_text:
      'Chagua kozi yako, tafuta mada na uihifadhi kupitia simu yako popote ulipo — mfumo huo huo unafanya kazi kompyuta za maabara ya chuo.',
    why_card3_title: 'Tayari kwa msimamizi wako',
    why_card3_text:
      'Uthibitisho wako unakuja na namba rasmi ya kumbukumbu (Reference) na tarehe unayoweza kuichapa au kuituma kwa msimamizi wako bila kuambiwa “njoo kesho”.',
    why_card4_title: 'Kulingana na vigezo vya Tanzania',
    why_card4_text:
      'Mada zote na ripoti zinafuata miongozo ya vyuo vikuu vya Tanzania na Tume ya Vyuo Vikuu (TCU), zikiwa na kumbukumbu kamili ya ukaguzi.',

    // Catalogue
    cat_title: 'Orodha ya Mada za Utafiti',
    cat_search_placeholder: 'Tafuta kwa mada, nambari ya mada, au maneno muhimu…',
    cat_filter_all: 'Mada zote',
    cat_filter_avail: 'Zinazopatikana tu',
    cat_filter_taken: 'Zilizochukuliwa',
    cat_badge_avail: 'Inapatikana',
    cat_badge_taken: 'Imechukuliwa',
    cat_btn_reserve: 'Hifadhi Mada Hii',
    cat_btn_swap: 'Chagua Mada Hii Badala Yake',
    cat_empty: 'Hakuna mada zilizopatikana kwa utafutaji wako.',
    cat_holding: 'Tayari umeshahifadhi mada:',
    cat_editing_ref: 'Unabadilisha mada kwa namba ya kumbukumbu:',

    // Confirm
    confirm_title: 'Thibitisha Uchaguzi wa Mada Yako',
    confirm_lead: 'Kagua taarifa zako kwa makini kabla ya kukamilisha hifadhi ya mada.',
    confirm_student_box: 'Taarifa za Mwanafunzi',
    confirm_inst: 'Chuo Kikuu / Taasisi',
    confirm_supervisor: 'Msimamizi wa Utafiti',
    confirm_prog: 'Kozi / Programu',
    confirm_reg: 'Namba ya Usajili',
    confirm_names: 'Majina Kamili',
    confirm_phone: 'Namba ya Simu',
    confirm_title_box: 'Mada Uliyochagua',
    confirm_decl: 'Nathibitisha kuwa taarifa nilizotoa ni sahihi na mada hii itatumika kwa utafiti wangu rasmi.',
    confirm_btn: 'Thibitisha na Hifadhi Mada',
    confirm_btn_swap: 'Thibitisha Mabadiliko ya Mada',

    // Reference page
    ref_title: 'Uthibitisho Rasmi wa Uchaguzi wa Mada',
    ref_badge_active: 'Inafanya Kazi (Active)',
    ref_badge_released: 'Imeachiliwa (Released)',
    ref_copy: 'Nakili Namba',
    ref_copied: 'Imenakiliwa!',
    ref_print: 'Chapisha / Pakua Uthibitisho',
    ref_edit_btn: 'Rekebisha Msimamizi / Chuo',
    ref_swap_btn: 'Badilisha Mada (Chagua Mada Nyingine)',
    ref_history_title: 'Historia ya Marekebisho',

    // Pricing
    pricing_eyebrow: 'Vifurushi vya Utafiti na Ripoti',
    pricing_title: 'Gharama na Vifurushi vya Kitaalamu',
    pricing_lead:
      'Kuchagua mada ni bure 100%. Ukihitaji uandishi wa kitaalamu wa andiko (proposal) au ripoti kamili ya utafiti (chapters 1–5), chagua kifurushi chako hapa.',
    pricing_fast_delivery: 'Fast delivery',
    pricing_revisions: 'Revisions until you submit',
    pricing_order_btn: 'Agiza Kifurushi Hiki',

    // Order modal
    order_title: 'Weka Oda ya Kifurushi cha Utafiti',
    order_sub: 'Jaza taarifa zako ili tuanze kuandaa proposal au ripoti yako mara moja.',
    order_btn_whatsapp: 'Kamilisha na Tuma Oda WhatsApp',

    // Footer
    footer_desc:
      'Report Safi — Mfumo rasmi wa uchaguzi wa mada za utafiti na huduma za uandishi wa kitaalamu kwa vyuo vikuu na taasisi za Tanzania.',
    footer_rights: 'Haki zote zimehifadhiwa.',
    footer_academic_year: 'Mwaka wa Masomo',

    // Floating WhatsApp
    whatsapp_tooltip: 'Wasiliana nasi WhatsApp kwa msaada wa haraka',
  },

  en: {
    // Navigation & header
    nav_home: 'Home',
    nav_features: 'Features',
    nav_catalogue: 'Catalogue',
    nav_pricing: 'Pricing',
    nav_help: 'Help',
    nav_start: 'Start selection',
    brand_sub: 'Title Selection Portal',

    // Hero
    hero_eyebrow: 'Mada za Utafiti · Research & Project Titles',
    hero_title_lead: 'One student, one title — ',
    hero_title_em: 'chosen fairly, recorded properly.',
    hero_lead:
      'Search the approved Report Safi catalogue, see instantly what is still free, and reserve your research or project title in a single confirmed step. No queues, no double booking, no guessing.',
    hero_btn_catalogue: 'Browse available titles',
    hero_btn_works: 'How the process works',
    hero_note:
      'Availability is confirmed by the portal at the moment you select — never by your browser alone.',

    // Stats
    stat_titles: 'Titles in catalogue',
    stat_available: 'Available right now',
    stat_programmes: 'Programmes open',
    stat_today: 'Selections today',

    // Logo Cloud
    logo_label: 'Students from colleges and universities across Tanzania',

    // Identification section
    id_eyebrow: 'Step 01 · Identification',
    id_heading: 'Before you enter the catalogue',
    id_intro:
      'The Research Office needs to know who is reserving each title. Have these six details ready — the form takes under a minute.',
    id_disclaimer:
      'These details are not identity verification. In this release they are captured and stored, but they are not checked against the official student register. Do not treat a successful submission as proof of enrolment.',
    id_identified_as: 'You are identified as',
    id_continue_cat: 'Continue to the catalogue',

    // Needs list
    need_reg_title: 'Registration number',
    need_reg_text: 'Your student registration number, exactly as printed on your student card.',
    need_names_title: 'Full names',
    need_names_text: 'All names as they appear in the college register — no abbreviations.',
    need_inst_title: 'University / College (Dar es Salaam)',
    need_inst_text: 'Your university or college in Dar es Salaam (e.g. CBE, DMI, NIT, IFM, TIA, etc.).',
    need_supervisor_title: 'Supervisor name',
    need_supervisor_text: 'Your assigned research or project supervisor’s full name.',
    need_phone_title: 'Active phone number',
    need_phone_text: 'A number you can still receive SMS on. It is the only way we can reach you.',
    need_prog_title: 'Programme / course',
    need_prog_text: 'You may only browse and reserve titles belonging to your own programme.',

    // Reference lookup
    ref_lookup_eyebrow: 'Already reserved?',
    ref_lookup_heading: 'Use your reference number to edit supervisor info, details, or title',
    ref_lookup_text:
      'Enter the reference number you received after reserving (e.g. RS-TS-2026-00001) to edit your supervisor info, update student details, or select another available title.',
    ref_lookup_btn: 'Open / Edit',
    ref_lookup_checking: 'Checking…',

    // Student form
    form_eyebrow: 'Student details',
    form_heading: 'Identify yourself',
    form_sub: 'Registration number · Full names · College · Supervisor · Phone · Programme',
    form_reg_label: 'Registration number',
    form_reg_hint: 'Example: 03.6773.01.01.2022',
    form_reg_disclaimer:
      'Use your real college registration number. Enter the exact number printed on your official student identity card — do not use a fake, guessed, or another student’s registration number.',
    form_names_label: 'Full names',
    form_names_placeholder: 'Neema Baraka Mushi',
    form_inst_label: 'University / College (Dar es Salaam)',
    form_inst_placeholder: '-- Select Dar es Salaam University / College --',
    form_inst_hint: 'CBE, DMI, NIT, IFM, TIA, UDSM, DIT, MUHAS, etc.',
    form_supervisor_label: 'Supervisor name',
    form_supervisor_placeholder: 'Dr. Asha Mnyamzi',
    form_supervisor_hint: 'Example: Dr. Asha Mnyamzi',
    form_phone_label: 'Active phone',
    form_phone_placeholder: '0712 345 678',
    form_prog_label: 'Programme / course',
    form_prog_placeholder: '-- Choose your programme --',
    form_submit: 'Confirm & Proceed to Catalogue',
    form_submitting: 'Confirming…',

    // Validation errors
    err_reg: 'Enter your registration number.',
    err_names: 'Enter your full names (at least two names).',
    err_inst: 'Select your Dar es Salaam university or college.',
    err_supervisor: 'Enter your supervisor name.',
    err_phone: 'Enter your active phone number.',
    err_prog: 'Choose your programme.',

    // Values / Why Report Safi
    why_eyebrow: 'Why Report Safi',
    why_heading: 'The tedious part is ours, not yours',
    why_sub:
      'Report Safi started by taking the stress out of academic writing. This portal keeps the same promise for title selection: less chasing, clearer records, and work that is ready to submit.',
    why_card1_title: 'Save the chasing',
    why_card1_text:
      'No queue at the office, no shared spreadsheet to cross-check. The catalogue tells you straight away whether a title is still yours to reserve.',
    why_card2_title: 'Order in a few taps',
    why_card2_text:
      'Choose your programme, search the catalogue and reserve from a phone — the same flow works on a laptop in the campus lab.',
    why_card3_title: 'Ready for your supervisor',
    why_card3_text:
      'Your confirmation carries a dated reference number you can print or forward. No photocopy, no “come back tomorrow”.',
    why_card4_title: 'Grounded in local standards',
    why_card4_text:
      'The catalogue and report packages follow Tanzanian university guidelines, with a Research Office that can audit every action.',

    // Catalogue
    cat_title: 'Approved Research Titles',
    cat_search_placeholder: 'Search by topic, title code, or keywords…',
    cat_filter_all: 'All titles',
    cat_filter_avail: 'Available only',
    cat_filter_taken: 'Reserved',
    cat_badge_avail: 'Available',
    cat_badge_taken: 'Reserved',
    cat_btn_reserve: 'Reserve This Title',
    cat_btn_swap: 'Select This Title Instead',
    cat_empty: 'No titles matched your search.',
    cat_holding: 'You currently hold:',
    cat_editing_ref: 'Changing title for reference:',

    // Confirm
    confirm_title: 'Confirm Your Title Selection',
    confirm_lead: 'Review your details carefully before confirming your reservation.',
    confirm_student_box: 'Student Information',
    confirm_inst: 'University / College',
    confirm_supervisor: 'Supervisor Name',
    confirm_prog: 'Programme / Course',
    confirm_reg: 'Registration Number',
    confirm_names: 'Full Names',
    confirm_phone: 'Active Phone',
    confirm_title_box: 'Selected Research Title',
    confirm_decl: 'I confirm that the details provided are correct and this title will be used for my official research.',
    confirm_btn: 'Confirm & Reserve Title',
    confirm_btn_swap: 'Confirm Title Swap',

    // Reference page
    ref_title: 'Official Title Selection Confirmation',
    ref_badge_active: 'Active',
    ref_badge_released: 'Released',
    ref_copy: 'Copy Reference',
    ref_copied: 'Copied!',
    ref_print: 'Print / Save Confirmation',
    ref_edit_btn: 'Edit Supervisor / College',
    ref_swap_btn: 'Swap Title (Select Another)',
    ref_history_title: 'Edit History',

    // Pricing
    pricing_eyebrow: 'Report Packages',
    pricing_title: 'Simple, transparent pricing',
    pricing_lead:
      'Reserving a title is 100% free. If you need professional assistance preparing your proposal or complete research report, select a package below.',
    pricing_fast_delivery: 'Fast delivery',
    pricing_revisions: 'Revisions until you submit',
    pricing_order_btn: 'Order this package',

    // Order modal
    order_title: 'Order a Report Writing Package',
    order_sub: 'Fill in your details to order professional writing assistance for your research.',
    order_btn_whatsapp: 'Complete & Send Order via WhatsApp',

    // Footer
    footer_desc:
      'Report Safi — Official research title selection portal and professional academic writing services for Tanzanian higher learning institutions.',
    footer_rights: 'All rights reserved.',
    footer_academic_year: 'Academic Year',

    // Floating WhatsApp
    whatsapp_tooltip: 'Chat with us on WhatsApp for fast support',
  },
};

export const LanguageContext = createContext({
  lang: 'sw',
  setLang: () => {},
  t: (key, fallback = '') => fallback || key,
  isSwahili: true,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // SWAHILI IS THE FIRST / DEFAULT LANGUAGE:
      return stored === 'en' ? 'en' : 'sw';
    } catch {
      return 'sw';
    }
  });

  const setLang = (nextLang) => {
    const val = nextLang === 'en' ? 'en' : 'sw';
    setLangState(val);
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo(() => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.sw;
    const fallbackDict = TRANSLATIONS.sw;

    const t = (key, fallback = '') => {
      if (dict[key] !== undefined) return dict[key];
      if (fallbackDict[key] !== undefined) return fallbackDict[key];
      return fallback || key;
    };

    return {
      lang,
      setLang,
      t,
      isSwahili: lang === 'sw',
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
