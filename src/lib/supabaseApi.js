/**
 * Supabase-backed implementation of the portal service layer.
 *
 * The browser talks only to Supabase with the PUBLISHABLE key. All data lives
 * in normalized tables (programmes, titles, students, selections, audit_log).
 * Every read/write goes through a SECURITY DEFINER RPC so the browser cannot
 * bypass BR-01…BR-09 or read admin credentials.
 */
import { createClient } from '@supabase/supabase-js';
import { demoHash, normPhone, normReg, parseCSV } from './utils.js';
import { ApiError } from './errors.js';

// Vite injects import.meta.env; the global fallback lets Node smoke harnesses exercise this backend.
const ENV = import.meta.env || globalThis.__RS_ENV__ || {};
const URL = ENV.VITE_SUPABASE_URL;
const KEY = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  URL && KEY
    ? createClient(URL, KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null;

function remoteError(error) {
  const raw = String(error?.message || error?.hint || 'Supabase request failed.');
  const match = raw.match(/RS\|([^|]+)\|([\s\S]+)/);
  if (!match) return new ApiError(raw, 'remote');
  const code = match[1].trim();
  const message = match[2]
    .replace(/\s*\(SQLSTATE[^)]*\)\s*$/i, '')
    .replace(/\s*$/, '');
  return new ApiError(message, code);
}

async function call(name, args = {}) {
  if (!supabase) throw new ApiError('Supabase is not configured.', 'config');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw remoteError(error);
  return data;
}

/** Poll the meta version so open tabs see reservations made elsewhere. */
export function subscribe(cb) {
  if (!supabase) return () => {};
  let alive = true;
  let last = null;

  const check = async () => {
    const stamp = await call('rs_version').catch(() => null);
    if (!alive || stamp == null) return;
    if (last === null) {
      last = stamp;
      return;
    }
    if (stamp !== last) {
      last = stamp;
      cb();
    }
  };

  check();
  const timer = setInterval(check, 4000);
  return () => {
    alive = false;
    clearInterval(timer);
  };
}

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

export async function getPublicStats() {
  return call('rs_public_stats');
}

/** Editable site copy stored as rows in `site_content`. */
export async function getSiteContent() {
  return call('rs_site_content');
}

export async function getProgrammes({ includeInactive = false } = {}) {
  return call('rs_programmes', { p_include_inactive: includeInactive });
}

export async function getCatalogue({
  programmeId,
  q = '',
  status = 'all',
  sort = 'az',
  page = 1,
  pageSize = 20,
} = {}) {
  return call('rs_catalogue', {
    p_programme_id: programmeId,
    p_q: q,
    p_status: status,
    p_sort: sort,
    p_page: page,
    p_page_size: pageSize,
  });
}

export async function identify({ regNo, names, phone, supervisorName = '', programmeId }) {
  const cleanPhone = normPhone(phone);
  if (!cleanPhone) {
    throw new ApiError('Enter a valid Tanzanian mobile number (e.g. 0712 345 678).', 'validation');
  }
  return call('rs_identify', {
    p_payload: {
      studentId: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      regNo: normReg(regNo),
      names,
      phone: cleanPhone,
      supervisorName: String(supervisorName || '').trim(),
      programmeId,
    },
  });
}

export async function getTitleById(titleId) {
  return call('rs_title', { p_title_id: titleId });
}

export async function getSelectionForStudent(studentId) {
  return call('rs_selection_for_student', { p_student_id: studentId });
}

export async function reserve({ studentId, titleId }) {
  return call('rs_reserve', {
    p_payload: {
      studentId,
      titleId,
      selectionId: `sel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    },
  });
}

export async function getSelectionByRef(ref) {
  return call('rs_selection_by_ref', { p_ref: ref });
}

export async function updateSelectionDetails({ ref, names, phone, supervisorName = '', reason = '' }) {
  const cleanPhone = normPhone(phone);
  if (!cleanPhone) {
    throw new ApiError('Enter a valid Tanzanian mobile number (e.g. 0712 345 678).', 'validation');
  }
  return call('rs_update_selection_details', {
    p_payload: {
      ref: String(ref || '').trim().toUpperCase(),
      names,
      phone: cleanPhone,
      supervisorName: String(supervisorName || '').trim(),
      reason: String(reason || '').trim(),
    },
  });
}

export async function changeSelectionTitle({ ref, newTitleId, supervisorName = '', reason = '' }) {
  return call('rs_change_selection_title', {
    p_payload: {
      ref: String(ref || '').trim().toUpperCase(),
      newTitleId,
      supervisorName: String(supervisorName || '').trim(),
      reason: String(reason || '').trim(),
    },
  });
}

export async function createOrder(input) {
  const cleanPhone = normPhone(input.phone);
  if (!cleanPhone) {
    throw new ApiError('Enter a valid Tanzanian mobile number (e.g. 0712 345 678).', 'validation');
  }
  return call('rs_create_order', {
    p_payload: {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      packageName: input.packageName,
      price: input.price,
      unit: input.unit || '',
      names: input.names,
      regNo: normReg(input.regNo),
      phone: cleanPhone,
      supervisorName: String(input.supervisorName || '').trim(),
      institution: String(input.institution || '').trim(),
      programme: input.programme,
      title: String(input.title || '').trim(),
      selectionRef: String(input.selectionRef || '').trim().toUpperCase(),
      notes: String(input.notes || '').trim(),
    },
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export async function adminLogin(username, password) {
  const result = await call('rs_admin_login', {
    p_payload: {
      username: String(username || '').trim().toLowerCase(),
      pwHash: demoHash(String(password || '')),
    },
  });
  if (!result?.ok) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    throw new ApiError('Incorrect username or password.', 'unauthorised');
  }
  return result.admin;
}

export async function listProgrammesAdmin() {
  return call('rs_list_programmes_admin');
}

export async function getAdminStats() {
  return call('rs_admin_stats');
}

export async function createProgramme(input, actor) {
  return call('rs_create_programme', {
    p_payload: {
      id: `p-${Date.now()}`,
      code: input.code,
      name: input.name,
      award: input.award,
      department: input.department,
      reason: input.reason || '—',
      actor,
    },
  });
}

export async function updateProgramme(id, patch, actor, reason = '—') {
  return call('rs_update_programme', { p_payload: { id, patch, actor, reason } });
}

export async function addTitle({ programmeId, text, category }, actor) {
  return call('rs_add_title', {
    p_payload: {
      id: `t-ADD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      programmeId,
      text,
      category,
      actor,
    },
  });
}

