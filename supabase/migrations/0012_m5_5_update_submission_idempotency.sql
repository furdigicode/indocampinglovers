-- ICL M5.5 Suggest Edit idempotency hardening
alter table public.campground_update_submissions
  add column if not exists idempotency_key text;

create unique index if not exists campground_update_submissions_idempotency_key_idx
  on public.campground_update_submissions(idempotency_key)
  where idempotency_key is not null;

revoke all privileges on table public.campground_update_submissions from anon, authenticated;
