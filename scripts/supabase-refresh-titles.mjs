/**
 * Refreshes all UNSELECTED titles in Supabase with genuinely unique academic titles
 * and adds extra titles per programme, while strictly excluding and never touching
 * any title referenced by submitted selections (active or released).
 *
 * Run with: npm run db:refresh-titles
 */
import pg from 'pg';

const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  throw new Error('Missing SUPABASE_DB_URL in .env.local.');
}

const { BASE_PROGRAMMES, baseTitles } = await import('../src/lib/db.js');

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 25000,
});

try {
  await client.connect();

  // 1. Snapshot all titles referenced by ANY selection (active or released) — NEVER touch these!
  const selRes = await client.query(
    `select s.ref, s.status, s.title_id, t.code, t.text
     from public.selections s
     join public.titles t on t.id = s.title_id
     order by s.selected_at`
  );
  const protectedIds = new Set(selRes.rows.map((r) => r.title_id));
  console.log(`Protecting ${protectedIds.size} submitted selection title(s) (will NOT be modified):`);
  selRes.rows.forEach((r) => console.log(`  - ${r.ref} [${r.status}] ${r.code}: ${r.text}`));

  let totalUpdated = 0;
  let totalInserted = 0;

  await client.query('begin');

  for (const programme of BASE_PROGRAMMES) {
    const generated = baseTitles(programme.id);

    // Fetch existing rows in this programme to know which IDs exist and what texts are protected/custom
    const existingRes = await client.query(
      `select id, text from public.titles where programme_id = $1`,
      [programme.id]
    );
    const existingIds = new Set(existingRes.rows.map((r) => r.id));
    const generatedIds = new Set(generated.map((t) => t.id));
    const reservedTexts = new Set(
      existingRes.rows
        .filter((r) => protectedIds.has(r.id) || !generatedIds.has(r.id))
        .map((r) => r.text.toLowerCase())
    );

    const toUpdate = [];
    const toInsert = [];

    for (const t of generated) {
      if (protectedIds.has(t.id)) continue;
      if (reservedTexts.has(t.text.toLowerCase())) continue;
      reservedTexts.add(t.text.toLowerCase());

      if (existingIds.has(t.id)) {
        toUpdate.push(t);
      } else {
        toInsert.push(t);
      }
    }

    if (toUpdate.length > 0) {
      // Double-guard in SQL: never update a row referenced by public.selections
      const upd = await client.query(
        `update public.titles as t
         set text = v.text, category = v.category
         from unnest($1::text[], $2::text[], $3::text[]) as v(id, text, category)
         where t.id = v.id
           and t.programme_id = $4
           and (t.text is distinct from v.text or t.category is distinct from v.category)
           and not exists (select 1 from public.selections s where s.title_id = t.id)`,
        [
          toUpdate.map((t) => t.id),
          toUpdate.map((t) => t.text),
          toUpdate.map((t) => t.category),
          programme.id,
        ]
      );
      totalUpdated += upd.rowCount || 0;
    }

    if (toInsert.length > 0) {
      const ins = await client.query(
        `insert into public.titles (id, code, text, category, programme_id, status, created_at)
         select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::timestamptz[])
         on conflict (id) do nothing`,
        [
          toInsert.map((t) => t.id),
          toInsert.map((t) => t.code),
          toInsert.map((t) => t.text),
          toInsert.map((t) => t.category),
          toInsert.map((t) => t.programmeId),
          toInsert.map((t) => t.status),
          toInsert.map((t) => t.createdAt),
        ]
      );
      totalInserted += ins.rowCount || 0;
    }

    await client.query(
      `update public.programmes
       set title_count = (select count(*)::int from public.titles where programme_id = $1 and status = 'active'),
           categories = $2::jsonb
       where id = $1`,
      [programme.id, JSON.stringify(programme.categories)]
    );
  }

  await client.query(`update public.portal_meta set version = version + 1, updated_at = now() where id = 'main'`);
  await client.query('commit');

  // Verify submitted selections are 100% unchanged
  const afterSelRes = await client.query(
    `select s.ref, s.status, s.title_id, t.code, t.text
     from public.selections s
     join public.titles t on t.id = s.title_id
     order by s.selected_at`
  );
  const unchanged =
    afterSelRes.rows.length === selRes.rows.length &&
    afterSelRes.rows.every(
      (r, idx) => r.title_id === selRes.rows[idx].title_id && r.text === selRes.rows[idx].text
    );

  const stats = await client.query(
    `select
       (select count(*)::int from public.titles) as total_titles,
       (select count(*)::int from public.titles where text like 'Case Study %') as remaining_case_study`
  );
  const sample = await client.query(
    `select code, text from public.titles
     where programme_id = 'p-btcba'
       and not exists (select 1 from public.selections s where s.title_id = titles.id)
     order by code limit 5`
  );

  console.log(`\nRefresh complete!`);
  console.log(`  Updated unselected titles: ${totalUpdated}`);
  console.log(`  Inserted new titles:       ${totalInserted}`);
  console.log(`  Total titles in Supabase:  ${stats.rows[0].total_titles}`);
  console.log(`  Remaining "Case Study" rows (only protected selections): ${stats.rows[0].remaining_case_study}`);
  console.log(`  All submitted selections untouched: ${unchanged}`);
  console.log(`\nSample refreshed BTCBA titles:`);
  sample.rows.forEach((r) => console.log(`  - ${r.code}: ${r.text}`));
} catch (err) {
  try {
    await client.query('rollback');
  } catch {
    /* ignore */
  }
  throw err;
} finally {
  await client.end();
}
