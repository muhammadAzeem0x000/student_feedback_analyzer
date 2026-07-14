-- Never trust user-controlled signup metadata for roles or activation.
-- New auth users require administrator activation and always begin as instructors.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    'instructor'::public.app_role,
    false
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;
grant execute on function public.handle_new_user() to postgres;

