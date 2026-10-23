-- ==============================================================================
-- SAYAN DIGITAL HUB: SUPABASE 'profiles' TABLE & COMPREHENSIVE RLS POLICIES
-- Roles: 'Super Admin', 'Admin', 'Customer'
-- ==============================================================================

-- 1. Create enum/check constrained 'profiles' table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text not null default 'Customer' check (role in ('Super Admin', 'Admin', 'Customer', 'super_admin', 'admin', 'customer')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Backward compatibility view for 'user_profiles'
create or replace view public.user_profiles as
  select * from public.profiles;

-- 2. Helper Security Functions (SECURITY DEFINER to avoid RLS recursion)
create or replace function public.get_user_role(user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = user_id;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('Super Admin', 'Admin', 'super_admin', 'admin')
      and status = 'active'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('Super Admin', 'super_admin')
      and status = 'active'
  );
$$;

-- 3. Trigger: Automatically create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, status, phone, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    case 
      when lower(new.email) = 'sayanbaishya64@gmail.com' then 'Super Admin'
      else 'Customer'
    end,
    'active',
    new.raw_user_meta_data->>'phone',
    now(),
    now()
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Enable Row Level Security (RLS) on 'profiles'
alter table public.profiles enable row level security;

-- Drop any existing policies to prevent conflicts
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile details" on public.profiles;
drop policy if exists "Super Admins can manage all profiles and roles" on public.profiles;
drop policy if exists "Admins can update user status" on public.profiles;

-- RLS Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- RLS Policy: Admins and Super Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (public.is_admin());

-- RLS Policy: Users can update their own basic profile (name, phone, avatar) but NOT their role or status
create policy "Users can update own profile details"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

-- RLS Policy: Only Super Admins can insert, update roles, or delete user profiles
create policy "Super Admins can manage all profiles and roles"
  on public.profiles
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 5. Enable RLS on Supporting Administrative Tables

-- Posts Table RLS
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  bengali_title text,
  slug text unique not null,
  content_type text not null,
  summary text,
  bengali_summary text,
  content text,
  bengali_content text,
  category_id uuid,
  featured_image text,
  author_id uuid references public.profiles(id),
  status text default 'published' check (status in ('draft', 'pending', 'approved', 'scheduled', 'published', 'archived', 'rejected')),
  organization text,
  total_vacancies text,
  qualification text,
  age_limit text,
  application_fee text,
  last_date text,
  official_url text,
  apply_url text,
  amount text,
  exam_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone
);

alter table public.posts enable row level security;
drop policy if exists "Public can view published posts" on public.posts;
drop policy if exists "Admins can view all posts" on public.posts;
drop policy if exists "Admins can create and manage posts" on public.posts;

create policy "Public can view published posts"
  on public.posts for select
  using (status = 'published');

create policy "Admins can view all posts"
  on public.posts for select
  using (public.is_admin());

create policy "Admins can create and manage posts"
  on public.posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Content Templates Table RLS
create table if not exists public.content_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  content_type text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.content_templates enable row level security;
drop policy if exists "Admins can read and manage templates" on public.content_templates;
create policy "Admins can read and manage templates"
  on public.content_templates for all
  using (public.is_admin())
  with check (public.is_admin());

-- Appointments Table RLS
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  service_id text,
  service_name text not null,
  customer_id uuid references public.profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  date text not null,
  time_slot text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;
drop policy if exists "Customers can view their own appointments" on public.appointments;
drop policy if exists "Customers can book appointments" on public.appointments;
drop policy if exists "Admins can manage all appointments" on public.appointments;

create policy "Customers can view their own appointments"
  on public.appointments for select
  using (auth.uid() = customer_id or customer_email = (select email from public.profiles where id = auth.uid()));

create policy "Customers can book appointments"
  on public.appointments for insert
  with check (true);

create policy "Admins can manage all appointments"
  on public.appointments for all
  using (public.is_admin())
  with check (public.is_admin());

-- Audit Logs Table RLS
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  user_id text,
  user_email text,
  timestamp text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;
drop policy if exists "Admins can view audit logs" on public.audit_logs;
drop policy if exists "System can record audit logs" on public.audit_logs;

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

create policy "System can record audit logs"
  on public.audit_logs for insert
  with check (true);
