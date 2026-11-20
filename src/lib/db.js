/**
 * Data layer for the Report Safi Title Selection Portal.
 *
 * The PRD (BR-04) requires the server — never the browser — to be the
 * authority for availability. In this build the "server" is simulated here:
 * every write goes through an exclusive lock and re-validates the business
 * rules (BR-01…BR-09) immediately before committing, exactly the way a
 * transactional API endpoint would. Swap this module for HTTP calls when the
 * real backend exists; nothing else in the UI needs to change.
 */
import { normReg, normPhone, demoHash, pad } from './utils.js';

const DB_KEY = 'reportsafi_portal_db_v6';
const LOCK_KEY = 'reportsafi_portal_lock_v6';
const DB_VERSION = 6;

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random generator (stable titles across reloads) */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length) % arr.length];

/* ------------------------------------------------------------------ */
/* Catalogue seed — programmes, categories, title templates             */
/* ------------------------------------------------------------------ */

const TEMPLATES = [
  'The Impact of {C} on the Financial Performance of {S} in {P}, Dar es Salaam',
  'Challenges Facing {C} among {S} in {P}, Dar es Salaam',
  'A Case Study of {C} in {S}: Evidence from {P}, Dar es Salaam',
  'The Role of {C} in Improving Service Delivery by {S} in {P}, Dar es Salaam',
  'Assessing the Relationship between {C} and Operational Efficiency of {S} in {P}, Dar es Salaam',
  'Factors Influencing the Adoption of {C} by {S} in {P}, Dar es Salaam',
  'Strategies for Strengthening {C} within {S}: A Study of {P}, Dar es Salaam',
  'The Contribution of {C} to Risk Management in {S} operating in {P}, Dar es Salaam',
  'Measuring the Effectiveness of {C} in {S}: A Case Study of {P}, Dar es Salaam',
  'Barriers to Effective {C} among {S} in {P}, Dar es Salaam',
  'An Evaluation of {C} Practices in {S}: Lessons from {P}, Dar es Salaam',
  'The Effect of {C} on Customer Satisfaction in {S} within {P}, Dar es Salaam',
  'Determinants of {C} Adoption among {S} in {P}, Dar es Salaam',
  'A Comparative Analysis of {C} Practices among {S} in {P} and other Dar es Salaam wards',
];

const SECTORS = [
  'Small and Medium Enterprises',
  'Dar es Salaam City Council',
  'Ilala Municipal Council',
  'Kinondoni Municipal Council',
  'Temeke Municipal Council',
  'Ubungo Municipal Council',
  'Kigamboni Municipal Council',
  'Microfinance Institutions',
  'Commercial Banks',
  'Agricultural Cooperatives',
  'Hospitality Enterprises',
  'Secondary Schools',
  'Telecommunications Companies',
  'Non-Governmental Organisations',
  'Public Universities',
  'Retail Businesses',
  'Transport Companies',
  'Insurance Firms',
  'Food Processing Firms',
  'Community Health Centres',
  'Construction Firms',
  'Logistics Companies',
  'Tourism Operators',
  'Manufacturing Firms',
  'Cooperative Societies',
  'Faith-Based Organisations',
  'Youth Groups',
  'Women Entrepreneur Groups',
  'Community-Based Organisations',
  'Public Libraries',
];

const PLACES = [
  'Ilala',
  'Kinondoni',
  'Temeke',
  'Ubungo',
  'Kariakoo',
  'Kigamboni',
  'Mbagala',
  'Changombe',
  'Tabata',
  'Kimara',
  'Mbezi',
  'Msasani',
  'Mikocheni',
  'Mwananyamala',
  'Ndugumbi',
  'Kamata',
  'Pugu',
  'Majohe',
  'Kivule',
  'Ukonga',
  'Vijibweni',
  'Msimbazi',
  'Jangwani',
  'Upanga',
  'Kariakoo Market',
  'Dar es Salaam Port',
  'Julius Nyerere International Airport',
  'Mwenge',
  'Sinza',
  'Buguruni',
];