export async function updateTitle(id, patch, actor, reason = '—') {
  return call('rs_update_title', { p_payload: { id, patch, actor, reason } });
}

export async function setTitleStatus(id, status, actor, reason) {
  if (status === 'inactive' && !String(reason || '').trim())
    throw new ApiError('Give a reason before withdrawing a title.', 'validation');
  return call('rs_set_title_status', { p_payload: { id, status, actor, reason: reason || '—' } });
}

export async function validateImport({ programmeId, csvText }) {
  const programme = await call('rs_programme', { p_programme_id: programmeId });
  if (!programme) throw new ApiError('Choose a programme first.');

  const rows = parseCSV(csvText).filter((r) => r.some((c) => String(c).trim()));
  if (!rows.length) throw new ApiError('No rows found. Paste CSV with columns: title, category');

  let start = 0;
  const first = (rows[0][0] || '').toLowerCase();
  if (first.includes('title') || first.includes('topic') || first.includes('mada')) start = 1;

  const stored = await call('rs_programme_titles', { p_programme_id: programmeId });
  const existing = new Set((stored || []).map((t) => String(t.text).trim().toLowerCase()));
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
  return call('rs_commit_import', { p_payload: { programmeId, valid, actor } });
}

export async function listTitlesAdmin({
  programmeId = 'all',
  q = '',
  status = 'all',
  page = 1,
  pageSize = 20,
} = {}) {
  return call('rs_list_titles_admin', {
    p_programme_id: programmeId,
    p_q: q,
    p_status: status,
    p_page: page,
    p_page_size: pageSize,
  });
}

export async function listSelections({
  q = '',
  status = 'all',
  programmeId = 'all',
  page = 1,
  pageSize = 15,
} = {}) {
  return call('rs_list_selections', {
    p_q: q,
    p_status: status,
    p_programme_id: programmeId,
    p_page: page,
    p_page_size: pageSize,
  });
}

export async function releaseSelection({ selectionId, reason, actor }) {
  const cleanReason = String(reason || '').trim();
  if (cleanReason.length < 5)
    throw new ApiError('A reason of at least 5 characters is required.', 'validation');
  return call('rs_release_selection', {
    p_payload: { selectionId, reason: cleanReason, actor },
  });
}

export async function listOrders({
  q = '',
  status = 'all',
  packageName = 'all',
  page = 1,
  pageSize = 15,
} = {}) {
  return call('rs_list_orders', {
    p_q: q,
    p_status: status,
    p_package: packageName,
    p_page: page,
    p_page_size: pageSize,
  });
}

export async function updateOrder({ id, status, adminNotes = '', reason = '', actor }) {
  return call('rs_update_order', {
    p_payload: { id, status, adminNotes, reason, actor },
  });
}

export async function listStudentsAdmin({
  q = '',
  programmeId = 'all',
  filter = 'all',
  page = 1,
  pageSize = 15,
} = {}) {
  return call('rs_list_students', {
    p_q: q,
    p_programme_id: programmeId,
    p_filter: filter,
    p_page: page,
    p_page_size: pageSize,
  });
}

export async function updateStudentAdmin({ id, names, phone, supervisorName = '', reason = '', actor }) {
  const cleanPhone = normPhone(phone);
  if (!cleanPhone) {
    throw new ApiError('Enter a valid Tanzanian mobile number (e.g. 0712 345 678).', 'validation');
  }
  return call('rs_update_student_admin', {
    p_payload: {
      id,
      names,
      phone: cleanPhone,
      supervisorName: String(supervisorName || '').trim(),
      reason,
      actor,
    },
  });
}

export async function updateSiteContent({ key, data, reason = '', actor }) {
  return call('rs_update_site_content', {
    p_payload: { key, data, reason, actor },
  });
}

export async function listAudit({ q = '', action = 'all', page = 1, pageSize = 20 } = {}) {
  return call('rs_list_audit', {
    p_q: q,
    p_action: action,
    p_page: page,
    p_page_size: pageSize,
  });
}
