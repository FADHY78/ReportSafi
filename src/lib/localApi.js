/**
 * Service layer — every PRD business rule is enforced here, in one place,
 * immediately before the write is committed (BR-01 … BR-09).
 *
 * This module is intentionally written like a thin API client: it is
 * asynchronous, it validates, it fails with typed errors and it never trusts
 * anything the caller sent about availability. Replacing the internals with
 * `fetch()` calls to the real backend leaves every caller untouched.
 */
import { loadDB, saveDB, withLock, allTitles, titlesOf } from './db.js';
import { normReg, normPhone, demoHash, pad, parseCSV } from './utils.js';
import { ApiError } from './errors.js';

export { subscribe } from './db.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const roundTrip = () => wait(120 + Math.random() * 200); // feels like a real request

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

/* ------------------------------------------------------------------ */
/* Availability helpers                                                 */
/* ------------------------------------------------------------------ */

function activeTitleIds(db) {
  const set = new Set();
  db.selections.forEach((s) => {
    if (s.status === 'active') set.add(s.titleId);
  });
  return set;
}

function activeSelectionOf(db, studentId) {
  return db.selections.find((s) => s.studentId === studentId && s.status === 'active') || null;
}

function writeAudit(db, entry) {
  db.audit.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    ...entry,
  });
  if (db.audit.length > 400) db.audit.length = 400;
}

function newRef(db) {
  const year = new Date().getFullYear();
  db.counters.ref = (db.counters.ref || 0) + 1;
  return `RS-TS-${year}-${pad(db.counters.ref, 5)}`;
}

/* ------------------------------------------------------------------ */
/* Public: catalogue & identity                                        */
/* ------------------------------------------------------------------ */

export async function getPublicStats() {
  await roundTrip();
  const db = loadDB();
  const taken = activeTitleIds(db);
  const titles = allTitles(db);
  const active = titles.filter((t) => t.status === 'active');
  const today = new Date().toDateString();
  const unavailable = active.filter((t) => taken.has(t.id)).length;
  return {
    programmes: db.programmes.filter((p) => p.status === 'active').length,
    titles: active.length,
    available: active.length - unavailable,
    unavailable,
    completed: db.selections.filter((s) => s.status === 'active').length,
    today: db.selections.filter((s) => new Date(s.selectedAt).toDateString() === today).length,
  };
}

export async function getProgrammes({ includeInactive = false } = {}) {
  await roundTrip();
  const db = loadDB();
  return db.programmes.filter((p) => includeInactive || p.status === 'active');
}