function categoriesFor(code, name) {
  const key = `${code} ${name}`.toLowerCase();

  if (/marketing|tourism|event|brand/.test(key)) {
    return [
      'Consumer Behaviour',
      'Digital Marketing',
      'Brand Management',
      'Sales Management',
      'Marketing Research',
      'Tourism Marketing',
      'Event Management',
      'Customer Relationship Management',
      'Advertising',
      'Retail Marketing',
    ];
  }
  if (/information technology|information system|\bit\b/.test(key)) {
    return [
      'Information Systems Adoption',
      'Data Management',
      'Cyber Security',
      'E-Commerce Systems',
      'Network Infrastructure',
      'Enterprise Systems',
      'Software Development',
      'Database Management',
      'IT Governance',
      'Digital Transformation',
    ];
  }
  if (/human resource|hrm/.test(key)) {
    return [
      'Talent Acquisition',
      'Employee Relations',
      'Compensation and Benefits',
      'Training and Development',
      'Organisational Behaviour',
      'Performance Management',
      'Labour Relations',
      'HR Analytics',
      'Recruitment',
      'Workplace Ethics',
    ];
  }
  if (/records|archives/.test(key)) {
    return [
      'Records Management',
      'Archival Science',
      'Information Governance',
      'Document Management',
      'Digital Archives',
      'Knowledge Management',
      'Data Preservation',
      'Metadata Management',
      'Records Security',
      'Compliance',
    ];
  }
  if (/metrology|standard/.test(key)) {
    return [
      'Quality Management',
      'Measurement Systems',
      'Standardisation',
      'Calibration',
      'Quality Assurance',
      'Metrology Instruments',
      'Compliance Testing',
      'ISO Standards',
      'Laboratory Management',
      'Statistical Quality Control',
    ];
  }
  if (/procurement|supplies|logistics|transport/.test(key)) {
    return [
      'Procurement Planning',
      'Supplier Management',
      'Inventory Control',
      'Logistics Management',
      'Transport Operations',
      'Supply Chain Risk',
      'Contracts Management',
      'Warehousing',
      'Distribution Management',
      'Public Procurement',
    ];
  }
  if (/account|auditing|tax|financ|bank|economics/.test(key)) {
    return [
      'Financial Reporting',
      'Auditing and Assurance',
      'Taxation',
      'Cost and Management Accounting',
      'Public Sector Accounting',
      'Banking Operations',
      'Credit Management',
      'Risk Management',
      'Investment Analysis',
      'Financial Inclusion',
    ];
  }
  if (/entrepreneur|innovation/.test(key)) {
    return [
      'Entrepreneurship',
      'Innovation Management',
      'Business Model Design',
      'Startup Financing',
      'Venture Creation',
      'Small Business Management',
      'Business Incubation',
      'Social Entrepreneurship',
      'Scaling Enterprises',
      'Entrepreneurial Marketing',
    ];
  }
  return [
    'Strategic Management',
    'Operations Management',
    'Business Ethics',
    'Project Management',
    'General Management',
    'Business Communication',
    'Leadership',
    'Quality Management',
    'Change Management',
    'Corporate Governance',
  ];
}

function departmentFor(code, name) {
  const key = `${code} ${name}`.toLowerCase();

  if (/metrology|standard/.test(key)) return 'Department of Metrology and Standardization';
  if (/information technology|information system/.test(key)) return 'Department of Information Technology';
  if (/records|archives/.test(key)) return 'Department of Records and Archives Management';
  if (/human resource|hrm/.test(key)) return 'Department of Human Resource Management';
  if (/procurement|supplies|logistics|transport/.test(key)) {
    return 'Department of Procurement, Logistics and Supply Chain';
  }
  if (/marketing|tourism|event/.test(key)) return 'Department of Marketing and Tourism';
  if (/account|auditing|tax|financ|bank|economics/.test(key)) {
    return 'Department of Accounting, Finance and Economics';
  }
  if (/entrepreneur|innovation/.test(key)) return 'Department of Entrepreneurship and Innovation';
  return 'Department of Management Studies';
}

