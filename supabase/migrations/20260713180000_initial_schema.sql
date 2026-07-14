-- Anonymous Course Feedback & AI Insights Platform
create extension if not exists pgcrypto;

create type public.app_role as enum ('instructor', 'admin');
create type public.feedback_session_status as enum ('draft', 'open', 'closed', 'analyzed');
create type public.feedback_question_type as enum ('rating', 'single_choice', 'long_text');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.app_role not null default 'instructor',
  department_id uuid references public.departments(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  code text not null check (char_length(code) between 2 and 30),
  description text check (description is null or char_length(description) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (instructor_id, code)
);

create table public.feedback_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text check (description is null or char_length(description) <= 1500),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.feedback_session_status not null default 'draft',
  expected_responses integer check (expected_responses is null or expected_responses >= 0),
  minimum_analysis_responses integer not null default 3 check (minimum_analysis_responses between 1 and 1000),
  opens_at timestamptz,
  closes_at timestamptz,
  material_path text,
  material_name text,
  material_size integer check (material_size is null or material_size between 1 and 10485760),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_session_window check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create table public.feedback_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.feedback_sessions(id) on delete cascade,
  type public.feedback_question_type not null,
  prompt text not null check (char_length(prompt) between 3 and 500),
  is_required boolean not null default true,
  position integer not null check (position >= 0),
  options jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, position),
  constraint valid_question_options check (
    (type = 'single_choice' and jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 10)
    or (type <> 'single_choice' and options is null)
  )
);

create table public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.feedback_sessions(id) on delete cascade,
  submitted_at timestamptz not null default now()
);

create table public.response_codes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.feedback_sessions(id) on delete cascade,
  code_hash text not null check (code_hash ~ '^[a-f0-9]{64}$'),
  used_at timestamptz,
  response_id uuid unique references public.feedback_responses(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (session_id, code_hash),
  constraint response_code_usage_consistent check (
    (used_at is null and response_id is null) or (used_at is not null and response_id is not null)
  )
);

create table public.response_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.feedback_responses(id) on delete cascade,
  question_id uuid not null references public.feedback_questions(id) on delete cascade,
  rating_value smallint check (rating_value between 1 and 5),
  choice_value text check (choice_value is null or char_length(choice_value) <= 200),
  text_value text check (text_value is null or char_length(text_value) <= 1000),
  created_at timestamptz not null default now(),
  unique (response_id, question_id),
  constraint exactly_one_answer_value check (
    num_nonnulls(rating_value, choice_value, text_value) = 1
  )
);

create table public.instructor_reflections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.feedback_sessions(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  perceived_strengths text not null check (char_length(perceived_strengths) between 10 and 2000),
  perceived_challenges text not null check (char_length(perceived_challenges) between 10 and 2000),
  surprises text not null check (char_length(surprises) between 10 and 2000),
  next_steps text not null check (char_length(next_steps) between 10 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.feedback_sessions(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  model text not null,
  prompt_version text not null default 'anonymous-course-feedback-v1',
  response_count integer not null check (response_count >= 0),
  result jsonb not null check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now()
);

create index courses_instructor_idx on public.courses(instructor_id);
create index sessions_instructor_idx on public.feedback_sessions(instructor_id);
create index sessions_course_idx on public.feedback_sessions(course_id);
create index questions_session_position_idx on public.feedback_questions(session_id, position);
create index responses_session_submitted_idx on public.feedback_responses(session_id, submitted_at desc);
create index codes_session_unused_idx on public.response_codes(session_id) where used_at is null;
create index answers_question_idx on public.response_answers(question_id);
create index analyses_session_created_idx on public.ai_analyses(session_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger departments_set_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger sessions_set_updated_at before update on public.feedback_sessions for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.feedback_questions for each row execute function public.set_updated_at();
create trigger reflections_set_updated_at before update on public.instructor_reflections for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data ->> 'role' = 'admin' then 'admin'::public.app_role else 'instructor'::public.app_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and is_active
  );
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and is_active
  );
$$;

create or replace function public.current_user_role()
returns public.app_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.owns_session(target_session_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.feedback_sessions
    where id = target_session_id and instructor_id = (select auth.uid())
  );
$$;

create or replace function public.get_public_session(target_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', s.id,
    'slug', s.slug,
    'title', s.title,
    'description', s.description,
    'status', s.status,
    'opens_at', s.opens_at,
    'closes_at', s.closes_at,
    'course', jsonb_build_object('name', c.name, 'code', c.code),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id,
        'type', q.type,
        'prompt', q.prompt,
        'is_required', q.is_required,
        'position', q.position,
        'options', q.options
      ) order by q.position)
      from public.feedback_questions q where q.session_id = s.id
    ), '[]'::jsonb)
  )
  from public.feedback_sessions s
  join public.courses c on c.id = s.course_id
  where s.slug = target_slug
    and s.status = 'open'
    and (s.opens_at is null or s.opens_at <= now())
    and (s.closes_at is null or s.closes_at > now());
