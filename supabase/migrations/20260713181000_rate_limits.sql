create table public.submission_rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (key_hash, window_start)
);

alter table public.submission_rate_limits enable row level security;
revoke all on public.submission_rate_limits from anon, authenticated;

create or replace function public.consume_submission_rate_limit(
  target_key_hash text,
  target_window timestamptz,
  maximum_requests integer
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  current_count integer;
begin
  insert into public.submission_rate_limits(key_hash, window_start, request_count)
  values (target_key_hash, target_window, 1)
  on conflict (key_hash, window_start)
  do update set request_count = public.submission_rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= maximum_requests;
end;
$$;

revoke all on function public.consume_submission_rate_limit(text, timestamptz, integer) from public;
grant execute on function public.consume_submission_rate_limit(text, timestamptz, integer) to service_role;