const RAW_PROGRAMMES = {
  'Basic Technician Certificate': [
    ['Business Administration', 'BTCBA'],
    ['Accountancy', 'BTCA'],
    ['Banking and Finance Management', 'BTCBFM'],
    ['Marketing', 'BTCM'],
    ['Procurement and Supplies', 'BTCPS'],
    ['Metrology and Standardization', 'BTCMET'],
    ['Information Technology', 'BTCIT'],
    ['Business Administration in Human Resource', 'BTCBA-HRM'],
    ['Business Administration in Records and Archives Management', 'BTCBA-RAM'],
    ['Digital Marketing', 'BTCDM'],
    ['Accountancy and Taxation', 'BTCAT'],
    ['Accounting and Finance Management', 'BTCAFM'],
    ['Marketing in Tourism and Events Management', 'BTCM-TEM'],
    ['Economics and Finance', 'BTCEF'],
    ['Transport and Logistics Management', 'BTCTLM'],
    ['Entrepreneurship and Innovation', 'BTCEI'],
  ],
  'Ordinary Diploma': [
    ['Business Administration', 'DBA'],
    ['Accountancy', 'DA'],
    ['Banking and Finance Management', 'DBFM'],
    ['Marketing', 'DM'],
    ['Procurement and Supplies Management', 'DPS'],
    ['Metrology and Standardization', 'DMET'],
    ['Information Technology', 'DIT'],
    ['Business Administration in Human Resource Management', 'DBA-HRM'],
    ['Marketing in Tourism and Event Management', 'DM-TEM'],
    ['Digital Marketing', 'DDM'],
    ['Business Administration in Records and Archives Management', 'DBA-RAM'],
    ['Accounting and Finance', 'DAF'],
    ['Accounting and Taxation', 'DAT'],
    ['Economics and Finance', 'DEF'],
    ['Transport and Logistics Management', 'DTLM'],
    ['Entrepreneurship and Logistics Innovation', 'DEI'],
  ],
  'Bachelor Degree': [
    ['Business Administration', 'BBA'],
    ['Accountancy', 'BACC'],
    ['Banking and Finance Management', 'BBFM'],
    ['Marketing', 'BMK'],
    ['Procurement and Supplies Management', 'BPS'],
    ['Metrology and Standardization', 'BMET'],
    ['Information Technology', 'BIT'],
    ['Business Studies with Education', 'BBSE'],
    ['Business Administration in Human Resources Management', 'BBA-HRM'],
    ['Accountancy and Taxation', 'BAT'],
    ['Accounting and Finance', 'BAF'],
    ['Business Administration in Records and Archives Management', 'BBA-RAM'],
    ['Marketing in Tourism and Events Management', 'BMK-TEM'],
    ['Economics and Finance', 'BEF'],
    ['Transport and Logistics Management', 'BTLM'],
    ['Entrepreneurship and Innovation', 'BEI'],
  ],
};

export const BASE_PROGRAMMES = Object.entries(RAW_PROGRAMMES).flatMap(
  ([award, list], groupIndex) =>
    list.map(([name, code], i) => ({
      id: `p-${code.toLowerCase()}`,
      code,
      name,
      award,
      department: departmentFor(code, name),
      status: 'active',
      titleCount: code === 'BAF' ? 1560 : 1500 + ((groupIndex + i) % 5) * 20,
      categories: categoriesFor(code, name),
    }))
);

/* ------------------------------------------------------------------ */
/* Title generation — 1,500+ unique case studies per programme          */
/* ------------------------------------------------------------------ */

