-- Report Safi portal schema for Supabase Postgres.
-- Run with: npm run db:setup

/* ------------------------------------------------------------------ */
/* Reset objects owned by this project                                 */
/* ------------------------------------------------------------------ */

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'rs_%'
  loop
    execute format('drop function if exists %s cascade', r.sig);
  end loop;
end $$;

drop view if exists public.portal_state_public cascade;
drop table if exists public.portal_state cascade;
drop table if exists public.package_orders cascade;
drop table if exists public.selections cascade;
drop table if exists public.students cascade;
drop table if exists public.titles cascade;
drop table if exists public.programmes cascade;
drop table if exists public.audit_log cascade;
drop table if exists public.admins cascade;
drop table if exists public.counters cascade;
drop table if exists public.portal_meta cascade;
drop table if exists public.site_content cascade;

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

create table public.programmes (
  id text primary key,
  code text not null unique,
  name text not null,
  award text not null default '—',
  department text not null default '—',
  status text not null default 'active',
  title_count integer not null default 0,
  categories jsonb not null default '[]'::jsonb
);

create table public.titles (
  id text primary key,
  code text not null,
  text text not null,
  category text not null default 'General',
  programme_id text not null references public.programmes(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (programme_id, text)
);

create index titles_programme_idx on public.titles(programme_id);
create index titles_status_idx on public.titles(status);
create index titles_code_idx on public.titles(code);

create table public.students (
  id text primary key,
  reg_no text not null unique,
  names text not null,
  phone text not null,
  supervisor_name text not null default '',
  programme_id text not null references public.programmes(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_programme_idx on public.students(programme_id);

create table public.selections (
  id text primary key,
  ref text not null unique,
  student_id text not null references public.students(id),
  title_id text not null references public.titles(id),
  status text not null default 'active',
  selected_at timestamptz not null default now(),
  released_at timestamptz,
  release_reason text,
  released_by text,
  edited_at timestamptz,
  edit_count integer not null default 0,
  previous_title_code text,
  previous_title_text text,
  edit_note text,
  edit_history jsonb not null default '[]'::jsonb
);

-- BR-01/BR-09 and BR-02/BR-04 are also enforced by the database.
create unique index one_active_selection_per_student
on public.selections(student_id) where status = 'active';
create unique index one_active_selection_per_title
on public.selections(title_id) where status = 'active';
create index selections_status_idx on public.selections(status);

create table public.package_orders (
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

create index package_orders_status_idx on public.package_orders(status);
create index package_orders_created_idx on public.package_orders(created_at desc);

create table public.audit_log (
  id text primary key,
  at timestamptz not null default now(),
  actor text not null,
  role text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  summary text not null,
  reason text not null default '—',
  before_value text not null default '—',
  after_value text not null default '—'
);

create index audit_at_idx on public.audit_log(at desc);

create table public.admins (
  id text primary key,
  username text not null unique,
  name text not null,
  role text not null,
  pw_hash text not null,
  status text not null default 'active'
);

create table public.counters (
  name text primary key,
  value integer not null default 0
);

insert into public.counters(name, value) values ('ref', 0), ('order_ref', 0)
on conflict (name) do nothing;

create table public.portal_meta (
  id text primary key,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.portal_meta(id, version) values ('main', 1)
on conflict (id) do nothing;

-- Editable site copy (pricing, institutions, contact, rules, FAQ, academic year).
create table public.site_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.programmes enable row level security;
alter table public.titles enable row level security;
alter table public.students enable row level security;
alter table public.selections enable row level security;
alter table public.package_orders enable row level security;
alter table public.audit_log enable row level security;
alter table public.admins enable row level security;
alter table public.counters enable row level security;
alter table public.portal_meta enable row level security;
alter table public.site_content enable row level security;

-- No direct table access: the browser only calls the SECURITY DEFINER functions below.
revoke all on public.programmes, public.titles, public.students, public.selections,
  public.package_orders, public.audit_log, public.admins, public.counters,
  public.portal_meta, public.site_content
from anon, authenticated;

-- === RS_FUNCTIONS_START ===
/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

create or replace function public.rs_now()
returns text language sql stable
as $$ select to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') $$;

create or replace function public.rs_fail(p_code text, p_message text)
returns void language plpgsql
as $$
begin
  raise exception using message = 'RS|' || p_code || '|' || p_message;
end;
$$;

create or replace function public.rs_clean(p text)
returns text language sql immutable
as $$ select btrim(regexp_replace(coalesce(p, ''), '\s+', ' ', 'g')) $$;

create or replace function public.rs_touch()
returns void language sql
as $$ update public.portal_meta set version = version + 1, updated_at = now() where id = 'main' $$;

create or replace function public.rs_audit_insert(
  p_actor text, p_role text, p_action text, p_entity text, p_entity_id text,
  p_summary text, p_reason text default '—', p_before text default '—', p_after text default '—'
)
returns void language sql
as $$
  insert into public.audit_log
    (id, at, actor, role, action, entity, entity_id, summary, reason, before_value, after_value)
  values
    ('aud-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
     now(), p_actor, p_role, p_action, p_entity, p_entity_id, p_summary,
     coalesce(p_reason, '—'), coalesce(p_before, '—'), coalesce(p_after, '—'));
$$;

create or replace function public.rs_require_actor(p_payload jsonb)
returns jsonb language plpgsql stable
as $$
declare
  v jsonb := coalesce(p_payload->'actor', '{}'::jsonb);
begin
  if coalesce(v->>'name', '') = '' then
    perform public.rs_fail('unauthorised', 'Sign in to perform this action.');
  end if;
  return v;
end;
$$;

create or replace function public.rs_next_ref()
returns text language plpgsql
as $$
declare
  v integer;
begin
  update public.counters set value = value + 1 where name = 'ref' returning value into v;
  return 'RS-TS-' || to_char(now(), 'YYYY') || '-' || lpad(v::text, 5, '0');
end;
$$;

create or replace function public.rs_next_order_ref()
returns text language plpgsql
as $$
declare
  v integer;
begin
  insert into public.counters(name, value) values ('order_ref', 0) on conflict (name) do nothing;
  update public.counters set value = value + 1 where name = 'order_ref' returning value into v;
  return 'RS-ORD-' || to_char(now(), 'YYYY') || '-' || lpad(v::text, 5, '0');
end;
$$;

create or replace function public.rs_programme_json(
  p_id text, p_code text, p_name text, p_award text, p_department text,
  p_status text, p_title_count integer, p_categories jsonb
)
returns jsonb language sql immutable
as $$
  select jsonb_build_object(
    'id', p_id, 'code', p_code, 'name', p_name, 'award', p_award,
    'department', p_department, 'status', p_status,
    'titleCount', p_title_count, 'categories', coalesce(p_categories, '[]'::jsonb)
  );
$$;

create or replace function public.rs_title_json(
  p_id text, p_code text, p_text text, p_category text, p_programme_id text,
  p_status text, p_created_at timestamptz, p_available boolean default null,
  p_programme jsonb default null
)
returns jsonb language sql immutable
as $$
  select jsonb_build_object(
    'id', p_id, 'code', p_code, 'text', p_text, 'category', p_category,
    'programmeId', p_programme_id, 'status', p_status,
    'createdAt', to_jsonb(p_created_at), 'available', p_available,
    'programme', p_programme
  );
$$;

create or replace function public.rs_student_json(
  p_id text, p_reg_no text, p_names text, p_phone text, p_programme_id text,
  p_created_at timestamptz, p_updated_at timestamptz, p_supervisor_name text default ''
)
returns jsonb language sql immutable
as $$
  select jsonb_build_object(
    'id', p_id, 'regNo', p_reg_no, 'names', p_names, 'phone', p_phone,
    'supervisorName', coalesce(p_supervisor_name, ''),
    'programmeId', p_programme_id,
    'createdAt', to_jsonb(p_created_at), 'updatedAt', to_jsonb(p_updated_at)
  );
$$;

create or replace function public.rs_order_json(p_order public.package_orders)
returns jsonb language sql immutable
as $$
  select jsonb_build_object(
    'id', p_order.id,
    'ref', p_order.ref,
    'packageName', p_order.package_name,
    'price', p_order.price,
    'unit', p_order.unit,
    'names', p_order.names,
    'regNo', p_order.reg_no,
    'phone', p_order.phone,
    'supervisorName', coalesce(p_order.supervisor_name, ''),
    'institution', coalesce(p_order.institution, ''),
    'programme', p_order.programme,
    'title', coalesce(p_order.title, ''),
    'selectionRef', coalesce(p_order.selection_ref, ''),
    'notes', coalesce(p_order.notes, ''),
    'status', p_order.status,
    'adminNotes', coalesce(p_order.admin_notes, ''),
    'createdAt', to_jsonb(p_order.created_at),
    'updatedAt', to_jsonb(p_order.updated_at)
  );
$$;

create or replace function public.rs_audit_json(
  p_id text, p_at timestamptz, p_actor text, p_role text, p_action text,
  p_entity text, p_entity_id text, p_summary text, p_reason text,
  p_before text, p_after text
)
returns jsonb language sql immutable
as $$
  select jsonb_build_object(
    'id', p_id, 'at', to_jsonb(p_at), 'actor', p_actor, 'role', p_role,
    'action', p_action, 'entity', p_entity, 'entityId', p_entity_id,
    'summary', p_summary, 'reason', p_reason,
    'before', p_before, 'after', p_after
  );
$$;

create or replace function public.rs_selection_json(p_selection_id text)
returns jsonb language sql stable
as $$
  select jsonb_build_object(
    'id', s.id, 'ref', s.ref,
    'studentId', s.student_id, 'titleId', s.title_id, 'status', s.status,
    'selectedAt', to_jsonb(s.selected_at), 'releasedAt', to_jsonb(s.released_at),
    'releaseReason', s.release_reason, 'releasedBy', s.released_by,
    'editedAt', to_jsonb(s.edited_at),
    'editCount', coalesce(s.edit_count, 0),
    'previousTitleCode', s.previous_title_code,
    'previousTitleText', s.previous_title_text,
    'editNote', s.edit_note,
    'editHistory', coalesce(s.edit_history, '[]'::jsonb),
    'title', case when t.id is null then null else public.rs_title_json(
      t.id, t.code, t.text, t.category, t.programme_id, t.status, t.created_at, false, null
    ) end,
    'student', case when st.id is null then null else public.rs_student_json(
      st.id, st.reg_no, st.names, st.phone, st.programme_id, st.created_at, st.updated_at, st.supervisor_name
    ) end,
    'programme', case when p.id is null then null else public.rs_programme_json(
      p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
    ) end
  )
  from public.selections s
  left join public.titles t on t.id = s.title_id
  left join public.students st on st.id = s.student_id
  left join public.programmes p on p.id = st.programme_id
  where s.id = p_selection_id;
$$;

/* ------------------------------------------------------------------ */
/* Public reads                                                        */
/* ------------------------------------------------------------------ */

create or replace function public.rs_public_stats()
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_programmes int; v_titles int; v_completed int; v_today int;
begin
  select count(*) into v_programmes from programmes where status = 'active';
  select count(*) into v_titles
  from titles t join programmes p on p.id = t.programme_id
  where t.status = 'active' and p.status = 'active';
  select count(*) into v_completed from selections where status = 'active';
  select count(*) into v_today
  from selections where status = 'active' and selected_at::date = current_date;

  return jsonb_build_object(
    'programmes', v_programmes,
    'titles', v_titles,
    'available', v_titles - v_completed,
    'unavailable', v_completed,
    'completed', v_completed,
    'today', v_today
  );
end;
$$;

create or replace function public.rs_site_content()
returns jsonb language sql security definer set search_path = public, pg_temp
as $$ select coalesce(jsonb_object_agg(key, data), '{}'::jsonb) from site_content $$;

create or replace function public.rs_programmes(p_include_inactive boolean default false)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v jsonb;
begin
  select coalesce(jsonb_agg(rs_programme_json(
    p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
  ) order by p.code), '[]'::jsonb)
  into v
  from programmes p
  where p_include_inactive or p.status = 'active';
  return v;
end;
$$;

create or replace function public.rs_programme(p_programme_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v jsonb;
begin
  select rs_programme_json(
    p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
  ) into v
  from programmes p where p.id = p_programme_id;
  return v;
end;
$$;

create or replace function public.rs_programme_titles(p_programme_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v jsonb;
begin
  select coalesce(jsonb_agg(rs_title_json(
    t.id, t.code, t.text, t.category, t.programme_id, t.status, t.created_at
  ) order by t.code), '[]'::jsonb)
  into v
  from titles t where t.programme_id = p_programme_id;
  return v;
end;
$$;

create or replace function public.rs_catalogue(
  p_programme_id text,
  p_q text default '',
  p_status text default 'all',
  p_sort text default 'az',
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_total int; v_available int; v_unavailable int;
  v_pages int; v_current int; v_start int; v_rows jsonb;
begin
  with base as (
    select t.*, (s.id is null) as available
    from titles t
    join programmes pr on pr.id = t.programme_id and pr.status = 'active'
    left join selections s on s.title_id = t.id and s.status = 'active'
    where t.status = 'active'
      and t.programme_id = p_programme_id
      and (coalesce(p_q, '') = '' or t.text ilike '%' || p_q || '%'
           or t.code ilike '%' || p_q || '%' or t.category ilike '%' || p_q || '%')
  )
  select count(*), count(*) filter (where available), count(*) filter (where not available)
  into v_total, v_available, v_unavailable
  from base;

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with base as (
    select t.*, (s.id is null) as available
    from titles t
    join programmes pr on pr.id = t.programme_id and pr.status = 'active'
    left join selections s on s.title_id = t.id and s.status = 'active'
    where t.status = 'active'
      and t.programme_id = p_programme_id
      and (coalesce(p_q, '') = '' or t.text ilike '%' || p_q || '%'
           or t.code ilike '%' || p_q || '%' or t.category ilike '%' || p_q || '%')
  ), filtered as (
    select * from base
    where p_status = 'all'
       or (p_status = 'available' and available)
       or (p_status = 'unavailable' and not available)
  ), ordered as (
    select * from filtered
    order by
      case p_sort when 'za' then text end desc nulls last,
      case when p_sort is null or p_sort not in ('za', 'new', 'old') then text end asc nulls last,
      case p_sort when 'new' then created_at end desc nulls last,
      case p_sort when 'old' then created_at end asc nulls last,
      id
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(rs_title_json(
    o.id, o.code, o.text, o.category, o.programme_id, o.status, o.created_at, o.available, null
  )), '[]'::jsonb)
  into v_rows
  from ordered o;

  return jsonb_build_object(
    'rows', v_rows,
    'total', v_total,
    'page', v_current,
    'totalPages', v_pages,
    'available', v_available,
    'unavailable', v_unavailable,
    'catalogueTotal', v_available + v_unavailable,
    'from', case when v_total = 0 then 0 else v_start + 1 end,
    'to', least(v_start + p_page_size, v_total)
  );
end;
$$;

create or replace function public.rs_title(p_title_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v jsonb;
begin
  select rs_title_json(
    t.id, t.code, t.text, t.category, t.programme_id, t.status, t.created_at,
    not exists (select 1 from selections s where s.title_id = t.id and s.status = 'active'),
    case when p.id is null then null else rs_programme_json(
      p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
    ) end
  )
  into v
  from titles t left join programmes p on p.id = t.programme_id
  where t.id = p_title_id;
  return v;
end;
$$;

create or replace function public.rs_selection_for_student(p_student_id text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_id text;
begin
  select id into v_id from selections
  where student_id = p_student_id and status = 'active' limit 1;
  if v_id is null then return null; end if;
  return rs_selection_json(v_id);
end;
$$;

create or replace function public.rs_selection_by_ref(p_ref text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_id text;
begin
  select id into v_id from selections
  where upper(ref) = upper(coalesce(p_ref, '')) limit 1;
  if v_id is null then return null; end if;
  return rs_selection_json(v_id);
end;
$$;

/* ------------------------------------------------------------------ */
/* Student mutations                                                   */
/* ------------------------------------------------------------------ */

create or replace function public.rs_identify(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_reg text := upper(regexp_replace(coalesce(p_payload->>'regNo', ''), '\s+', '', 'g'));
  v_names text := rs_clean(p_payload->>'names');
  v_phone text := coalesce(p_payload->>'phone', '');
  v_supervisor text := rs_clean(p_payload->>'supervisorName');
  v_programme_id text := p_payload->>'programmeId';
  v_student_id text;
  v_selection_id text;
  v_student students%rowtype;
begin
  if length(v_reg) < 5 then
    perform rs_fail('validation', 'Enter a valid registration number.');
  end if;
  if coalesce(array_length(string_to_array(v_names, ' '), 1), 0) < 2 then
    perform rs_fail('validation', 'Enter your full names (at least two parts).');
  end if;
  if v_phone = '' then
    perform rs_fail('validation', 'Enter a valid Tanzanian mobile number.');
  end if;

  if not exists (select 1 from programmes where id = v_programme_id and status = 'active') then
    perform rs_fail('not_found', 'That programme is not open for selection.');
  end if;

  select id into v_student_id from students where upper(reg_no) = v_reg;

  if v_student_id is null then
    v_student_id := coalesce(p_payload->>'studentId', 'stu-' || substr(md5(random()::text), 1, 10));
    insert into students(id, reg_no, names, phone, supervisor_name, programme_id, created_at, updated_at)
    values (v_student_id, v_reg, v_names, v_phone, v_supervisor, v_programme_id, now(), now());
  else
    select id into v_selection_id from selections
    where student_id = v_student_id and status = 'active' limit 1;

    update students
    set names = v_names,
        phone = v_phone,
        supervisor_name = case when v_supervisor <> '' then v_supervisor else supervisor_name end,
        updated_at = now(),
        programme_id = case when v_selection_id is null then v_programme_id else programme_id end
    where id = v_student_id;
  end if;

  select * into v_student from students where id = v_student_id;
  perform rs_touch();

  return jsonb_build_object(
    'student', rs_student_json(
      v_student.id, v_student.reg_no, v_student.names, v_student.phone,
      v_student.programme_id, v_student.created_at, v_student.updated_at,
      v_student.supervisor_name
    ),
    'programme', (select rs_programme_json(
      p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
    ) from programmes p where p.id = v_student.programme_id),
    'existingSelection', case when v_selection_id is null then null else rs_selection_json(v_selection_id) end,
    'verified', false
  );
end;
$$;

create or replace function public.rs_reserve(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_student students%rowtype;
  v_title titles%rowtype;
  v_selection_id text := coalesce(p_payload->>'selectionId', 'sel-' || substr(md5(random()::text), 1, 10));
  v_ref text;
  v_existing text;
begin
  select * into v_student from students where id = p_payload->>'studentId';
  if not found then
    perform rs_fail('unauthorised', 'Your session expired. Please identify yourself again.');
  end if;

  select id into v_existing from selections
  where student_id = v_student.id and status = 'active' limit 1;
  if v_existing is not null then
    perform rs_fail('already_selected',
      'You already hold title ' || coalesce((select code from titles where id = (
        select title_id from selections where id = v_existing
      )), '') || '. Only one selection is allowed — an administrator can release it.');
  end if;

  select * into v_title from titles where id = p_payload->>'titleId';
  if not found then perform rs_fail('not_found', 'That title no longer exists.'); end if;
  if v_title.status <> 'active' then
    perform rs_fail('inactive', 'That title has been withdrawn from the catalogue.');
  end if;
  if v_title.programme_id <> v_student.programme_id then
    perform rs_fail('wrong_programme', 'You may only select titles from your own programme.');
  end if;
  if exists (select 1 from selections where title_id = v_title.id and status = 'active') then
    perform rs_fail('unavailable', 'This title has just been taken by another student.');
  end if;

  v_ref := rs_next_ref();

  begin
    insert into selections(id, ref, student_id, title_id, status, selected_at)
    values (v_selection_id, v_ref, v_student.id, v_title.id, 'active', now());
  exception when unique_violation then
    if exists (select 1 from selections where student_id = v_student.id and status = 'active') then
      perform rs_fail('already_selected', 'You already hold a title. An administrator can release it.');
    else
      perform rs_fail('unavailable', 'This title has just been taken by another student.');
    end if;
  end;

  perform rs_audit_insert(
    v_student.names, 'Student', 'selection.create', 'Selection', v_ref,
    v_student.reg_no || ' reserved ' || v_title.code, '—', 'available', 'unavailable'
  );
  perform rs_touch();
  return rs_selection_json(v_selection_id);
end;
$$;

create or replace function public.rs_update_selection_details(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_ref text := upper(btrim(coalesce(p_payload->>'ref', '')));
  v_names text := rs_clean(p_payload->>'names');
  v_phone text := coalesce(p_payload->>'phone', '');
  v_supervisor text := rs_clean(p_payload->>'supervisorName');
  v_reason text := coalesce(nullif(rs_clean(p_payload->>'reason'), ''), 'Student updated details using reference number');
  v_sel selections%rowtype;
  v_student students%rowtype;
  v_before text;
  v_after text;
  v_entry jsonb;
begin
  if v_ref = '' then perform rs_fail('validation', 'Enter your selection reference number.'); end if;
  if coalesce(array_length(string_to_array(v_names, ' '), 1), 0) < 2 then
    perform rs_fail('validation', 'Enter your full names (at least two parts).');
  end if;
  if v_phone = '' then
    perform rs_fail('validation', 'Enter a valid Tanzanian mobile number.');
  end if;

  select * into v_sel from selections where upper(ref) = v_ref limit 1;
  if not found then perform rs_fail('not_found', 'No selection matches that reference number.'); end if;
  if v_sel.status <> 'active' then
    perform rs_fail('conflict', 'Only an active selection can be edited with its reference number.');
  end if;

  select * into v_student from students where id = v_sel.student_id;
  if not found then perform rs_fail('not_found', 'Student record not found.'); end if;

  v_before := v_student.names || ' · ' || v_student.phone ||
    case when coalesce(v_student.supervisor_name, '') <> '' then ' · Sup: ' || v_student.supervisor_name else '' end;
  v_after := v_names || ' · ' || v_phone ||
    case when v_supervisor <> '' then ' · Sup: ' || v_supervisor else '' end;

  update students set
    names = v_names,
    phone = v_phone,
    supervisor_name = v_supervisor,
    updated_at = now()
  where id = v_student.id;

  v_entry := jsonb_build_object(
    'at', rs_now(),
    'type', 'details_edit',
    'summary', 'Updated student details',
    'before', v_before,
    'after', v_after,
    'reason', v_reason
  );

  update selections set
    edited_at = now(),
    edit_count = coalesce(edit_count, 0) + 1,
    edit_note = v_reason,
    edit_history = coalesce(edit_history, '[]'::jsonb) || jsonb_build_array(v_entry)
  where id = v_sel.id;

  perform rs_audit_insert(
    v_names, 'Student', 'selection.edit_details', 'Selection', v_sel.ref,
    v_student.reg_no || ' updated details via ' || v_sel.ref,
    v_reason, v_before, v_after
  );
  perform rs_touch();
  return rs_selection_json(v_sel.id);
end;
$$;

create or replace function public.rs_change_selection_title(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_ref text := upper(btrim(coalesce(p_payload->>'ref', '')));
  v_new_title_id text := coalesce(p_payload->>'newTitleId', '');
  v_reason text := coalesce(nullif(rs_clean(p_payload->>'reason'), ''), 'Student changed title using reference number');
  v_sel selections%rowtype;
  v_student students%rowtype;
  v_old_title titles%rowtype;
  v_new_title titles%rowtype;
  v_entry jsonb;
begin
  if v_ref = '' then perform rs_fail('validation', 'Reference number is required to change your title.'); end if;
  select * into v_sel from selections where upper(ref) = v_ref limit 1;
  if not found then perform rs_fail('not_found', 'No selection matches that reference number.'); end if;
  if v_sel.status <> 'active' then
    perform rs_fail('conflict', 'Only an active selection can change title.');
  end if;

  select * into v_student from students where id = v_sel.student_id;
  select * into v_old_title from titles where id = v_sel.title_id;
  select * into v_new_title from titles where id = v_new_title_id;

  if v_new_title.id is null then perform rs_fail('not_found', 'That title no longer exists.'); end if;
  if v_new_title.status <> 'active' then
    perform rs_fail('inactive', 'That title has been withdrawn from the catalogue.');
  end if;
  if v_new_title.programme_id <> v_student.programme_id then
    perform rs_fail('wrong_programme', 'You may only select titles from your own programme.');
  end if;
  if v_new_title.id = v_sel.title_id then
    perform rs_fail('validation', 'You already hold that title — choose a different available title.');
  end if;
  if exists (select 1 from selections where title_id = v_new_title.id and status = 'active') then
    perform rs_fail('unavailable', 'This title has just been taken by another student.');
  end if;

  v_entry := jsonb_build_object(
    'at', rs_now(),
    'type', 'title_change',
    'summary', 'Changed title from ' || coalesce(v_old_title.code, '—') || ' to ' || v_new_title.code,
    'before', coalesce(v_old_title.code, '—') || ' — ' || coalesce(v_old_title.text, '—'),
    'after', v_new_title.code || ' — ' || v_new_title.text,
    'reason', v_reason
  );

  begin
    update selections set
      title_id = v_new_title.id,
      previous_title_code = v_old_title.code,
      previous_title_text = v_old_title.text,
      edited_at = now(),
      edit_count = coalesce(edit_count, 0) + 1,
      edit_note = v_reason,
      edit_history = coalesce(edit_history, '[]'::jsonb) || jsonb_build_array(v_entry)
    where id = v_sel.id;
  exception when unique_violation then
    perform rs_fail('unavailable', 'This title has just been taken by another student.');
  end;

  perform rs_audit_insert(
    v_student.names, 'Student', 'selection.change_title', 'Selection', v_sel.ref,
    v_student.reg_no || ' changed title via ' || v_sel.ref || ' (' || coalesce(v_old_title.code, '—') || ' → ' || v_new_title.code || ')',
    v_reason,
    coalesce(v_old_title.code, '—') || ' — ' || left(coalesce(v_old_title.text, ''), 60),
    v_new_title.code || ' — ' || left(v_new_title.text, 60)
  );
  perform rs_touch();
  return rs_selection_json(v_sel.id);
end;
$$;

create or replace function public.rs_create_order(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_id text := coalesce(p_payload->>'id', 'ord-' || substr(md5(random()::text || clock_timestamp()::text), 1, 10));
  v_ref text;
  v_pkg text := rs_clean(p_payload->>'packageName');
  v_price text := rs_clean(p_payload->>'price');
  v_unit text := rs_clean(p_payload->>'unit');
  v_names text := rs_clean(p_payload->>'names');
  v_reg text := upper(regexp_replace(coalesce(p_payload->>'regNo', ''), '\s+', '', 'g'));
  v_phone text := rs_clean(p_payload->>'phone');
  v_supervisor text := rs_clean(p_payload->>'supervisorName');
  v_institution text := rs_clean(p_payload->>'institution');
  v_programme text := rs_clean(p_payload->>'programme');
  v_title text := rs_clean(p_payload->>'title');
  v_sel_ref text := upper(btrim(coalesce(p_payload->>'selectionRef', '')));
  v_notes text := rs_clean(p_payload->>'notes');
  v_row public.package_orders%rowtype;
begin
  if v_pkg = '' then perform rs_fail('validation', 'Select a package.'); end if;
  if coalesce(array_length(string_to_array(v_names, ' '), 1), 0) < 2 then
    perform rs_fail('validation', 'Enter your full names.');
  end if;
  if length(v_reg) < 5 then perform rs_fail('validation', 'Enter your real college registration number.'); end if;
  if v_phone = '' then perform rs_fail('validation', 'Enter your active phone number.'); end if;
  if length(v_programme) < 2 then perform rs_fail('validation', 'Enter your programme / course.'); end if;

  v_ref := rs_next_order_ref();

  insert into public.package_orders (
    id, ref, package_name, price, unit, names, reg_no, phone, supervisor_name,
    institution, programme, title, selection_ref, notes, status, admin_notes, created_at, updated_at
  ) values (
    v_id, v_ref, v_pkg, v_price, v_unit, v_names, v_reg, v_phone, v_supervisor,
    v_institution, v_programme, v_title, v_sel_ref, v_notes, 'pending', '', now(), now()
  ) returning * into v_row;

  perform rs_audit_insert(
    v_names, 'Student', 'order.create', 'Package order', v_ref,
    v_reg || ' ordered ' || v_pkg || ' (' || v_price || ')',
    '—', '—', 'pending'
  );
  perform rs_touch();
  return rs_order_json(v_row);
end;
$$;

/* ------------------------------------------------------------------ */
/* Admin reads                                                         */
/* ------------------------------------------------------------------ */

create or replace function public.rs_admin_login(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_username text := lower(coalesce(p_payload->>'username', ''));
  v_admin admins%rowtype;
begin
  select * into v_admin from admins where lower(username) = v_username;

  if not found or v_admin.status <> 'active'
     or v_admin.pw_hash is distinct from coalesce(p_payload->>'pwHash', '') then
    perform rs_audit_insert(
      case when v_username = '' then 'unknown' else v_username end,
      'Unauthenticated', 'auth.failed', 'Administrator account',
      case when v_username = '' then '—' else v_username end,
      'Failed sign-in attempt'
    );
    perform rs_touch();
    return jsonb_build_object('ok', false, 'error', 'unauthorised');
  end if;

  perform rs_audit_insert(v_admin.name, v_admin.role, 'auth.login',
    'Administrator account', v_admin.username, 'Signed in to the admin workspace');
  perform rs_touch();
  return jsonb_build_object('ok', true, 'admin', jsonb_build_object(
    'id', v_admin.id, 'username', v_admin.username,
    'name', v_admin.name, 'role', v_admin.role
  ));
end;
$$;

create or replace function public.rs_list_programmes_admin()
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v jsonb;
begin
  select coalesce(jsonb_agg(item order by item->>'code'), '[]'::jsonb)
  into v
  from (
    select rs_programme_json(
      p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
    ) || jsonb_build_object(
      'titleCount', count(t.id) filter (where t.status = 'active'),
      'available', count(t.id) filter (where t.status = 'active' and s.id is null),
      'unavailable', count(t.id) filter (where t.status = 'active' and s.id is not null)
    ) as item
    from programmes p
    left join titles t on t.programme_id = p.id
    left join selections s on s.title_id = t.id and s.status = 'active'
    group by p.id
  ) x;
  return v;
end;
$$;

create or replace function public.rs_admin_stats()
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_per jsonb; v_recent jsonb; v_audit jsonb; v_recent_orders jsonb;
  v_programmes int; v_active_programmes int; v_titles int;
  v_taken int; v_students int; v_active int; v_released int; v_today int;
  v_edited int; v_orders int; v_pending_orders int;
begin
  select count(*) into v_programmes from programmes;
  select count(*) into v_active_programmes from programmes where status = 'active';
  select count(*) into v_titles from titles where status = 'active';
  select count(*) into v_taken from selections where status = 'active';
  select count(*) into v_students from students;
  select count(*) into v_active from selections where status = 'active';
  select count(*) into v_released from selections where status = 'released';
  select count(*) into v_edited from selections where coalesce(edit_count, 0) > 0;
  select count(*) into v_orders from package_orders;
  select count(*) into v_pending_orders from package_orders where status = 'pending';
  select count(*) into v_today
  from selections where status = 'active' and selected_at::date = current_date;

  select coalesce(jsonb_agg(item order by item->>'code'), '[]'::jsonb)
  into v_per
  from (
    select jsonb_build_object(
      'id', p.id, 'code', p.code, 'name', p.name,
      'total', count(t.id) filter (where t.status = 'active'),
      'available', count(t.id) filter (where t.status = 'active' and s.id is null),
      'unavailable', count(t.id) filter (where t.status = 'active' and s.id is not null)
    ) as item
    from programmes p
    left join titles t on t.programme_id = p.id
    left join selections s on s.title_id = t.id and s.status = 'active'
    group by p.id
  ) x;

  select coalesce(jsonb_agg(rs_selection_json(s.id) order by coalesce(s.edited_at, s.selected_at) desc), '[]'::jsonb)
  into v_recent
  from (select id, selected_at, edited_at from selections order by coalesce(edited_at, selected_at) desc limit 6) s;

  select coalesce(jsonb_agg(rs_order_json(o) order by o.created_at desc), '[]'::jsonb)
  into v_recent_orders
  from (select * from package_orders order by created_at desc limit 6) o;

  select coalesce(jsonb_agg(rs_audit_json(
    a.id, a.at, a.actor, a.role, a.action, a.entity, a.entity_id,
    a.summary, a.reason, a.before_value, a.after_value
  ) order by a.at desc), '[]'::jsonb)
  into v_audit
  from (select * from audit_log order by at desc limit 6) a;

  return jsonb_build_object(
    'programmes', v_programmes,
    'activeProgrammes', v_active_programmes,
    'titles', v_titles,
    'available', v_titles - v_taken,
    'unavailable', v_taken,
    'students', v_students,
    'selections', v_active,
    'released', v_released,
    'editedSelections', v_edited,
    'orders', v_orders,
    'pendingOrders', v_pending_orders,
    'today', v_today,
    'perProgramme', v_per,
    'recent', v_recent,
    'recentOrders', v_recent_orders,
    'audit', v_audit
  );
end;
$$;

/* ------------------------------------------------------------------ */
/* Admin mutations                                                     */
/* ------------------------------------------------------------------ */

create or replace function public.rs_create_programme(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_code text := upper(btrim(coalesce(p_payload->>'code', '')));
  v_name text := rs_clean(p_payload->>'name');
  v_id text := coalesce(p_payload->>'id', 'p-' || substr(md5(random()::text), 1, 10));
begin
  if length(v_code) < 2 then perform rs_fail('validation', 'Programme code is required (2+ characters).'); end if;
  if length(v_name) < 4 then perform rs_fail('validation', 'Programme name is required.'); end if;
  if exists (select 1 from programmes where code = v_code) then
    perform rs_fail('conflict', 'Programme code ' || v_code || ' already exists.');
  end if;

  insert into programmes(id, code, name, award, department, status, title_count, categories)
  values (v_id, v_code, v_name,
    coalesce(nullif(rs_clean(p_payload->>'award'), ''), '—'),
    coalesce(nullif(rs_clean(p_payload->>'department'), ''), '—'),
    'active', 0, '[]'::jsonb);

  perform rs_audit_insert(v_actor->>'name', v_actor->>'role', 'programme.create',
    'Programme', v_code, 'Created programme ' || v_code,
    coalesce(p_payload->>'reason', '—'), '—', v_name);
  perform rs_touch();
  return (select rs_programme_json(id, code, name, award, department, status, title_count, categories)
          from programmes where id = v_id);
end;
$$;

create or replace function public.rs_update_programme(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_id text := p_payload->>'id';
  v_patch jsonb := coalesce(p_payload->'patch', '{}'::jsonb);
  v_row programmes%rowtype;
  v_code text; v_name text; v_status text;
begin
  select * into v_row from programmes where id = v_id;
  if not found then perform rs_fail('not_found', 'Programme not found.'); end if;

  v_code := coalesce(v_patch->>'code', v_row.code);
  v_name := coalesce(v_patch->>'name', v_row.name);
  v_status := coalesce(v_patch->>'status', v_row.status);

  update programmes set
    code = v_code, name = v_name, status = v_status,
    award = case when v_patch ? 'award' then coalesce(v_patch->>'award', '—') else award end,
    department = case when v_patch ? 'department' then coalesce(v_patch->>'department', '—') else department end
  where id = v_id;

  perform rs_audit_insert(v_actor->>'name', v_actor->>'role', 'programme.update',
    'Programme', v_code, 'Updated programme ' || v_code,
    coalesce(p_payload->>'reason', '—'), v_row.name || ' · ' || v_row.status, v_name || ' · ' || v_status);
  perform rs_touch();
  return (select rs_programme_json(id, code, name, award, department, status, title_count, categories)
          from programmes where id = v_id);
end;
$$;

create or replace function public.rs_add_title(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_programme programmes%rowtype;
  v_text text := rs_clean(p_payload->>'text');
  v_id text := coalesce(p_payload->>'id', 't-ADD-' || substr(md5(random()::text), 1, 12));
  v_seq int; v_code text;
begin
  select * into v_programme from programmes where id = p_payload->>'programmeId';
  if not found then perform rs_fail('not_found', 'Choose a programme first.'); end if;
  if length(v_text) < 15 then perform rs_fail('validation', 'A title must be at least 15 characters long.'); end if;
  if exists (select 1 from titles where programme_id = v_programme.id and lower(text) = lower(v_text)) then
    perform rs_fail('conflict', 'That title already exists in this programme.');
  end if;

  select coalesce(max(nullif(regexp_replace(code, '^[^/]*/', ''), '')::int), 0) + 1
  into v_seq from titles where programme_id = v_programme.id;
  v_code := v_programme.code || '/' || lpad(v_seq::text, 4, '0');

  insert into titles(id, code, text, category, programme_id, status, created_at)
  values (v_id, v_code, v_text,
    coalesce(nullif(rs_clean(p_payload->>'category'), ''), 'General'),
    v_programme.id, 'active', now());

  perform rs_audit_insert(v_actor->>'name', v_actor->>'role', 'title.create',
    'Title', v_code, 'Added title ' || v_code, '—', '—', left(v_text, 70));
  perform rs_touch();
  return public.rs_title(v_id);
end;
$$;

create or replace function public.rs_update_title(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_id text := p_payload->>'id';
  v_patch jsonb := coalesce(p_payload->'patch', '{}'::jsonb);
  v_row titles%rowtype;
begin
  select * into v_row from titles where id = v_id;
  if not found then perform rs_fail('not_found', 'Title not found.'); end if;

  update titles set
    text = case when v_patch ? 'text' then rs_clean(v_patch->>'text') else text end,
    category = case when v_patch ? 'category' then coalesce(v_patch->>'category', 'General') else category end,
    status = case when v_patch ? 'status' then v_patch->>'status' else status end
  where id = v_id;

  perform rs_audit_insert(v_actor->>'name', v_actor->>'role', 'title.update',
    'Title', v_row.code, 'Edited title ' || v_row.code,
    coalesce(p_payload->>'reason', '—'), left(v_row.text, 70),
    left(coalesce(v_patch->>'text', v_row.text), 70));
  perform rs_touch();
  return public.rs_title(v_id);
end;
$$;

create or replace function public.rs_set_title_status(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_id text := p_payload->>'id';
  v_status text := coalesce(p_payload->>'status', 'active');
  v_reason text := rs_clean(p_payload->>'reason');
  v_row titles%rowtype;
begin
  if v_status = 'inactive' and length(v_reason) < 1 then
    perform rs_fail('validation', 'Give a reason before withdrawing a title.');
  end if;
  select * into v_row from titles where id = v_id;
  if not found then perform rs_fail('not_found', 'Title not found.'); end if;

  update titles set status = v_status where id = v_id;
  perform rs_audit_insert(v_actor->>'name', v_actor->>'role',
    case when v_status = 'inactive' then 'title.deactivate' else 'title.reactivate' end,
    'Title', v_row.code,
    case when v_status = 'inactive' then 'Withdrew ' else 'Restored ' end || v_row.code,
    case when v_reason = '' then '—' else v_reason end, v_row.status, v_status);
  perform rs_touch();
  return public.rs_title(v_id);
end;
$$;

create or replace function public.rs_commit_import(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_programme programmes%rowtype;
  v_row jsonb;
  v_text text;
  v_seq int;
  v_code text;
  v_imported int := 0;
begin
  select * into v_programme from programmes where id = p_payload->>'programmeId';
  if not found then perform rs_fail('not_found', 'Programme not found.'); end if;

  select coalesce(max(nullif(regexp_replace(code, '^[^/]*/', ''), '')::int), 0)
  into v_seq from titles where programme_id = v_programme.id;

  for v_row in select el from jsonb_array_elements(coalesce(p_payload->'valid', '[]'::jsonb)) as el
  loop
    v_text := rs_clean(v_row->>'text');
    if length(v_text) < 15 then continue; end if;
    if exists (select 1 from titles where programme_id = v_programme.id and lower(text) = lower(v_text)) then
      continue;
    end if;
    v_seq := v_seq + 1;
    v_code := v_programme.code || '/' || lpad(v_seq::text, 4, '0');
    insert into titles(id, code, text, category, programme_id, status, created_at)
    values ('t-IMP-' || substr(md5(random()::text || v_code), 1, 12), v_code, v_text,
      coalesce(nullif(rs_clean(v_row->>'category'), ''), 'General'),
      v_programme.id, 'active', now());
    v_imported := v_imported + 1;
  end loop;

  perform rs_audit_insert(v_actor->>'name', v_actor->>'role', 'title.import',
    'Title catalogue', v_programme.code,
    'Imported ' || v_imported::text || ' titles for ' || v_programme.code,
    'CSV import', v_seq::text || ' titles', (v_seq + v_imported)::text || ' titles');
  perform rs_touch();
  return jsonb_build_object('imported', v_imported);
end;
$$;

create or replace function public.rs_list_titles_admin(
  p_programme_id text default 'all',
  p_q text default '',
  p_status text default 'all',
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_total int; v_pages int; v_current int; v_start int; v_rows jsonb;
begin
  select count(*) into v_total
  from titles t
  join programmes p on p.id = t.programme_id
  where (p_programme_id = 'all' or t.programme_id = p_programme_id)
    and (p_status = 'all' or t.status = p_status)
    and (coalesce(p_q, '') = '' or t.text ilike '%' || p_q || '%'
         or t.code ilike '%' || p_q || '%' or t.category ilike '%' || p_q || '%'
         or p.name ilike '%' || p_q || '%');

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with rows as (
    select t.*, p.id as prog_id, p.code as prog_code, p.name as prog_name,
           p.award as prog_award, p.department as prog_department, p.status as prog_status,
           p.title_count as prog_count, p.categories as prog_categories,
           (s.id is null) as available
    from titles t
    join programmes p on p.id = t.programme_id
    left join selections s on s.title_id = t.id and s.status = 'active'
    where (p_programme_id = 'all' or t.programme_id = p_programme_id)
      and (p_status = 'all' or t.status = p_status)
      and (coalesce(p_q, '') = '' or t.text ilike '%' || p_q || '%'
           or t.code ilike '%' || p_q || '%' or t.category ilike '%' || p_q || '%'
           or p.name ilike '%' || p_q || '%')
    order by p.code, regexp_replace(t.code, '[^0-9]', '', 'g')::int
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(rs_title_json(
    r.id, r.code, r.text, r.category, r.programme_id, r.status, r.created_at, r.available,
    rs_programme_json(r.prog_id, r.prog_code, r.prog_name, r.prog_award,
      r.prog_department, r.prog_status, r.prog_count, r.prog_categories)
  )), '[]'::jsonb)
  into v_rows
  from rows r;

  return jsonb_build_object(
    'rows', v_rows, 'total', v_total, 'page', v_current, 'totalPages', v_pages,
    'from', case when v_total = 0 then 0 else v_start + 1 end,
    'to', least(v_start + p_page_size, v_total)
  );
end;
$$;

create or replace function public.rs_list_selections(
  p_q text default '',
  p_status text default 'all',
  p_programme_id text default 'all',
  p_page integer default 1,
  p_page_size integer default 15
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_total int; v_pages int; v_current int; v_start int; v_rows jsonb;
  v_needle text := '%' || lower(coalesce(p_q, '')) || '%';
begin
  select count(*) into v_total
  from selections s
  join students st on st.id = s.student_id
  join titles t on t.id = s.title_id
  where (p_status = 'all'
         or (p_status = 'edited' and coalesce(s.edit_count, 0) > 0)
         or (p_status <> 'edited' and s.status = p_status))
    and (p_programme_id = 'all' or st.programme_id = p_programme_id)
    and (coalesce(p_q, '') = '' or lower(s.ref) like v_needle
         or lower(st.reg_no) like v_needle or lower(st.names) like v_needle
         or lower(st.phone) like v_needle or lower(coalesce(st.supervisor_name, '')) like v_needle
         or lower(t.text) like v_needle or lower(t.code) like v_needle
         or lower(coalesce(s.previous_title_text, '')) like v_needle
         or lower(coalesce(s.previous_title_code, '')) like v_needle);

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with ids as (
    select s.id, coalesce(s.edited_at, s.selected_at) as sort_at
    from selections s
    join students st on st.id = s.student_id
    join titles t on t.id = s.title_id
    where (p_status = 'all'
           or (p_status = 'edited' and coalesce(s.edit_count, 0) > 0)
           or (p_status <> 'edited' and s.status = p_status))
      and (p_programme_id = 'all' or st.programme_id = p_programme_id)
      and (coalesce(p_q, '') = '' or lower(s.ref) like v_needle
           or lower(st.reg_no) like v_needle or lower(st.names) like v_needle
           or lower(st.phone) like v_needle or lower(coalesce(st.supervisor_name, '')) like v_needle
           or lower(t.text) like v_needle or lower(t.code) like v_needle
           or lower(coalesce(s.previous_title_text, '')) like v_needle
           or lower(coalesce(s.previous_title_code, '')) like v_needle)
    order by sort_at desc
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(rs_selection_json(i.id) order by i.sort_at desc), '[]'::jsonb)
  into v_rows
  from ids i;

  return jsonb_build_object(
    'rows', v_rows, 'total', v_total, 'page', v_current, 'totalPages', v_pages,
    'from', case when v_total = 0 then 0 else v_start + 1 end,
    'to', least(v_start + p_page_size, v_total)
  );
end;
$$;

create or replace function public.rs_release_selection(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_reason text := rs_clean(p_payload->>'reason');
  v_id text := p_payload->>'selectionId';
  v_row selections%rowtype;
begin
  if length(v_reason) < 5 then
    perform rs_fail('validation', 'A reason of at least 5 characters is required.');
  end if;
  select * into v_row from selections where id = v_id;
  if not found then perform rs_fail('not_found', 'Selection not found.'); end if;
  if v_row.status = 'released' then perform rs_fail('conflict', 'That selection was already released.'); end if;

  update selections set
    status = 'released', released_at = now(), release_reason = v_reason,
    released_by = v_actor->>'name'
  where id = v_id;

  perform rs_audit_insert(v_actor->>'name', v_actor->>'role', 'selection.release',
    'Selection', v_row.ref,
    'Released ' || v_row.ref || ' (' ||
      coalesce((select reg_no from students where id = v_row.student_id), '—') || ' → ' ||
      coalesce((select code from titles where id = v_row.title_id), '—') || ')',
    v_reason, 'active', 'released');
  perform rs_touch();
  return rs_selection_json(v_id);
end;
$$;

create or replace function public.rs_list_audit(
  p_q text default '',
  p_action text default 'all',
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_total int; v_pages int; v_current int; v_start int; v_rows jsonb;
  v_needle text := '%' || lower(coalesce(p_q, '')) || '%';
begin
  select count(*) into v_total
  from audit_log a
  where (p_action = 'all' or a.action = p_action)
    and (coalesce(p_q, '') = '' or lower(a.actor) like v_needle
         or lower(a.summary) like v_needle or lower(a.entity_id) like v_needle
         or lower(a.reason) like v_needle);

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with rows as (
    select a.* from audit_log a
    where (p_action = 'all' or a.action = p_action)
      and (coalesce(p_q, '') = '' or lower(a.actor) like v_needle
           or lower(a.summary) like v_needle or lower(a.entity_id) like v_needle
           or lower(a.reason) like v_needle)
    order by a.at desc
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(rs_audit_json(
    r.id, r.at, r.actor, r.role, r.action, r.entity, r.entity_id,
    r.summary, r.reason, r.before_value, r.after_value
  )), '[]'::jsonb)
  into v_rows
  from rows r;

  return jsonb_build_object(
    'rows', v_rows, 'total', v_total, 'page', v_current, 'totalPages', v_pages,
    'from', case when v_total = 0 then 0 else v_start + 1 end,
    'to', least(v_start + p_page_size, v_total)
  );
end;
$$;

create or replace function public.rs_list_orders(
  p_q text default '',
  p_status text default 'all',
  p_package text default 'all',
  p_page integer default 1,
  p_page_size integer default 15
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_total int; v_pages int; v_current int; v_start int; v_rows jsonb;
  v_counts jsonb;
  v_needle text := '%' || lower(coalesce(p_q, '')) || '%';
begin
  select jsonb_build_object(
    'total', count(*),
    'pending', count(*) filter (where status = 'pending'),
    'confirmed', count(*) filter (where status = 'confirmed'),
    'in_progress', count(*) filter (where status = 'in_progress'),
    'completed', count(*) filter (where status = 'completed'),
    'cancelled', count(*) filter (where status = 'cancelled')
  ) into v_counts from public.package_orders;

  select count(*) into v_total
  from public.package_orders o
  where (p_status = 'all' or o.status = p_status)
    and (p_package = 'all' or o.package_name = p_package)
    and (coalesce(p_q, '') = '' or lower(o.ref) like v_needle
         or lower(o.names) like v_needle or lower(o.reg_no) like v_needle
         or lower(o.phone) like v_needle or lower(o.supervisor_name) like v_needle
         or lower(o.programme) like v_needle or lower(o.title) like v_needle
         or lower(o.package_name) like v_needle);

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with rows as (
    select o.* from public.package_orders o
    where (p_status = 'all' or o.status = p_status)
      and (p_package = 'all' or o.package_name = p_package)
      and (coalesce(p_q, '') = '' or lower(o.ref) like v_needle
           or lower(o.names) like v_needle or lower(o.reg_no) like v_needle
           or lower(o.phone) like v_needle or lower(o.supervisor_name) like v_needle
           or lower(o.programme) like v_needle or lower(o.title) like v_needle
           or lower(o.package_name) like v_needle)
    order by o.created_at desc
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(rs_order_json(r) order by r.created_at desc), '[]'::jsonb)
  into v_rows
  from rows r;

  return jsonb_build_object(
    'rows', v_rows, 'total', v_total, 'page', v_current, 'totalPages', v_pages,
    'counts', v_counts,
    'from', case when v_total = 0 then 0 else v_start + 1 end,
    'to', least(v_start + p_page_size, v_total)
  );
end;
$$;

create or replace function public.rs_update_order(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_id text := p_payload->>'id';
  v_status text := coalesce(p_payload->>'status', '');
  v_admin_notes text := coalesce(p_payload->>'adminNotes', '');
  v_reason text := coalesce(nullif(rs_clean(p_payload->>'reason'), ''), 'Order status updated');
  v_row public.package_orders%rowtype;
  v_updated public.package_orders%rowtype;
begin
  select * into v_row from public.package_orders where id = v_id;
  if not found then perform rs_fail('not_found', 'Order not found.'); end if;
  if v_status not in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') then
    perform rs_fail('validation', 'Invalid order status.');
  end if;

  update public.package_orders set
    status = v_status,
    admin_notes = rs_clean(v_admin_notes),
    updated_at = now()
  where id = v_id
  returning * into v_updated;

  perform rs_audit_insert(
    v_actor->>'name', v_actor->>'role', 'order.update',
    'Package order', v_row.ref,
    'Updated order ' || v_row.ref || ' (' || v_row.status || ' → ' || v_status || ')',
    v_reason, v_row.status, v_status
  );
  perform rs_touch();
  return rs_order_json(v_updated);
end;
$$;

create or replace function public.rs_list_students(
  p_q text default '',
  p_programme_id text default 'all',
  p_filter text default 'all',
  p_page integer default 1,
  p_page_size integer default 15
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_total int; v_pages int; v_current int; v_start int; v_rows jsonb;
  v_needle text := '%' || lower(coalesce(p_q, '')) || '%';
begin
  with base as (
    select st.*,
           p.code as prog_code, p.name as prog_name,
           s.id as sel_id, s.ref as sel_ref, s.status as sel_status,
           s.selected_at as sel_at, s.edited_at as sel_edited_at,
           coalesce(s.edit_count, 0) as sel_edit_count,
           t.code as title_code, t.text as title_text
    from public.students st
    left join public.programmes p on p.id = st.programme_id
    left join public.selections s on s.student_id = st.id and s.status = 'active'
    left join public.titles t on t.id = s.title_id
    where (p_programme_id = 'all' or st.programme_id = p_programme_id)
      and (p_filter = 'all'
           or (p_filter = 'with_selection' and s.id is not null)
           or (p_filter = 'without_selection' and s.id is null)
           or (p_filter = 'edited' and coalesce(s.edit_count, 0) > 0))
      and (coalesce(p_q, '') = '' or lower(st.names) like v_needle
           or lower(st.reg_no) like v_needle or lower(st.phone) like v_needle
           or lower(coalesce(st.supervisor_name, '')) like v_needle
           or lower(coalesce(s.ref, '')) like v_needle
           or lower(coalesce(p.code, '')) like v_needle)
  )
  select count(*) into v_total from base;

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with base as (
    select st.*,
           p.code as prog_code, p.name as prog_name,
           s.id as sel_id, s.ref as sel_ref, s.status as sel_status,
           s.selected_at as sel_at, s.edited_at as sel_edited_at,
           coalesce(s.edit_count, 0) as sel_edit_count,
           t.code as title_code, t.text as title_text
    from public.students st
    left join public.programmes p on p.id = st.programme_id
    left join public.selections s on s.student_id = st.id and s.status = 'active'
    left join public.titles t on t.id = s.title_id
    where (p_programme_id = 'all' or st.programme_id = p_programme_id)
      and (p_filter = 'all'
           or (p_filter = 'with_selection' and s.id is not null)
           or (p_filter = 'without_selection' and s.id is null)
           or (p_filter = 'edited' and coalesce(s.edit_count, 0) > 0))
      and (coalesce(p_q, '') = '' or lower(st.names) like v_needle
           or lower(st.reg_no) like v_needle or lower(st.phone) like v_needle
           or lower(coalesce(st.supervisor_name, '')) like v_needle
           or lower(coalesce(s.ref, '')) like v_needle
           or lower(coalesce(p.code, '')) like v_needle)
    order by st.updated_at desc
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'regNo', b.reg_no,
    'names', b.names,
    'phone', b.phone,
    'supervisorName', coalesce(b.supervisor_name, ''),
    'programmeId', b.programme_id,
    'programmeCode', b.prog_code,
    'programmeName', b.prog_name,
    'createdAt', to_jsonb(b.created_at),
    'updatedAt', to_jsonb(b.updated_at),
    'selection', case when b.sel_id is null then null else jsonb_build_object(
      'id', b.sel_id,
      'ref', b.sel_ref,
      'status', b.sel_status,
      'selectedAt', to_jsonb(b.sel_at),
      'editedAt', to_jsonb(b.sel_edited_at),
      'editCount', b.sel_edit_count,
      'titleCode', b.title_code,
      'titleText', b.title_text
    ) end
  ) order by b.updated_at desc), '[]'::jsonb)
  into v_rows
  from base b;

  return jsonb_build_object(
    'rows', v_rows, 'total', v_total, 'page', v_current, 'totalPages', v_pages,
    'from', case when v_total = 0 then 0 else v_start + 1 end,
    'to', least(v_start + p_page_size, v_total)
  );
end;
$$;

create or replace function public.rs_update_student_admin(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_id text := p_payload->>'id';
  v_names text := rs_clean(p_payload->>'names');
  v_phone text := rs_clean(p_payload->>'phone');
  v_supervisor text := rs_clean(p_payload->>'supervisorName');
  v_reason text := coalesce(nullif(rs_clean(p_payload->>'reason'), ''), 'Admin updated student record');
  v_row public.students%rowtype;
  v_updated public.students%rowtype;
begin
  select * into v_row from public.students where id = v_id;
  if not found then perform rs_fail('not_found', 'Student record not found.'); end if;
  if coalesce(array_length(string_to_array(v_names, ' '), 1), 0) < 2 then
    perform rs_fail('validation', 'Enter full names (at least two parts).');
  end if;
  if v_phone = '' then perform rs_fail('validation', 'Phone number is required.'); end if;

  update public.students set
    names = v_names,
    phone = v_phone,
    supervisor_name = v_supervisor,
    updated_at = now()
  where id = v_id
  returning * into v_updated;

  perform rs_audit_insert(
    v_actor->>'name', v_actor->>'role', 'student.update',
    'Student', v_row.reg_no,
    'Updated student ' || v_row.reg_no,
    v_reason,
    v_row.names || ' · ' || v_row.phone || ' · Sup: ' || coalesce(nullif(v_row.supervisor_name, ''), '—'),
    v_names || ' · ' || v_phone || ' · Sup: ' || coalesce(nullif(v_supervisor, ''), '—')
  );
  perform rs_touch();
  return rs_student_json(
    v_updated.id, v_updated.reg_no, v_updated.names, v_updated.phone,
    v_updated.programme_id, v_updated.created_at, v_updated.updated_at, v_updated.supervisor_name
  );
end;
$$;

create or replace function public.rs_update_site_content(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_actor jsonb := rs_require_actor(p_payload);
  v_key text := btrim(coalesce(p_payload->>'key', ''));
  v_data jsonb := p_payload->'data';
  v_reason text := coalesce(nullif(rs_clean(p_payload->>'reason'), ''), 'Updated site content');
begin
  if v_key not in ('meta', 'contact', 'institutions', 'pricing', 'rules', 'faqs') then
    perform rs_fail('validation', 'Unsupported site content section.');
  end if;
  if v_data is null then perform rs_fail('validation', 'Content payload is required.'); end if;

  insert into public.site_content(key, data, updated_at)
  values (v_key, v_data, now())
  on conflict (key) do update set data = excluded.data, updated_at = now();

  perform rs_audit_insert(
    v_actor->>'name', v_actor->>'role', 'content.update',
    'Site content', v_key,
    'Updated site content section: ' || v_key,
    v_reason, '—', v_key
  );
  perform rs_touch();
  return public.rs_site_content();
end;
$$;

create or replace function public.rs_version()
returns timestamptz language sql security definer set search_path = public, pg_temp
as $$ select updated_at from portal_meta where id = 'main' $$;

/* ------------------------------------------------------------------ */
/* Grants                                                              */
/* ------------------------------------------------------------------ */

do $$
declare
  r record;
  internal text[] := array[
    'rs_fail', 'rs_now', 'rs_clean', 'rs_touch', 'rs_audit_insert', 'rs_require_actor',
    'rs_next_ref', 'rs_next_order_ref', 'rs_programme_json', 'rs_title_json',
    'rs_student_json', 'rs_order_json', 'rs_audit_json', 'rs_selection_json'
  ];
begin
  for r in
    select p.oid::regprocedure as sig, p.proname as name
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'rs_%'
  loop
    execute format('revoke all on function %s from public', r.sig);
    if not (r.name = any(internal)) then
      execute format('grant execute on function %s to anon, authenticated', r.sig);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
