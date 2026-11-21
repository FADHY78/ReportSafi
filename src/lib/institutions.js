/**
 * Curated list of Dar es Salaam universities and higher learning institutions
 * for student identification, title selection and report package ordering.
 */
export const DAR_ES_SALAAM_UNIVERSITIES = [
  { code: 'CBE', name: 'College of Business Education (CBE)' },
  { code: 'DMI', name: 'Dar es Salaam Maritime Institute (DMI)' },
  { code: 'NIT', name: 'National Institute of Transport (NIT)' },
  { code: 'IFM', name: 'Institute of Finance Management (IFM)' },
  { code: 'TIA', name: 'Tanzania Institute of Accountancy (TIA - Dar es Salaam)' },
  { code: 'UDSM', name: 'University of Dar es Salaam (UDSM)' },
  { code: 'DIT', name: 'Dar es Salaam Institute of Technology (DIT)' },
  { code: 'MUHAS', name: 'Muhimbili University of Health and Allied Sciences (MUHAS)' },
  { code: 'ARU', name: 'Ardhi University (ARU)' },
  { code: 'OUT', name: 'Open University of Tanzania (OUT)' },
  { code: 'ISW', name: 'Institute of Social Work (Ustawi wa Jamii - ISW)' },
  { code: 'ITA', name: 'Institute of Tax Administration (ITA)' },
  { code: 'KIUT', name: 'Kampala International University in Tanzania (KIUT)' },
  { code: 'SJUIT', name: 'St. Joseph University in Tanzania (SJUIT)' },
  { code: 'TUDARCo', name: 'Tumaini University Dar es Salaam College (TUDARCo)' },
  { code: 'HKMU', name: 'Hubert Kairuki Memorial University (HKMU)' },
  { code: 'TPSC', name: 'Tanzania Public Service College (TPSC - Dar es Salaam)' },
  { code: 'EASTC', name: 'Eastern Africa Statistical Training Centre (EASTC)' },
  { code: 'OTHER', name: 'Chuo Kingine / Other University or College' },
];

/** Return the human-readable display name for an institution code or string */
export function getInstitutionName(codeOrName) {
  if (!codeOrName) return '';
  const match = DAR_ES_SALAAM_UNIVERSITIES.find(
    (u) =>
      u.code.toLowerCase() === String(codeOrName).toLowerCase() ||
      u.name.toLowerCase() === String(codeOrName).toLowerCase()
  );
  return match ? match.name : codeOrName;
}