function buildTitles(programme) {
  const rnd = mulberry32(hashStr(programme.code));
  const out = [];

  const categoryCount = programme.categories.length;
  const comboSpace =
    TEMPLATES.length * categoryCount * SECTORS.length * PLACES.length;
  const perCategory = SECTORS.length * PLACES.length;
  const perTemplate = categoryCount * perCategory;

  // An affine walk over the full combination space: coprime stride means no
  // combination repeats before every possible case study has been used.
  let stride = (hashStr(programme.code) % (comboSpace - 1)) + 1;
  while (gcd(stride, comboSpace) !== 1) {
    stride = (stride % (comboSpace - 1)) + 1;
  }
  const offset = hashStr(`${programme.code}-case-offset`) % comboSpace;

  for (let i = 0; i < programme.titleCount; i += 1) {
    const k = (i * stride + offset) % comboSpace;
    const template = TEMPLATES[Math.floor(k / perTemplate) % TEMPLATES.length];
    const category = programme.categories[Math.floor(k / perCategory) % categoryCount];
    const sector = SECTORS[Math.floor(k / PLACES.length) % SECTORS.length];
    const place = PLACES[k % PLACES.length];

    const body = template
      .replace('{C}', category)
      .replace('{S}', sector)
      .replace('{P}', place);
    const text = `Case Study ${programme.code}-${pad(i + 1, 4)}: ${body}`;
    const n = i + 1;

    out.push({
      id: `t-${programme.code}-${pad(n, 4)}`,
      code: `${programme.code}/${pad(n, 4)}`,
      text,
      category,
      programmeId: programme.id,
      status: 'active',
      createdAt: new Date(
        Date.now() - (programme.titleCount - n) * 60000 - Math.floor(rnd() * 86400000)
      ).toISOString(),
    });
  }
  return out;
}

const titleCache = new Map();
export function baseTitles(programmeId) {
  if (!titleCache.has(programmeId)) {
    const prog = BASE_PROGRAMMES.find((p) => p.id === programmeId);
    if (!prog) return [];
    titleCache.set(programmeId, buildTitles(prog));
  }
  return titleCache.get(programmeId);
}

/** Base catalogue + admin additions + admin edits, memoised on db.rev. */
let mergeCache = { rev: null, list: null };
export function allTitles(db) {
  if (mergeCache.rev === db.rev && mergeCache.list) return mergeCache.list;
  const list = [];
  db.programmes.forEach((p) => {
    if (!baseTitles(p.id).length && !db.titleAdds.some((t) => t.programmeId === p.id)) return;
    baseTitles(p.id).forEach((t) => {
      const patch = db.titleOverrides[t.id];
      list.push(patch ? { ...t, ...patch } : t);
    });
  });
  db.titleAdds.forEach((t) => {
    const patch = db.titleOverrides[t.id];
    list.push(patch ? { ...t, ...patch } : t);
  });
  mergeCache = { rev: db.rev, list };
  return list;
}

export function titlesOf(db, programmeId) {
  return allTitles(db).filter((t) => t.programmeId === programmeId);
}

/* ------------------------------------------------------------------ */
/* Seed: historical students + selections so red "UNAVAILABLE" rows     */
/* exist from the first page load                                       */
/* ------------------------------------------------------------------ */

const FIRST_NAMES = [
  'Amina', 'Baraka', 'Neema', 'Frank', 'Rehema', 'Joseph', 'Zainabu', 'Deo',
  'Happiness', 'Kelvin', 'Grace', 'Emmanuel', 'Hawa', 'Peter', 'Sarah',
  'Godfrey', 'Upendo', 'Michael', 'Fatuma', 'Daniel', 'Joyce', 'Emanuel',
  'Sophia', 'Julius', 'Anna', 'Thomas', 'Halima', 'Benedict', 'Christina',
  'David', 'Elizabeth', 'George', 'Isaya', 'Maria', 'Noel', 'Tumaini',
];

const SURNAMES = [
  'Mwakalinga', 'Mushi', 'Juma', 'Kimaro', 'Mrisho', 'Sanga', 'Ndosi',
  'Massawe', 'Mwakasege', 'Ally', 'Mwambe', 'Chacha', 'Mrema', 'Shirima',
  'Mabula', 'Komba', 'Lyimo', 'Bakari', 'Salum', 'Mgaya', 'Mnyika', 'Urassa',
  'Mwakyusa', 'Kessy', 'Mkumbo', 'Ngoya', 'Mwakatobe', 'Rweyemamu',
  'Mwamnyeto', 'Kway', 'Sanga', 'Mnyamzi', 'Chuwa', 'Mgeni', 'Mwenda',
];

const SEED_SELECTION_COUNT = 1021; // 2 released + 1,019 active

