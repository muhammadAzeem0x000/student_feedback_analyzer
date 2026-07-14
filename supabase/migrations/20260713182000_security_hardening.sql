-- Remove Supabase's default direct function grants, then add only intentional callers.
revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;
revoke all on function public.current_user_role() from public, anon, authenticated, service_role;
revoke all on function public.is_active_user() from public, anon, authenticated, service_role;
revoke all on function public.is_admin() from public, anon, authenticated, service_role;
revoke all on function public.owns_session(uuid) from public, anon, authenticated, service_role;
revoke all on function public.get_public_session(text) from public, anon, authenticated, service_role;
revoke all on function public.submit_anonymous_feedback(text, text, jsonb) from public, anon, authenticated, service_role;
revoke all on function public.get_session_statistics(uuid) from public, anon, authenticated, service_role;
revoke all on function public.consume_submission_rate_limit(text, timestamptz, integer) from public, anon, authenticated, service_role;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_session(uuid) to authenticated;
grant execute on function public.get_public_session(text) to anon, authenticated;
grant execute on function public.submit_anonymous_feedback(text, text, jsonb) to anon, authenticated;
grant execute on function public.get_session_statistics(uuid) to authenticated;
grant execute on function public.consume_submission_rate_limit(text, timestamptz, integer) to service_role;

drop policy if exists departments_admin_write on public.departments;
create policy departments_admin_insert on public.departments for insert to authenticated with check (public.is_admin());
create policy departments_admin_update on public.departments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy departments_admin_delete on public.departments for delete to authenticated using (public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_self_or_admin_update on public.profiles for update to authenticated
using ((id = (select auth.uid()) and public.is_active_user()) or public.is_admin())
with check (
  public.is_admin()
  or (id = (select auth.uid()) and role = public.current_user_role() and is_active = true)
);

create index if not exists profiles_department_idx on public.profiles(department_id);
create index if not exists courses_department_idx on public.courses(department_id);
create index if not exists reflections_instructor_idx on public.instructor_reflections(instructor_id);
create index if not exists analyses_instructor_idx on public.ai_analyses(instructor_id);