export async function getCatalogue({
  programmeId,
  q = '',
  status = 'all',
  sort = 'az',
  page = 1,
  pageSize = 20,
} = {}) {
  await roundTrip();
  const db = loadDB();
  const taken = activeTitleIds(db);

  let rows = titlesOf(db, programmeId).filter((t) => t.status === 'active');

  const needle = q.trim().toLowerCase();
  if (needle) {
    rows = rows.filter(
      (t) =>
        t.text.toLowerCase().includes(needle) ||
        t.code.toLowerCase().includes(needle) ||
        t.category.toLowerCase().includes(needle)
    );
  }

  const available = rows.filter((t) => !taken.has(t.id)).length;
  const unavailable = rows.length - available;

  if (status === 'available') rows = rows.filter((t) => !taken.has(t.id));
  if (status === 'unavailable') rows = rows.filter((t) => taken.has(t.id));

  rows = rows.slice().sort((a, b) => {
    if (sort === 'za') return b.text.localeCompare(a.text);
    if (sort === 'new') return byNewest(a, b);
    if (sort === 'old') return byNewest(b, a);
    return a.text.localeCompare(b.text);
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize).map((t) => ({ ...t, available: !taken.has(t.id) })),
    total,
    page: current,
    totalPages,
    available,
    unavailable,
    catalogueTotal: available + unavailable,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

/** PRD §5.1 — capture identity. Stored, explicitly NOT verified. */
export async function identify({ regNo, names, phone, programmeId }) {
  await roundTrip();
  const cleanReg = normReg(regNo);
  const cleanNames = String(names || '').replace(/\s+/g, ' ').trim();
  const cleanPhone = normPhone(phone);

  if (cleanReg.length < 5) throw new ApiError('Enter a valid registration number.', 'validation');
  if (cleanNames.split(' ').filter(Boolean).length < 2)
    throw new ApiError('Enter your full names (at least two parts).', 'validation');
  if (!cleanPhone) throw new ApiError('Enter a valid Tanzanian mobile number (e.g. 0712 345 678).', 'validation');
  if (!programmeId) throw new ApiError('Choose your programme/course.', 'validation');

  return withLock(() => {
    const db = loadDB();
    const programme = db.programmes.find((p) => p.id === programmeId && p.status === 'active');
    if (!programme) throw new ApiError('That programme is not open for selection.', 'not_found');

    const now = new Date().toISOString();
    let student = db.students.find((s) => s.regNo === cleanReg);
    const existing = student ? activeSelectionOf(db, student.id) : null;

    if (student) {
      // A student who already holds a title keeps the programme they selected it under.
      student.names = cleanNames;
      student.phone = cleanPhone;
      if (!existing) student.programmeId = programmeId;
      student.updatedAt = now;
    } else {
      student = {
        id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        regNo: cleanReg,
        names: cleanNames,
        phone: cleanPhone,
        programmeId,
        createdAt: now,
        updatedAt: now,
      };
      db.students.push(student);
    }

    saveDB(db);

    const held = existing
      ? allTitles(db).find((t) => t.id === existing.titleId) || null
      : null;

    return {
      student: { ...student },
      programme: db.programmes.find((p) => p.id === student.programmeId),
      existingSelection: existing ? { ...existing, title: held } : null,
      verified: false, // PRD §5.1 — data entry, not proof of identity
    };
  });
}

export async function getTitleById(titleId) {
  await wait(70);
  const db = loadDB();
  const taken = activeTitleIds(db);
  const title = allTitles(db).find((t) => t.id === titleId);
  if (!title) return null;
  return { ...title, available: !taken.has(title.id) };
}

export async function getSelectionForStudent(studentId) {
  await wait(60);
  const db = loadDB();
  const sel = activeSelectionOf(db, studentId);
  if (!sel) return null;
  const title = allTitles(db).find((t) => t.id === sel.titleId) || null;
  const student = db.students.find((s) => s.id === studentId) || null;
  const programme = db.programmes.find((p) => p.id === student?.programmeId) || null;
  return { ...sel, title, student, programme };
}

/* ------------------------------------------------------------------ */
/* PRD §5.3 — reserve exactly one title, atomically                    */
/* ------------------------------------------------------------------ */

export async function reserve({ studentId, titleId }) {
  await roundTrip();
  return withLock(() => {
    // Re-read inside the lock: another tab may have committed first.
    const db = loadDB();
    const student = db.students.find((s) => s.id === studentId);
    if (!student) throw new ApiError('Your session expired. Please identify yourself again.', 'unauthorised');

    // BR-01 / BR-09 — one active selection per student
    const existing = activeSelectionOf(db, student.id);
    if (existing) {
      const held = allTitles(db).find((t) => t.id === existing.titleId);
      throw new ApiError(
        `You already hold title ${held?.code || ''}. Only one selection is allowed — an administrator can release it.`,
        'already_selected'
      );
    }

    const title = allTitles(db).find((t) => t.id === titleId);
    if (!title) throw new ApiError('That title no longer exists.', 'not_found');
    if (title.status !== 'active') throw new ApiError('That title has been withdrawn from the catalogue.', 'inactive');
    if (title.programmeId !== student.programmeId)
      throw new ApiError('You may only select titles from your own programme.', 'wrong_programme');

    // BR-02 / BR-03 / BR-04 — availability decided here, not in the browser
    const taken = activeTitleIds(db);
    if (taken.has(title.id))
      throw new ApiError('This title has just been taken by another student.', 'unavailable');

    const now = new Date().toISOString();
    const selection = {
      id: `sel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ref: newRef(db),
      studentId: student.id,
      titleId: title.id,
      status: 'active',
      selectedAt: now,
      releasedAt: null,
      releaseReason: null,
      releasedBy: null,
    };

    db.selections.push(selection);
    writeAudit(db, {
      actor: student.names,
      role: 'Student',
      action: 'selection.create',
      entity: 'Selection',
      entityId: selection.ref,
      summary: `${student.regNo} reserved ${title.code}`,
      reason: '—',
      before: 'available',
      after: 'unavailable',
    });
    saveDB(db);

    return { ...selection, title: { ...title } };
  });
}

export async function getSelectionByRef(ref) {
  await wait(80);
  const db = loadDB();
  const clean = String(ref || '').trim().toUpperCase();
  const sel = db.selections.find((s) => s.ref.toUpperCase() === clean);
  if (!sel) return null;
  const title = allTitles(db).find((t) => t.id === sel.titleId) || null;
  const student = db.students.find((s) => s.id === sel.studentId) || null;
  const programme = db.programmes.find((p) => p.id === student?.programmeId) || null;
  return { ...sel, title, student, programme };
}

/* ------------------------------------------------------------------ */
/* Admin: authentication (PRD §6, §10 — demo credentials, see login)    */
/* ------------------------------------------------------------------ */

export async function adminLogin(username, password) {
  await roundTrip();
  const db = loadDB();
  const clean = String(username || '').trim().toLowerCase();
  const admin = db.admins.find((a) => a.username === clean);

  if (!admin || admin.status !== 'active' || admin.pwHash !== demoHash(String(password || ''))) {
    writeAudit(db, {
      actor: clean || 'unknown',
      role: 'Unauthenticated',
      action: 'auth.failed',
      entity: 'Administrator account',
      entityId: clean || '—',
      summary: 'Failed sign-in attempt',
      reason: '—',
      before: '—',
      after: '—',
    });
    saveDB(db);
    await wait(400); // slow down brute force a little
    throw new ApiError('Incorrect username or password.', 'unauthorised');
  }

  writeAudit(db, {
    actor: admin.name,
    role: admin.role,
    action: 'auth.login',
    entity: 'Administrator account',
    entityId: admin.username,
    summary: 'Signed in to the admin workspace',
    reason: '—',
    before: '—',
    after: '—',
  });
  saveDB(db);

  return { id: admin.id, username: admin.username, name: admin.name, role: admin.role };
}

/** Admin listing: programmes with live catalogue counts (PRD §12). */
export async function listProgrammesAdmin() {
  await roundTrip();
  const db = loadDB();
  const taken = activeTitleIds(db);
  return db.programmes.map((p) => {
    const rows = titlesOf(db, p.id);
    const active = rows.filter((t) => t.status === 'active');
    return {
      ...p,
      titleCount: active.length,
      available: active.filter((t) => !taken.has(t.id)).length,
      unavailable: active.filter((t) => taken.has(t.id)).length,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Admin: dashboard & reporting (PRD §12)                               */
/* ------------------------------------------------------------------ */

export async function getAdminStats() {
  await roundTrip();
  const db = loadDB();
  const taken = activeTitleIds(db);
  const titles = allTitles(db);
  const active = titles.filter((t) => t.status === 'active');
  const today = new Date().toDateString();

  const perProgramme = db.programmes.map((p) => {
    const rows = titlesOf(db, p.id).filter((t) => t.status === 'active');
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      total: rows.length,
      available: rows.filter((t) => !taken.has(t.id)).length,
      unavailable: rows.filter((t) => taken.has(t.id)).length,
    };
  });

  return {
    programmes: db.programmes.length,
    activeProgrammes: db.programmes.filter((p) => p.status === 'active').length,
    titles: active.length,
    available: active.filter((t) => !taken.has(t.id)).length,
    unavailable: active.filter((t) => taken.has(t.id)).length,
    students: db.students.length,
    selections: db.selections.filter((s) => s.status === 'active').length,
    released: db.selections.filter((s) => s.status === 'released').length,
    today: db.selections.filter((s) => new Date(s.selectedAt).toDateString() === today).length,
    perProgramme,
    recent: [...db.selections]
      .sort((a, b) => new Date(b.selectedAt) - new Date(a.selectedAt))
      .slice(0, 6)
      .map((s) => {
        const student = db.students.find((x) => x.id === s.studentId);
        const title = allTitles(db).find((t) => t.id === s.titleId);
        return { ...s, student, title };
      }),
    audit: db.audit.slice(0, 6),
  };
}

/* ------------------------------------------------------------------ */
/* Admin: programmes & titles                                           */
/* ------------------------------------------------------------------ */

export async function createProgramme(input, actor) {
  await roundTrip();
  const code = String(input.code || '').trim().toUpperCase();
  const name = String(input.name || '').trim();
  if (code.length < 2) throw new ApiError('Programme code is required (2+ characters).');
  if (name.length < 4) throw new ApiError('Programme name is required.');
  if (!actor?.name) throw new ApiError('Sign in to perform this action.', 'unauthorised');

  return withLock(() => {
    const db = loadDB();
    if (db.programmes.some((p) => p.code === code))
      throw new ApiError(`Programme code ${code} already exists.`, 'conflict');

    const programme = {
      id: `p-${Date.now()}`,
      code,
      name,
      award: String(input.award || '').trim() || '—',
      department: String(input.department || '').trim() || '—',
      status: 'active',
    };
    db.programmes.push(programme);
    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: 'programme.create',
      entity: 'Programme',
      entityId: code,
      summary: `Created programme ${code}`,
      reason: input.reason || '—',
      before: '—',
      after: name,
    });
    saveDB(db);
    return programme;
  });
}

export async function updateProgramme(id, patch, actor, reason = '—') {
  await roundTrip();
  return withLock(() => {
    const db = loadDB();
    const p = db.programmes.find((x) => x.id === id);
    if (!p) throw new ApiError('Programme not found.', 'not_found');
    const before = `${p.name} · ${p.status}`;
    Object.assign(p, patch);
    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: 'programme.update',
      entity: 'Programme',
      entityId: p.code,
      summary: `Updated programme ${p.code}`,
      reason,
      before,
      after: `${p.name} · ${p.status}`,
    });
    saveDB(db);
    return { ...p };
  });
}

export async function addTitle({ programmeId, text, category }, actor) {
  await roundTrip();
  const clean = String(text || '').trim();
  if (clean.length < 15) throw new ApiError('A title must be at least 15 characters long.');
  if (!actor?.name) throw new ApiError('Sign in to perform this action.', 'unauthorised');

  return withLock(() => {
    const db = loadDB();
    const programme = db.programmes.find((p) => p.id === programmeId);
    if (!programme) throw new ApiError('Choose a programme first.');
    const rows = titlesOf(db, programmeId);
    if (rows.some((t) => t.text.toLowerCase() === clean.toLowerCase()))
      throw new ApiError('That title already exists in this programme.', 'conflict');

    const seq = rows.length + 1;
    const title = {
      id: `t-ADD-${Date.now()}`,
      code: `${programme.code}/${pad(seq, 4)}`,
      text: clean,
      category: String(category || '').trim() || 'General',
      programmeId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.titleAdds.push(title);
    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: 'title.create',
      entity: 'Title',
      entityId: title.code,
      summary: `Added title ${title.code}`,
      reason: '—',
      before: '—',
      after: clean.slice(0, 70),
    });
    saveDB(db);
    return title;
  });
}

export async function updateTitle(id, patch, actor, reason = '—') {
  await roundTrip();
  return withLock(() => {
    const db = loadDB();
    const title = allTitles(db).find((t) => t.id === id);
    if (!title) throw new ApiError('Title not found.', 'not_found');
    const before = title.text;
    db.titleOverrides[id] = { ...(db.titleOverrides[id] || {}), ...patch };
    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: 'title.update',
      entity: 'Title',
      entityId: title.code,
      summary: `Edited title ${title.code}`,
      reason,
      before: before.slice(0, 70),
      after: String(patch.text || before).slice(0, 70),
    });
    saveDB(db);
    return { ...title, ...patch };
  });
}

export async function setTitleStatus(id, status, actor, reason) {
  await roundTrip();
  if (status === 'inactive' && !String(reason || '').trim())
    throw new ApiError('Give a reason before withdrawing a title.', 'validation');

  return withLock(() => {
    const db = loadDB();
    const title = allTitles(db).find((t) => t.id === id);
    if (!title) throw new ApiError('Title not found.', 'not_found');
    if (title.status === status) return { ...title };

    db.titleOverrides[id] = { ...(db.titleOverrides[id] || {}), status };
    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: status === 'inactive' ? 'title.deactivate' : 'title.reactivate',
      entity: 'Title',
      entityId: title.code,
      summary: `${status === 'inactive' ? 'Withdrew' : 'Restored'} title ${title.code}`,
      reason: reason || '—',
      before: title.status,
      after: status,
    });
    saveDB(db);
    return { ...title, status };
  });
}

/** PRD §6 — bulk import with validation preview before anything is committed. */
export async function validateImport({ programmeId, csvText }) {
  await wait(200);
  const db = loadDB();
  const programme = db.programmes.find((p) => p.id === programmeId);
  if (!programme) throw new ApiError('Choose a programme first.');

  const rows = parseCSV(csvText).filter((r) => r.some((c) => String(c).trim()));
  if (!rows.length) throw new ApiError('No rows found. Paste CSV with columns: title, category');

  // Header detection
  let start = 0;
  const first = (rows[0][0] || '').toLowerCase();
  if (first.includes('title') || first.includes('topic') || first.includes('mada')) start = 1;

  const existing = new Set(titlesOf(db, programmeId).map((t) => t.text.trim().toLowerCase()));
  const seen = new Set();
  const valid = [];
  const rejected = [];

  rows.slice(start).forEach((row, i) => {
    const lineNumber = i + start + 1;
    const text = String(row[0] || '').replace(/\s+/g, ' ').trim();
    const category = String(row[1] || '').replace(/\s+/g, ' ').trim() || 'General';
    const error = [];

    if (text.length < 15) error.push('Title too short (min 15 characters)');
    const key = text.toLowerCase();
    if (text && seen.has(key)) error.push('Duplicate inside this file');
    if (existing.has(key)) error.push('Already exists in this programme');
    if (row.length > 2 && String(row[2] || '').trim()) error.push('Extra column present — ignored');

    seen.add(key);
    if (error.length) rejected.push({ line: lineNumber, text: text || '(empty)', reason: error.join('; ') });
    else valid.push({ line: lineNumber, text, category });
  });

  return { valid, rejected, programme, total: valid.length + rejected.length };
}

export async function commitImport({ programmeId, valid, actor }) {
  if (!valid?.length) throw new ApiError('Nothing valid to import.', 'validation');
  if (!actor?.name) throw new ApiError('Sign in to perform this action.', 'unauthorised');

  return withLock(() => {
    const db = loadDB();
    const programme = db.programmes.find((p) => p.id === programmeId);
    if (!programme) throw new ApiError('Programme not found.', 'not_found');
    const base = titlesOf(db, programmeId).length;
    const now = new Date().toISOString();

    valid.forEach((row, i) => {
      db.titleAdds.push({
        id: `t-IMP-${Date.now()}-${i}`,
        code: `${programme.code}/${pad(base + i + 1, 4)}`,
        text: row.text,
        category: row.category,
        programmeId,
        status: 'active',
        createdAt: now,
      });
    });

    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: 'title.import',
      entity: 'Title catalogue',
      entityId: programme.code,
      summary: `Imported ${valid.length} titles for ${programme.code}`,
      reason: 'CSV import',
      before: `${base} titles`,
      after: `${base + valid.length} titles`,
    });
    saveDB(db);
    return { imported: valid.length };
  });
}

/** Admin catalogue listing — includes withdrawn titles and every programme. */
export async function listTitlesAdmin({
  programmeId = 'all',
  q = '',
  status = 'all',
  page = 1,
  pageSize = 20,
} = {}) {
  await roundTrip();
  const db = loadDB();
  const taken = activeTitleIds(db);
  const programmes = new Map(db.programmes.map((p) => [p.id, p]));

  let rows = allTitles(db).map((t) => ({
    ...t,
    available: !taken.has(t.id),
    programme: programmes.get(t.programmeId) || null,
  }));

  if (programmeId !== 'all') rows = rows.filter((t) => t.programmeId === programmeId);
  if (status !== 'all') rows = rows.filter((t) => t.status === status);

  const needle = q.trim().toLowerCase();
  if (needle) {
    rows = rows.filter(
      (t) =>
        t.text.toLowerCase().includes(needle) ||
        t.code.toLowerCase().includes(needle) ||
        t.category.toLowerCase().includes(needle) ||
        (t.programme?.name || '').toLowerCase().includes(needle)
    );
  }

  rows.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: current,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

/* ------------------------------------------------------------------ */
/* Admin: selections & audit                                            */
/* ------------------------------------------------------------------ */

export async function listSelections({
  q = '',
  status = 'all',
  programmeId = 'all',
  page = 1,
  pageSize = 15,
} = {}) {
  await roundTrip();
  const db = loadDB();
  const titles = allTitles(db);

  let rows = db.selections.map((s) => {
    const student = db.students.find((x) => x.id === s.studentId) || null;
    const title = titles.find((t) => t.id === s.titleId) || null;
    const programme = db.programmes.find((p) => p.id === student?.programmeId) || null;
    return { ...s, student, title, programme };
  });

  if (status !== 'all') rows = rows.filter((r) => r.status === status);
  if (programmeId !== 'all') rows = rows.filter((r) => r.student?.programmeId === programmeId);

  const needle = q.trim().toLowerCase();
  if (needle) {
    rows = rows.filter(
      (r) =>
        r.ref.toLowerCase().includes(needle) ||
        r.student?.regNo.toLowerCase().includes(needle) ||
        r.student?.names.toLowerCase().includes(needle) ||
        r.student?.phone.includes(needle) ||
        r.title?.text.toLowerCase().includes(needle)
    );
  }

  rows.sort((a, b) => new Date(b.selectedAt) - new Date(a.selectedAt));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: current,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}

/** PRD §BR-07 — release only with a recorded reason, always audited. */
export async function releaseSelection({ selectionId, reason, actor }) {
  const cleanReason = String(reason || '').trim();
  if (cleanReason.length < 5) throw new ApiError('A reason of at least 5 characters is required.', 'validation');
  if (!actor?.name) throw new ApiError('Sign in to perform this action.', 'unauthorised');

  await roundTrip();
  return withLock(() => {
    const db = loadDB();
    const sel = db.selections.find((s) => s.id === selectionId);
    if (!sel) throw new ApiError('Selection not found.', 'not_found');
    if (sel.status === 'released') throw new ApiError('That selection was already released.', 'conflict');

    const student = db.students.find((x) => x.id === sel.studentId);
    const title = allTitles(db).find((t) => t.id === sel.titleId);

    sel.status = 'released';
    sel.releasedAt = new Date().toISOString();
    sel.releaseReason = cleanReason;
    sel.releasedBy = actor.name;

    writeAudit(db, {
      actor: actor.name,
      role: actor.role,
      action: 'selection.release',
      entity: 'Selection',
      entityId: sel.ref,
      summary: `Released ${sel.ref} (${student?.regNo || '—'} → ${title?.code || '—'})`,
      reason: cleanReason,
      before: 'active',
      after: 'released',
    });
    saveDB(db);
    return { ...sel };
  });
}

export async function listAudit({ q = '', action = 'all', page = 1, pageSize = 20 } = {}) {
  await roundTrip();
  const db = loadDB();
  let rows = db.audit.slice();

  if (action !== 'all') rows = rows.filter((r) => r.action === action);
  const needle = q.trim().toLowerCase();
  if (needle) {
    rows = rows.filter(
      (r) =>
        r.actor.toLowerCase().includes(needle) ||
        r.summary.toLowerCase().includes(needle) ||
        String(r.entityId).toLowerCase().includes(needle) ||
        String(r.reason).toLowerCase().includes(needle)
    );
  }

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: current,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
  };
}