function seedHistory(db) {
  const rnd = mulberry32(hashStr('reportsafi-selection-seed'));
  const yearPool = [2023, 2024, 2025];
  const titlesByProgramme = new Map();
  const usedTitleIds = new Set();
  let seq = 1;
  let refSeq = 412;
  let programmeIndex = 0;

  while (db.selections.length < SEED_SELECTION_COUNT) {
    const programme = db.programmes[programmeIndex % db.programmes.length];
    programmeIndex += 1;

    if (!titlesByProgramme.has(programme.id)) {
      titlesByProgramme.set(programme.id, baseTitles(programme.id));
    }
    const titles = titlesByProgramme.get(programme.id);

    let title = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidate = titles[Math.floor(rnd() * titles.length)];
      if (!usedTitleIds.has(candidate.id)) {
        title = candidate;
        break;
      }
    }
    if (!title) continue;

    usedTitleIds.add(title.id);

    const names = `${pick(FIRST_NAMES, rnd)} ${pick(SURNAMES, rnd)} ${pick(SURNAMES, rnd)}`;
    const regNo = `${programme.code}/${pick(yearPool, rnd)}/${pad(Math.floor(rnd() * 90000) + 1000, 5)}`;
    const phone = `+255${pick(['6', '7'], rnd)}${pad(Math.floor(rnd() * 900000000) + 100000000, 9)}`;
    const selectedAt = new Date(
      Date.now() - Math.floor(rnd() * 90 * 86400000) - 3600000
    ).toISOString();

    const student = {
      id: `stu-${seq}`,
      regNo,
      names,
      phone,
      programmeId: programme.id,
      createdAt: selectedAt,
      updatedAt: selectedAt,
    };

    db.students.push(student);
    db.selections.push({
      id: `sel-${seq}`,
      ref: `RS-TS-${new Date(selectedAt).getFullYear()}-${pad(refSeq, 5)}`,
      studentId: student.id,
      titleId: title.id,
      status: 'active',
      selectedAt,
      releasedAt: null,
      releaseReason: null,
      releasedBy: null,
    });
    seq += 1;
    refSeq += 1;
  }

  db.counters.ref = refSeq;

  // A couple of released selections so the audit trail is not empty
  const released = db.selections.slice(0, 2);
  released.forEach((sel, i) => {
    sel.status = 'released';
    sel.releasedAt = new Date(Date.now() - (i + 2) * 86400000).toISOString();
    sel.releaseReason = i === 0 ? 'Student graduated with a different topic area' : 'Duplicate registration record merged';
    sel.releasedBy = 'Registrar, Research Office';
  });

  db.audit = [
    {
      id: 'aud-1',
      at: new Date(Date.now() - 12 * 86400000).toISOString(),
      actor: 'Dr. M. Kessy',
      role: 'Administrator',
      action: 'title.import',
      entity: 'Title catalogue',
      entityId: 'BAF',
      summary: 'Imported 560 titles for BAF from CSV',
      reason: 'Annual catalogue update',
      before: '1,000 titles',
      after: '1,560 titles',
    },
    {
      id: 'aud-2',
      at: new Date(Date.now() - 9 * 86400000).toISOString(),
      actor: 'Dr. M. Kessy',
      role: 'Administrator',
      action: 'programme.create',
      entity: 'Programme',
      entityId: 'BIT',
      summary: 'Created programme BIT',
      reason: 'New intake approved',
      before: '—',
      after: 'Information Technology',
    },
    {
      id: 'aud-3',
      at: new Date(Date.now() - 5 * 86400000).toISOString(),
      actor: 'Registrar, Research Office',
      role: 'System administrator',
      action: 'selection.release',
      entity: 'Selection',
      entityId: db.selections[0]?.ref || '—',
      summary: `Released ${db.selections[0]?.ref || 'a selection'}`,
      reason: db.selections[0]?.releaseReason || '—',
      before: 'active',
      after: 'released',
    },
    {
      id: 'aud-4',
      at: new Date(Date.now() - 2 * 86400000).toISOString(),
      actor: 'Dr. A. Mnyamzi',
      role: 'Administrator',
      action: 'title.update',
      entity: 'Title',
      entityId: 'BBA/0007',
      summary: 'Edited title wording for clarity',
      reason: 'Supervisor request',
      before: '…Profitability of SMEs…',
      after: '…Profitability of Small and Medium Enterprises…',
    },
    {
      id: 'aud-5',
      at: new Date(Date.now() - 20 * 3600000).toISOString(),
      actor: 'Registrar, Research Office',
      role: 'System administrator',
      action: 'auth.login',
      entity: 'Administrator account',
      entityId: 'controller',
      summary: 'Signed in to the admin workspace',
      reason: '—',
      before: '—',
      after: '—',
    },
  ];
}

