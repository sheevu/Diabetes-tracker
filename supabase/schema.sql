create extension if not exists pgcrypto;

create table if not exists public.glucose_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  glucose_value integer not null check (glucose_value between 20 and 600),
  reading_type text not null check (reading_type in ('Fasting','Before Meal','After Meal','Bedtime','Exercise','Custom')),
  measured_at timestamptz not null default now(),
  carbs integer check (carbs is null or carbs between 0 and 1000),
  insulin numeric(7,2) check (insulin is null or insulin >= 0),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists glucose_logs_user_measured_idx on public.glucose_logs (user_id, measured_at desc);
alter table public.glucose_logs enable row level security;

drop policy if exists "read own glucose logs" on public.glucose_logs;
drop policy if exists "insert own glucose logs" on public.glucose_logs;
drop policy if exists "update own glucose logs" on public.glucose_logs;
drop policy if exists "delete own glucose logs" on public.glucose_logs;

create policy "read own glucose logs" on public.glucose_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own glucose logs" on public.glucose_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own glucose logs" on public.glucose_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own glucose logs" on public.glucose_logs for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.glucose_logs to authenticated;
revoke all on public.glucose_logs from anon;

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null check (char_length(activity) between 1 and 80),
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  notes text check (notes is null or char_length(notes) <= 500),
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists exercise_logs_user_date_idx on public.exercise_logs (user_id, performed_at desc);
alter table public.exercise_logs enable row level security;

drop policy if exists "read own exercise logs" on public.exercise_logs;
drop policy if exists "insert own exercise logs" on public.exercise_logs;
drop policy if exists "delete own exercise logs" on public.exercise_logs;

create policy "read own exercise logs" on public.exercise_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own exercise logs" on public.exercise_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "delete own exercise logs" on public.exercise_logs for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, delete on public.exercise_logs to authenticated;
revoke all on public.exercise_logs from anon;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'en' check (language in ('en','hi')),
  target_low integer not null default 70 check (target_low between 20 and 300),
  target_high integer not null default 180 check (target_high between 40 and 600),
  unit text not null default 'mg/dL' check (unit in ('mg/dL','mmol/L')),
  sheet_id text,
  updated_at timestamptz not null default now()
);

-- Migration for existing databases
alter table public.user_settings add column if not exists unit text not null default 'mg/dL';

alter table public.user_settings enable row level security;

drop policy if exists "read own settings" on public.user_settings;
drop policy if exists "insert own settings" on public.user_settings;
drop policy if exists "update own settings" on public.user_settings;

create policy "read own settings" on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own settings" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own settings" on public.user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_settings to authenticated;
revoke all on public.user_settings from anon;