$$;

create or replace function public.submit_anonymous_feedback(
  target_slug text,
  submitted_code_hash text,
  submitted_answers jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target_session public.feedback_sessions%rowtype;
  locked_code public.response_codes%rowtype;
  created_response_id uuid;
  answer jsonb;
  question public.feedback_questions%rowtype;
  submitted_question_ids uuid[];
begin
  if jsonb_typeof(submitted_answers) <> 'array' or jsonb_array_length(submitted_answers) > 50 then
    raise exception using errcode = '22023', message = 'INVALID_ANSWERS';
  end if;

  select * into target_session from public.feedback_sessions
  where slug = target_slug for update;

  if not found or target_session.status <> 'open'
     or (target_session.opens_at is not null and target_session.opens_at > now())
     or (target_session.closes_at is not null and target_session.closes_at <= now()) then
    raise exception using errcode = 'P0001', message = 'SESSION_NOT_OPEN';
  end if;

  select * into locked_code from public.response_codes
  where session_id = target_session.id and code_hash = submitted_code_hash for update;

  if not found or locked_code.used_at is not null then
    raise exception using errcode = 'P0001', message = 'INVALID_OR_USED_CODE';
  end if;

  select coalesce(array_agg((item ->> 'question_id')::uuid), array[]::uuid[])
  into submitted_question_ids from jsonb_array_elements(submitted_answers) item;

  if cardinality(submitted_question_ids) <> cardinality(array(select distinct unnest(submitted_question_ids))) then
    raise exception using errcode = '22023', message = 'DUPLICATE_QUESTION';
  end if;

  if exists (
    select 1 from unnest(submitted_question_ids) submitted_id
    where not exists (
      select 1 from public.feedback_questions q
      where q.id = submitted_id and q.session_id = target_session.id
    )
  ) then
    raise exception using errcode = '22023', message = 'UNKNOWN_QUESTION';
  end if;

  if exists (
    select 1 from public.feedback_questions q
    where q.session_id = target_session.id and q.is_required and not (q.id = any(submitted_question_ids))
  ) then
    raise exception using errcode = '22023', message = 'MISSING_REQUIRED_ANSWER';
  end if;

  insert into public.feedback_responses(session_id) values (target_session.id)
  returning id into created_response_id;

  for answer in select * from jsonb_array_elements(submitted_answers)
  loop
    select * into question from public.feedback_questions
    where id = (answer ->> 'question_id')::uuid and session_id = target_session.id;

    if question.type = 'rating' then
      if not (answer ? 'rating_value') or (answer ->> 'rating_value')::integer not between 1 and 5 then
        raise exception using errcode = '22023', message = 'INVALID_RATING';
      end if;
      insert into public.response_answers(response_id, question_id, rating_value)
      values (created_response_id, question.id, (answer ->> 'rating_value')::smallint);
    elsif question.type = 'single_choice' then
      if not (question.options ? (answer ->> 'choice_value')) then
        raise exception using errcode = '22023', message = 'INVALID_CHOICE';
      end if;
      insert into public.response_answers(response_id, question_id, choice_value)
      values (created_response_id, question.id, answer ->> 'choice_value');
    else
      if char_length(coalesce(answer ->> 'text_value', '')) > 1000 then
        raise exception using errcode = '22023', message = 'TEXT_TOO_LONG';
      end if;
      insert into public.response_answers(response_id, question_id, text_value)
      values (created_response_id, question.id, answer ->> 'text_value');
    end if;
  end loop;

  update public.response_codes set used_at = now(), response_id = created_response_id
  where id = locked_code.id;

  return created_response_id;
end;
$$;

create or replace function public.get_session_statistics(target_session_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when public.owns_session(target_session_id) or public.is_admin() then
    jsonb_build_object(
      'total_responses', (select count(*) from public.feedback_responses where session_id = target_session_id),
      'expected_responses', s.expected_responses,
      'response_percentage', case when coalesce(s.expected_responses, 0) = 0 then null else round((select count(*)::numeric * 100 / s.expected_responses from public.feedback_responses where session_id = target_session_id), 1) end,
      'used_codes', (select count(*) from public.response_codes where session_id = target_session_id and used_at is not null),
      'unused_codes', (select count(*) from public.response_codes where session_id = target_session_id and used_at is null),
      'ratings', coalesce((
        select jsonb_agg(jsonb_build_object('question_id', q.id, 'prompt', q.prompt, 'average', x.average, 'distribution', x.distribution) order by q.position)
        from public.feedback_questions q
        join lateral (
          select round(avg(a.rating_value), 2) average,
            jsonb_object_agg(a.rating_value, a.answer_count order by a.rating_value) distribution
          from (
            select ra.rating_value, count(*) answer_count from public.response_answers ra
            where ra.question_id = q.id group by ra.rating_value
          ) a
        ) x on true where q.session_id = target_session_id and q.type = 'rating'
      ), '[]'::jsonb),
      'choices', coalesce((
        select jsonb_agg(jsonb_build_object('question_id', q.id, 'prompt', q.prompt, 'distribution', x.distribution) order by q.position)
        from public.feedback_questions q
        join lateral (
          select jsonb_object_agg(a.choice_value, a.answer_count order by a.choice_value) distribution
          from (
            select ra.choice_value, count(*) answer_count from public.response_answers ra
            where ra.question_id = q.id group by ra.choice_value
          ) a
        ) x on true where q.session_id = target_session_id and q.type = 'single_choice'
      ), '[]'::jsonb)
    ) else null end
  from public.feedback_sessions s where s.id = target_session_id;
$$;

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.feedback_sessions enable row level security;
alter table public.feedback_questions enable row level security;
alter table public.response_codes enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.response_answers enable row level security;
alter table public.instructor_reflections enable row level security;
alter table public.ai_analyses enable row level security;

create policy departments_authenticated_read on public.departments for select to authenticated using (public.is_active_user());
create policy departments_admin_write on public.departments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy profiles_self_or_admin_read on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid()) and public.is_active_user()) with check (id = (select auth.uid()) and role = public.current_user_role() and is_active = true);
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy courses_owner_read on public.courses for select to authenticated using (instructor_id = (select auth.uid()) or public.is_admin());
create policy courses_owner_insert on public.courses for insert to authenticated with check (instructor_id = (select auth.uid()) and public.is_active_user());
create policy courses_owner_update on public.courses for update to authenticated using (instructor_id = (select auth.uid()) and public.is_active_user()) with check (instructor_id = (select auth.uid()));
create policy courses_owner_delete on public.courses for delete to authenticated using (instructor_id = (select auth.uid()) and public.is_active_user());

