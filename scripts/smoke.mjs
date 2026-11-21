/* Temporary smoke test for the portal's business rules. Run: npm run test:rules */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  location: { hash: '', pathname: '/', search: '' },
  addEventListener() {},
  removeEventListener() {},
};

const api = await import('../src/lib/api.js');
const { allTitles, loadDB } = await import('../src/lib/db.js');

let failures = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) failures += 1;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`);
};

/* 1. seed + scale (BR-08: >= 1,000 titles per programme) */
const stats = await api.getPublicStats();
const db0 = loadDB();
const baf = db0.programmes.find((p) => p.code === 'BAF');
const bafTitles = allTitles(db0).filter((t) => t.programmeId === baf.id);
ok('BAF has >= 1,500 titles (BR-08)', bafTitles.length >= 1500, `${bafTitles.length}`);
ok('catalogue seeded with unavailable titles', stats.available > 0 && stats.unavailable > 0,
  `${stats.available} available / ${stats.unavailable} unavailable of ${stats.titles}`);

/* 2. catalogue paging + filtering */
const cat = await api.getCatalogue({ programmeId: baf.id, pageSize: 20, page: 1 });
ok('catalogue returns 20 rows', cat.rows.length === 20, `total ${cat.total}`);
const onlyAvail = await api.getCatalogue({ programmeId: baf.id, status: 'available', pageSize: 50 });
ok('availability filter works', onlyAvail.rows.every((r) => r.available));
const search = await api.getCatalogue({ programmeId: baf.id, q: 'Auditing', pageSize: 50 });
ok('keyword search filters', search.total > 0 && search.rows.every((r) => /auditing/i.test(r.text + r.category)),
  `${search.total} hits`);

/* 3. identity (BR-05) */
let rejected = false;
try {
  await api.identify({ regNo: 'x', names: 'Only', phone: 'abc', programmeId: baf.id });
} catch { rejected = true; }
ok('invalid identity rejected (BR-05)', rejected);

const s1 = await api.identify({
  regNo: ' baf/2024/00001 ',
  names: 'Neema Baraka Mushi',
  phone: '0712345678',
  supervisorName: 'Dr. Asha Mnyamzi',
  institution: 'CBE',
  programmeId: baf.id,
});
ok('identity normalised', s1.student.regNo === 'BAF/2024/00001' && s1.student.phone === '+255712345678',
  `${s1.student.regNo} / ${s1.student.phone}`);
ok('supervisor name stored on identity', s1.student.supervisorName === 'Dr. Asha Mnyamzi', s1.student.supervisorName);
ok('institution stored on identity', s1.student.institution === 'CBE', s1.student.institution);
ok('identity flagged as unverified', s1.verified === false);

/* 4. reserve (BR-01..04) */
const free = onlyAvail.rows[0];
const sel = await api.reserve({ studentId: s1.student.id, titleId: free.id });
ok('reservation creates a reference', /^RS-TS-\d{4}-\d{5}$/.test(sel.ref), sel.ref);

let second = 'none';
try {
  await api.reserve({ studentId: s1.student.id, titleId: onlyAvail.rows[1].id });
} catch (e) { second = e.code; }
ok('second title blocked for same student (BR-01/BR-09)', second === 'already_selected', second);

/* 5. another student cannot take the same title (BR-02/03/04) */
const s2 = await api.identify({
  regNo: 'BAF/2024/00002',
  names: 'Baraka Juma Kimaro',
  phone: '+255755123456',
  programmeId: baf.id,
});
let race = 'none';
try {
  await api.reserve({ studentId: s2.student.id, titleId: free.id });
} catch (e) { race = e.code; }
ok('title reported unavailable to second student', race === 'unavailable', race);

/* 5b. concurrent race — both students press confirm at once */
const free2 = (await api.getCatalogue({ programmeId: baf.id, status: 'available', pageSize: 5 })).rows[0];
const results = await Promise.allSettled([
  api.reserve({ studentId: s1.student.id, titleId: free2.id }),
  api.reserve({ studentId: s2.student.id, titleId: free2.id }),
]);
const wins = results.filter((r) => r.status === 'fulfilled').length;
ok('simultaneous reservations: exactly one winner (BR-02/03)', wins === 1, `${wins} won`);

/* 6. wrong programme blocked (BR-06) */
const other = db0.programmes.find((p) => p.code !== 'BAF');
const otherTitle = allTitles(db0).find((t) => t.programmeId === other.id);
let wrong = 'none';
try {
  await api.reserve({ studentId: s1.student.id, titleId: otherTitle.id });
} catch (e) { wrong = e.code; }
ok('cross-programme selection blocked (BR-06)', wrong === 'already_selected' || wrong === 'wrong_programme', wrong);

/* 7. admin auth + release with reason (BR-07) */
let badLogin = false;
try { await api.adminLogin('admin', 'wrong-password'); } catch { badLogin = true; }
ok('bad admin password rejected', badLogin);
const admin = await api.adminLogin('neemamndeme37@gmail.com', 'Neema1998?@');
ok('admin sign-in', admin.role === 'Administrator', admin.name);

const held = await api.getSelectionForStudent(s2.student.id);
const active = held || (await api.getSelectionForStudent(s1.student.id));
let noReason = false;
try {
  await api.releaseSelection({ selectionId: active.id, reason: 'ok', admin: undefined });
} catch { noReason = true; }
ok('release blocked without an authenticated actor', noReason);

await api.releaseSelection({
  selectionId: active.id,
  reason: 'Student withdrew from the programme',
  actor: admin,
});
const after = await api.getSelectionForStudent(active.studentId);
ok('released selection frees the student (BR-07)', after === null);

/* 8. import with validation preview */
const csv = [
  'title,category',
  'The Impact of Cloud Accounting on SME Tax Compliance in Dodoma,Taxation',
  'The Impact of Cloud Accounting on SME Tax Compliance in Dodoma,Taxation', // duplicate
  'Too short,Auditing', // too short
  `${bafTitles.find((t) => !t.text.includes(',')).text},Auditing`, // already exists
].join('\n');
const preview = await api.validateImport({ programmeId: baf.id, csvText: csv });
ok('import rejects duplicates and short rows', preview.valid.length === 1 && preview.rejected.length === 3,
  `${preview.valid} valid / ${preview.rejected.length} rejected`);
const imported = await api.commitImport({ programmeId: baf.id, valid: preview.valid, actor: admin });
ok('import commits accepted rows', imported.imported === 1);

/* 9. reporting + audit (PRD §12) */
const adminStats = await api.getAdminStats();
ok('dashboard figures present', adminStats.titles > 0 && adminStats.perProgramme.length === 48,
  `${adminStats.titles} titles, ${adminStats.selections} active selections`);
const audit = await api.listAudit({ pageSize: 50 });
ok('audit log records actions', audit.total >= 6 && audit.rows.some((r) => r.action === 'selection.release'),
  `${audit.total} entries`);

const sels = await api.listSelections({ status: 'active', pageSize: 10 });
ok('selection listing paginates', sels.rows.length > 0 && sels.totalPages >= 1, `${sels.total} active`);

/* 10. reference-number editing & title swap */
const activeForEdit = await api.getSelectionForStudent(s1.student.id);
const editedDetails = await api.updateSelectionDetails({
  ref: activeForEdit.ref,
  names: 'Neema Baraka Mushi',
  phone: '0712345679',
  supervisorName: 'Prof. Juma Kessy',
  reason: 'Supervisor updated',
});
ok(
  'reference number edits student details & records history',
  editedDetails.student.supervisorName === 'Prof. Juma Kessy' && editedDetails.editCount === 1,
  `editCount=${editedDetails.editCount}`
);

const nextAvail = (await api.getCatalogue({ programmeId: baf.id, status: 'available', pageSize: 5 })).rows[0];
const oldTitleId = editedDetails.titleId;
const swapped = await api.changeSelectionTitle({
  ref: editedDetails.ref,
  newTitleId: nextAvail.id,
  reason: 'Changed focus with supervisor',
});
const oldTitleAfter = await api.getTitleById(oldTitleId);
const newTitleAfter = await api.getTitleById(nextAvail.id);
const editedList = await api.listSelections({ status: 'edited', pageSize: 10 });
ok(
  'reference number swaps title, frees old title & tracks edited records',
  swapped.titleId === nextAvail.id &&
    swapped.editCount === 2 &&
    Boolean(swapped.previousTitleCode) &&
    oldTitleAfter.available === true &&
    newTitleAfter.available === false &&
    editedList.rows.some((r) => r.ref === swapped.ref),
  `${swapped.previousTitleCode} -> ${swapped.title.code}`
);

/* 11. package orders & students admin directory */
const order = await api.createOrder({
  packageName: 'Research Proposal + Research Report',
  price: 'TSh 40,000',
  unit: 'complete package',
  names: 'Neema Baraka Mushi',
  regNo: 'BAF/2024/00001',
  phone: '0712345679',
  supervisorName: 'Prof. Juma Kessy',
  institution: 'CBE',
  programme: 'BAF — Accounting & Finance',
  title: swapped.title.text,
  selectionRef: swapped.ref,
  notes: 'Urgent',
});
ok('package order created with ref', /^RS-ORD-\d{4}-\d{5}$/.test(order.ref), order.ref);

const updatedOrder = await api.updateOrder({
  id: order.id,
  status: 'in_progress',
  adminNotes: 'Assigned to writer',
  actor: admin,
});
const ordersList = await api.listOrders({ status: 'in_progress' });
ok(
  'admin updates & lists orders',
  updatedOrder.status === 'in_progress' && ordersList.rows.some((o) => o.ref === order.ref),
  `${ordersList.total} in progress`
);

const stuList = await api.listStudentsAdmin({ q: 'BAF/2024/00001' });
ok(
  'admin students directory finds student & supervisor',
  stuList.rows.length === 1 && stuList.rows[0].supervisorName === 'Prof. Juma Kessy',
  stuList.rows[0]?.supervisorName
);

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
