-- M5.2 idempotency hardening for controlled server submissions.
alter table public.campground_submissions add column if not exists idempotency_key text;
create unique index if not exists campground_submissions_idempotency_key_idx
  on public.campground_submissions(idempotency_key) where idempotency_key is not null;
revoke all privileges on table public.campground_submissions from anon, authenticated;