create policy sessions_owner_read on public.feedback_sessions for select to authenticated using (instructor_id = (select auth.uid()) or public.is_admin());
create policy sessions_owner_insert on public.feedback_sessions for insert to authenticated with check (instructor_id = (select auth.uid()) and public.is_active_user() and exists (select 1 from public.courses c where c.id = course_id and c.instructor_id = (select auth.uid())));
create policy sessions_owner_update on public.feedback_sessions for update to authenticated using (instructor_id = (select auth.uid()) and public.is_active_user()) with check (instructor_id = (select auth.uid()));
create policy sessions_owner_delete on public.feedback_sessions for delete to authenticated using (instructor_id = (select auth.uid()) and public.is_active_user() and status = 'draft');

create policy questions_owner_all on public.feedback_questions for all to authenticated using (public.owns_session(session_id) and public.is_active_user()) with check (public.owns_session(session_id) and public.is_active_user());
create policy codes_owner_all on public.response_codes for all to authenticated using (public.owns_session(session_id) and public.is_active_user()) with check (public.owns_session(session_id) and public.is_active_user());
create policy responses_owner_read on public.feedback_responses for select to authenticated using (public.owns_session(session_id) or public.is_admin());
create policy answers_owner_read on public.response_answers for select to authenticated using (exists (select 1 from public.feedback_responses r where r.id = response_id and (public.owns_session(r.session_id) or public.is_admin())));
create policy reflections_owner_all on public.instructor_reflections for all to authenticated using (instructor_id = (select auth.uid()) and public.owns_session(session_id) and public.is_active_user()) with check (instructor_id = (select auth.uid()) and public.owns_session(session_id) and public.is_active_user());
create policy analyses_owner_read on public.ai_analyses for select to authenticated using (instructor_id = (select auth.uid()) or public.is_admin());
create policy analyses_owner_insert on public.ai_analyses for insert to authenticated with check (instructor_id = (select auth.uid()) and public.owns_session(session_id) and public.is_active_user());

revoke all on function public.get_public_session(text) from public;
revoke all on function public.submit_anonymous_feedback(text, text, jsonb) from public;
revoke all on function public.get_session_statistics(uuid) from public;
grant execute on function public.get_public_session(text) to anon, authenticated;
grant execute on function public.submit_anonymous_feedback(text, text, jsonb) to anon, authenticated;
grant execute on function public.get_session_statistics(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('session-materials', 'session-materials', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy materials_owner_read on storage.objects for select to authenticated using (
  bucket_id = 'session-materials' and (
    public.is_admin() or exists (
      select 1 from public.feedback_sessions s
      where s.material_path = name and s.instructor_id = (select auth.uid())
    )
  )
);
create policy materials_owner_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'session-materials' and (storage.foldername(name))[1] = (select auth.uid())::text and public.is_active_user()
);
create policy materials_owner_update on storage.objects for update to authenticated using (
  bucket_id = 'session-materials' and owner_id = (select auth.uid()::text)
) with check (bucket_id = 'session-materials' and owner_id = (select auth.uid()::text));
create policy materials_owner_delete on storage.objects for delete to authenticated using (
  bucket_id = 'session-materials' and owner_id = (select auth.uid()::text)
);

insert into public.departments(name) values ('Computer Science'), ('Software Engineering') on conflict (name) do nothing;
