-- ============================================================================
-- SKINIQ SUPABASE SETUP SCRIPT
-- Copy and paste each section into Supabase SQL Editor
-- Link: https://app.supabase.com/project/nmbsozneyyptwfwrcidd/sql/new
-- ============================================================================

-- ============================================================================
-- SCRIPT 1: Create profiles table
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- SCRIPT 2: Create analyses table
-- ============================================================================
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  overall_score decimal(4,2) not null,
  grade text not null,
  skin_type text,
  fitzpatrick_estimate text,
  image_quality text,
  acne_score decimal(4,2),
  scarring_score decimal(4,2),
  pigmentation_score decimal(4,2),
  open_pores_score decimal(4,2),
  redness_score decimal(4,2),
  inflammation_score decimal(4,2),
  puffiness_score decimal(4,2),
  hydration_score decimal(4,2),
  primary_concerns jsonb,
  positive_indicators jsonb,
  recommendations jsonb,
  clinical_summary text,
  clinical_flags jsonb,
  urgent_consultation boolean default false,
  qa_responses jsonb,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- SCRIPT 3: Enable Row Level Security (RLS)
-- ============================================================================
alter table profiles enable row level security;
alter table analyses enable row level security;

-- Users can only see their own profile
create policy "Own profile only"
on profiles for all to authenticated
using (auth.uid() = id);

-- Users can only see their own analyses
create policy "Own analyses only"
on analyses for all to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- SCRIPT 4: Auto-create profile on signup (Trigger + Function)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- VERIFY: Run this query to check if tables were created
-- ============================================================================
select
  tablename as table_name
from pg_tables
where schemaname = 'public'
order by tablename;
