/**
 * Non-destructive Supabase migration script.
 * Adds new columns, tables, and replaces all rs_* RPCs without touching
 * existing programmes, titles, students, selections, or audit entries.
 *
 * Run with: npm run db:migrate
 */
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  throw new Error('Missing SUPABASE_DB_URL in .env.local.');
}

const { DEFAULT_SITE_CONTENT } = await import('../src/lib/content.js');
const fullSchema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const marker = '-- === RS_FUNCTIONS_START ===';
const markerIdx = fullSchema.indexOf(marker);
if (markerIdx === -1) {
  throw new Error(`Could not locate ${marker} in supabase/schema.sql`);
}
const functionsSql = fullSchema.slice(markerIdx);

const ddlSql = `
alter table public.students
  add column if not exists supervisor_name text not null default '';

alter table public.selections
  add column if not exists edited_at timestamptz,
  add column if not exists edit_count integer not null default 0,
  add column if not exists previous_title_code text,
  add column if not exists previous_title_text text,
  add column if not exists edit_note text,
  add column if not exists edit_history jsonb not null default '[]'::jsonb;

create table if not exists public.package_orders (
  id text primary key,
  ref text not null unique,
  package_name text not null,
  price text not null,
  unit text not null default '',
  names text not null,
  reg_no text not null,
  phone text not null,
  supervisor_name text not null default '',
  institution text not null default '',
  programme text not null,
  title text not null default '',
  selection_ref text not null default '',
  notes text not null default '',
  status text not null default 'pending',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_orders_status_idx on public.package_orders(status);
create index if not exists package_orders_created_idx on public.package_orders(created_at desc);

alter table public.package_orders enable row level security;
revoke all on public.package_orders from anon, authenticated;

insert into public.counters(name, value) values ('order_ref', 0)
on conflict (name) do nothing;

drop function if exists public.rs_student_json(text, text, text, text, text, timestamptz, timestamptz) cascade;
`;

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

try {
  await client.connect();
  await client.query('begin');
  await client.query(ddlSql);
  await client.query(functionsSql);

  await client.query(
    `insert into public.site_content (key, data, updated_at)
     values ('pricing', $1::jsonb, now())
     on conflict (key) do update set data = excluded.data, updated_at = now()`,
    [JSON.stringify(DEFAULT_SITE_CONTENT.pricing)]
  );

  await client.query('commit');

  const check = await client.query(
    `select
       (select count(*) from public.programmes)::int as programmes,
       (select count(*) from public.titles)::int as titles,
       (select count(*) from public.students)::int as students,
       (select count(*) from public.selections)::int as selections,
       (select count(*) from public.package_orders)::int as orders,
       (select count(*) from public.audit_log)::int as audit`
  );
  const c = check.rows[0];
  console.log(
    `Supabase migrated cleanly: ${c.programmes} programmes, ${c.titles} titles, ` +
      `${c.students} students, ${c.selections} selections, ${c.orders} orders, ${c.audit} audit entries.`
  );
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
