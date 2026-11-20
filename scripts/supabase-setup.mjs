/**
 * Creates the normalized Supabase schema and seeds all research titles.
 * Run with: npm run db:setup  (or npm run db:reset to replace existing data)
 *
 * The catalog starts with ZERO students, selections and audit entries.
 * Environment is loaded from .env.local by Node's --env-file flag in npm.
 */
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  throw new Error('Missing SUPABASE_DB_URL. Copy .env.example to .env.local and fill it in.');
}

const reset = process.argv.includes('--reset');
const { BASE_PROGRAMMES, baseTitles } = await import('../src/lib/db.js');
const { demoHash } = await import('../src/lib/utils.js');
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

async function batchInsertTitles(titles) {
  const size = 2000;
  for (let i = 0; i < titles.length; i += size) {
    const slice = titles.slice(i, i + size);
    await client.query(
      `insert into public.titles (id, code, text, category, programme_id, status, created_at)
       select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::timestamptz[])
       on conflict (id) do nothing`,
      [
        slice.map((t) => t.id),
        slice.map((t) => t.code),
        slice.map((t) => t.text),
        slice.map((t) => t.category),
        slice.map((t) => t.programmeId),
        slice.map((t) => t.status),
        slice.map((t) => t.createdAt),
      ]
    );
  }
}

try {
  await client.connect();

  const exists = await client.query("select to_regclass('public.titles') is not null as ok");
  if (exists.rows[0].ok && !reset) {
    const count = await client.query('select count(*)::int as n from public.titles');
    if (count.rows[0].n > 0) {
      console.log('Supabase already has seeded titles. Use npm run db:reset to replace them.');
      process.exitCode = 0;
      process.exit(0);
    }
  }

  await client.query(schema);
  await client.query('begin');

  await client.query(
    `insert into public.programmes (id, code, name, award, department, status, title_count, categories)
     select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::int[], $8::jsonb[])`,
    [
      BASE_PROGRAMMES.map((p) => p.id),
      BASE_PROGRAMMES.map((p) => p.code),
      BASE_PROGRAMMES.map((p) => p.name),
      BASE_PROGRAMMES.map((p) => p.award),
      BASE_PROGRAMMES.map((p) => p.department),
      BASE_PROGRAMMES.map((p) => p.status),
      BASE_PROGRAMMES.map((p) => p.titleCount),
      BASE_PROGRAMMES.map((p) => JSON.stringify(p.categories)),
    ]
  );

  let titleTotal = 0;
  for (const programme of BASE_PROGRAMMES) {
    const titles = baseTitles(programme.id);
    await batchInsertTitles(titles);
    titleTotal += titles.length;
  }

  const hash = demoHash('Report@2026');
  await client.query(
    `insert into public.admins (id, username, name, role, pw_hash, status)
     select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[])`,
    [
      ['adm-1', 'adm-2'],
      ['admin', 'controller'],
      ['Dr. M. Kessy', 'Registrar, Research Office'],
      ['Administrator', 'System administrator'],
      [hash, hash],
      ['active', 'active'],
    ]
  );

  await client.query('update public.counters set value = 0 where name = $1', ['ref']);
  await client.query('update public.portal_meta set version = 1, updated_at = now() where id = $1', ['main']);

  await client.query('commit');

  const check = await client.query(
    `select
       (select count(*) from public.programmes)::int as programmes,
       (select count(*) from public.titles)::int as titles,
       (select count(*) from public.students)::int as students,
       (select count(*) from public.selections)::int as selections,
       (select count(*) from public.audit_log)::int as audit`
  );

  const c = check.rows[0];
  console.log(
    `Supabase seeded: ${c.programmes} programmes, ${c.titles} titles, ` +
      `${c.students} students, ${c.selections} selections, ${c.audit} audit entries.`
  );
} catch (err) {
  try { await client.query('rollback'); } catch { /* no active transaction */ }
  throw err;
} finally {
  await client.end();
}
