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
drop table if exists public.selections cascade;
drop table if exists public.students cascade;
drop table if exists public.titles cascade;
drop table if exists public.programmes cascade;
drop table if exists public.audit_log cascade;
drop table if exists public.admins cascade;
drop table if exists public.counters cascade;
drop table if exists public.portal_meta cascade;

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
  released_by text
);

-- BR-01/BR-09 and BR-02/BR-04 are also enforced by the database.
create unique index one_active_selection_per_student
on public.selections(student_id) where status = 'active';
create unique index one_active_selection_per_title
on public.selections(title_id) where status = 'active';
create index selections_status_idx on public.selections(status);

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

insert into public.counters(name, value) values ('ref', 0)
on conflict (name) do nothing;

create table public.portal_meta (
  id text primary key,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.portal_meta(id, version) values ('main', 1)
on conflict (id) do nothing;

alter table public.programmes enable row level security;
alter table public.titles enable row level security;
alter table public.students enable row level security;
alter table public.selections enable row level security;
alter table public.audit_log enable row level security;
alter table public.admins enable row level security;
alter table public.counters enable row level security;
alter table public.portal_meta enable row level security;

-- No direct table access: the browser only calls the SECURITY DEFINER functions below.
revoke all on public.programmes, public.titles, public.students, public.selections,
  public.audit_log, public.admins, public.counters, public.portal_meta
from anon, authenticated;

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
  p_created_at timestamptz, p_updated_at timestamptz
)
returns jsonb language sql immutable
as $$
  select jsonb_build_object(
    'id', p_id, 'regNo', p_reg_no, 'names', p_names, 'phone', p_phone,
    'programmeId', p_programme_id,
    'createdAt', to_jsonb(p_created_at), 'updatedAt', to_jsonb(p_updated_at)
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
    'title', case when t.id is null then null else public.rs_title_json(
      t.id, t.code, t.text, t.category, t.programme_id, t.status, t.created_at, false, null
    ) end,
    'student', case when st.id is null then null else public.rs_student_json(
      st.id, st.reg_no, st.names, st.phone, st.programme_id, st.created_at, st.updated_at
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
  v_programme_id text := p_payload->>'programmeId';
  v_student_id text;
  v_selection_id text;
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
    insert into students(id, reg_no, names, phone, programme_id, created_at, updated_at)
    values (v_student_id, v_reg, v_names, v_phone, v_programme_id, now(), now());
  else
    select id into v_selection_id from selections
    where student_id = v_student_id and status = 'active' limit 1;

    update students
    set names = v_names, phone = v_phone, updated_at = now(),
        programme_id = case when v_selection_id is null then v_programme_id else programme_id end
    where id = v_student_id;
  end if;

  perform rs_touch();

  return jsonb_build_object(
    'student', rs_student_json(
      v_student_id, v_reg, v_names, v_phone,
      case when v_selection_id is null then v_programme_id else (
        select programme_id from students where id = v_student_id
      ) end,
      (select created_at from students where id = v_student_id),
      (select updated_at from students where id = v_student_id)
    ),
    'programme', (select rs_programme_json(
      p.id, p.code, p.name, p.award, p.department, p.status, p.title_count, p.categories
    ) from programmes p where p.id = (
      select programme_id from students where id = v_student_id
    )),
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
  v_per jsonb; v_recent jsonb; v_audit jsonb;
  v_programmes int; v_active_programmes int; v_titles int;
  v_taken int; v_students int; v_active int; v_released int; v_today int;
begin
  select count(*) into v_programmes from programmes;
  select count(*) into v_active_programmes from programmes where status = 'active';
  select count(*) into v_titles from titles where status = 'active';
  select count(*) into v_taken from selections where status = 'active';
  select count(*) into v_students from students;
  select count(*) into v_active from selections where status = 'active';
  select count(*) into v_released from selections where status = 'released';
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

  select coalesce(jsonb_agg(rs_selection_json(s.id) order by s.selected_at desc), '[]'::jsonb)
  into v_recent
  from (select id, selected_at from selections order by selected_at desc limit 6) s;

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
    'today', v_today,
    'perProgramme', v_per,
    'recent', v_recent,
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
  where (p_status = 'all' or s.status = p_status)
    and (p_programme_id = 'all' or st.programme_id = p_programme_id)
    and (coalesce(p_q, '') = '' or lower(s.ref) like v_needle
         or lower(st.reg_no) like v_needle or lower(st.names) like v_needle
         or lower(st.phone) like v_needle or lower(t.text) like v_needle);

  v_pages := greatest(1, ceil(v_total::numeric / greatest(p_page_size, 1)));
  v_current := least(greatest(1, p_page), v_pages);
  v_start := (v_current - 1) * p_page_size;

  with ids as (
    select s.id
    from selections s
    join students st on st.id = s.student_id
    join titles t on t.id = s.title_id
    where (p_status = 'all' or s.status = p_status)
      and (p_programme_id = 'all' or st.programme_id = p_programme_id)
      and (coalesce(p_q, '') = '' or lower(s.ref) like v_needle
           or lower(st.reg_no) like v_needle or lower(st.names) like v_needle
           or lower(st.phone) like v_needle or lower(t.text) like v_needle)
    order by s.selected_at desc
    limit p_page_size offset v_start
  )
  select coalesce(jsonb_agg(rs_selection_json(i.id)), '[]'::jsonb) into v_rows from ids i;

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
    'rs_next_ref', 'rs_programme_json', 'rs_title_json', 'rs_student_json',
    'rs_audit_json', 'rs_selection_json'
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
