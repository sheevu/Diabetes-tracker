
-- Run this in Supabase SQL Editor
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp default now()
);

create table glucose_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp default now(),
  glucose_value int not null,
  type text check (type in ('Fasting','Before Meal','After Meal','Bedtime','Exercise','Custom','उपवास','भोजन से पहले','भोजन के बाद')),
  carbs int,
  insulin numeric,
  notes text
);

alter table glucose_logs enable row level security;
alter table profiles enable row level security;

create policy "users can manage own logs" on glucose_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can manage own profile" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto create profile on signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure handle_new_user();
