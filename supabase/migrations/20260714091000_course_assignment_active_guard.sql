-- Deactivated instructors cannot read course assignments directly.

drop policy if exists course_assignments_read on public.course_assignments;
create policy course_assignments_read on public.course_assignments
for select to authenticated
using (
  public.is_admin()
  or (instructor_id = (select auth.uid()) and public.is_active_user())
);

drop policy if exists courses_assigned_read on public.courses;
create policy courses_assigned_read on public.courses
for select to authenticated
using (
  public.is_admin()
  or (public.is_active_user() and public.is_assigned_to_course(id))
);

