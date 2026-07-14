-- Admin-managed course catalog with explicit instructor assignments.

drop policy if exists courses_owner_read on public.courses;
drop policy if exists courses_owner_insert on public.courses;
drop policy if exists courses_owner_update on public.courses;
drop policy if exists courses_owner_delete on public.courses;
drop policy if exists sessions_owner_insert on public.feedback_sessions;

create table public.course_assignments (
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (course_id, instructor_id)
);

insert into public.course_assignments (course_id, instructor_id)
select id, instructor_id from public.courses
on conflict do nothing;

drop index if exists public.courses_instructor_idx;
alter table public.courses drop constraint if exists courses_instructor_id_code_key;
alter table public.courses drop column instructor_id;
alter table public.courses add constraint courses_code_key unique (code);

create index course_assignments_instructor_idx
  on public.course_assignments(instructor_id, course_id);

alter table public.course_assignments enable row level security;

create or replace function public.is_assigned_to_course(target_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.course_assignments
    where course_id = target_course_id
      and instructor_id = (select auth.uid())
  );
$$;

revoke all on function public.is_assigned_to_course(uuid) from public, anon, authenticated, service_role;
grant execute on function public.is_assigned_to_course(uuid) to authenticated;

create or replace function public.create_course_with_assignments(
  course_name text,
  course_code text,
  course_description text,
  course_department_id uuid,
  target_instructor_ids uuid[]
)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  created_course_id uuid;
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  if coalesce(cardinality(target_instructor_ids), 0) = 0
     or cardinality(target_instructor_ids) > 50
     or cardinality(target_instructor_ids) <> cardinality(array(select distinct unnest(target_instructor_ids))) then
    raise exception using errcode = '22023', message = 'INVALID_INSTRUCTOR_ASSIGNMENTS';
  end if;

  if exists (
    select 1 from unnest(target_instructor_ids) target_id
    where not exists (
      select 1 from public.profiles p
      where p.id = target_id and p.role = 'instructor' and p.is_active
    )
  ) then
    raise exception using errcode = '22023', message = 'INVALID_INSTRUCTOR_ASSIGNMENTS';
  end if;

  insert into public.courses(department_id, name, code, description)
  values (course_department_id, course_name, course_code, nullif(course_description, ''))
  returning id into created_course_id;

  insert into public.course_assignments(course_id, instructor_id, assigned_by)
  select created_course_id, target_id, (select auth.uid())
  from unnest(target_instructor_ids) target_id;

  return created_course_id;
end;
$$;

revoke all on function public.create_course_with_assignments(text, text, text, uuid, uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.create_course_with_assignments(text, text, text, uuid, uuid[]) to authenticated;

create policy course_assignments_read on public.course_assignments
for select to authenticated
using (instructor_id = (select auth.uid()) or public.is_admin());

create policy course_assignments_admin_insert on public.course_assignments
for insert to authenticated
with check (
  public.is_admin()
  and exists (
    select 1 from public.profiles p
    where p.id = instructor_id and p.role = 'instructor' and p.is_active
  )
);

create policy course_assignments_admin_delete on public.course_assignments
for delete to authenticated
using (public.is_admin());

create policy courses_assigned_read on public.courses
for select to authenticated
using (public.is_admin() or public.is_assigned_to_course(id));

create policy courses_admin_insert on public.courses
for insert to authenticated
with check (public.is_admin());

create policy courses_admin_update on public.courses
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy sessions_owner_insert on public.feedback_sessions
for insert to authenticated
with check (
  instructor_id = (select auth.uid())
  and public.is_active_user()
  and public.is_assigned_to_course(course_id)
);

revoke all on table public.course_assignments from public, anon, authenticated, service_role;
grant select, insert, delete on table public.course_assignments to authenticated;
grant all on table public.course_assignments to service_role;
