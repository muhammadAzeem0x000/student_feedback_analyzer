create index course_assignments_assigned_by_idx
  on public.course_assignments(assigned_by)
  where assigned_by is not null;

