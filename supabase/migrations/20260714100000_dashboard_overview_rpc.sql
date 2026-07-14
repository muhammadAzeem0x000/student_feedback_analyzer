-- Collapse dashboard counts and recent sessions into one RLS-aware request.

create or replace function public.get_dashboard_overview()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'courses', (select count(*) from public.courses),
    'sessions', (select count(*) from public.feedback_sessions),
    'responses', (select count(*) from public.feedback_responses),
    'analyses', (select count(*) from public.ai_analyses),
    'recent_sessions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', recent.id,
          'title', recent.title,
          'status', recent.status,
          'created_at', recent.created_at,
          'course_name', recent.course_name,
          'course_code', recent.course_code
        ) order by recent.created_at desc
      )
      from (
        select s.id, s.title, s.status, s.created_at,
               c.name as course_name, c.code as course_code
        from public.feedback_sessions s
        join public.courses c on c.id = s.course_id
        order by s.created_at desc
        limit 5
      ) recent
    ), '[]'::jsonb)
  )
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active;
$$;

revoke all on function public.get_dashboard_overview() from public, anon, authenticated, service_role;
grant execute on function public.get_dashboard_overview() to authenticated;