function seedDB() {
  const db = {
    v: DB_VERSION,
    rev: 1,
    programmes: BASE_PROGRAMMES.map(({ titleCount: _seedCount, categories: _seedCats, ...rest }) => ({ ...rest })),
    titleAdds: [],
    titleOverrides: {},
    students: [],
    selections: [],
    audit: [],
    counters: { ref: 412 },
    admins: [
      {
        id: 'adm-1',
        username: 'admin',
        name: 'Dr. M. Kessy',
        role: 'Administrator',
        pwHash: demoHash('Report@2026'),
        status: 'active',
      },
      {
        id: 'adm-2',
        username: 'controller',
        name: 'Registrar, Research Office',
        role: 'System administrator',
        pwHash: demoHash('Report@2026'),
        status: 'active',
      },
    ],
    seededAt: new Date().toISOString(),
  };
  seedHistory(db);
  return db;
}

/* ------------------------------------------------------------------ */
/* Persistence                                                          */
/* ------------------------------------------------------------------ */

export function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db && db.v === DB_VERSION) return db;
    }
  } catch (err) {
    console.warn('Stored portal data could not be read, reseeding.', err);
  }
  const fresh = seedDB();
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  } catch (err) {
    console.warn('Portal data could not be persisted.', err);
  }
  return fresh;
}

export function saveDB(db) {
  db.rev = (db.rev || 0) + 1;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  broadcast();
  return db;
}

/* Cross-tab notification so two open browsers see the same availability. */
let channel = null;
function broadcast() {
  try {
    if (!channel && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('reportsafi-portal');
    }
    channel?.postMessage({ type: 'db', rev: Date.now() });
  } catch {
    /* storage event fallback is enough */
  }
}

export function subscribe(cb) {
  const onStorage = (e) => {
    if (e.key === DB_KEY) cb();
  };
  const onMessage = () => cb();
  window.addEventListener('storage', onStorage);
  try {
    if (!channel && 'BroadcastChannel' in window) channel = new BroadcastChannel('reportsafi-portal');
    channel?.addEventListener('message', onMessage);
  } catch {
    /* noop */
  }
  return () => {
    window.removeEventListener('storage', onStorage);
    try {
      channel?.removeEventListener('message', onMessage);
    } catch {
      /* noop */
    }
  };
}

/* ------------------------------------------------------------------ */
/* Exclusive lock — stands in for a DB transaction (PRD §5.3, §10)       */
/* ------------------------------------------------------------------ */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withLock(fn, { timeout = 4000 } = {}) {
  const started = Date.now();
  const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  for (;;) {
    let held = null;
    try {
      held = JSON.parse(localStorage.getItem(LOCK_KEY) || 'null');
    } catch {
      held = null;
    }

    if (held && held.owner !== owner && Date.now() - held.ts < 1500) {
      if (Date.now() - started > timeout) {
        const err = new Error('The portal is receiving many requests right now. Please try again.');
        err.code = 'busy';
        throw err;
      }
      await wait(20 + Math.random() * 30);
      continue;
    }

    localStorage.setItem(LOCK_KEY, JSON.stringify({ owner, ts: Date.now() }));
    const confirm = JSON.parse(localStorage.getItem(LOCK_KEY) || 'null');
    if (confirm && confirm.owner === owner) break;
    await wait(20);
  }

  try {
    return await fn();
  } finally {
    try {
      const current = JSON.parse(localStorage.getItem(LOCK_KEY) || 'null');
      if (current && current.owner === owner) localStorage.removeItem(LOCK_KEY);
    } catch {
      localStorage.removeItem(LOCK_KEY);
    }
  }
}

export { normReg, normPhone };
