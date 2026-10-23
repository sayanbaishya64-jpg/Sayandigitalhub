-- SAYAN DIGITAL HUB SUPABASE DATABASE SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor

-- 1. Profiles Table with roles: 'Super Admin', 'Admin', 'Customer'
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

-- Backward compatibility view
create or replace view public.user_profiles as
  select * from public.profiles;

-- 2. Categories Table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bengali_name text,
  slug text unique not null,
  description text,
  icon text,
  content_type text default 'all'
);

-- 3. Posts Table (Jobs, Scholarships, Exams, Admit Cards, Results, Admissions, News)
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
  category_id uuid references public.categories(id),
  featured_image text,
  author_id uuid references public.user_profiles(id),
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

-- 4. Study Materials Table
create table if not exists public.study_materials (
  id uuid default gen_random_uuid() primary key,
  topic_name text not null,
  bengali_topic_name text,
  subject text not null,
  short_description text,
  bengali_description text,
  detailed_description text,
  class_level text,
  semester text,
  university text,
  examination text,
  author text,
  language text default 'English',
  file_url text not null,
  file_name text,
  file_type text default 'drive',
  access_permission text default 'public' check (access_permission in ('public', 'registered', 'restricted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Digital Services Table
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bengali_name text,
  category text not null,
  short_description text,
  bengali_description text,
  detailed_description text,
  icon text,
  eligibility text,
  required_documents text[],
  process text,
  charges text,
  processing_time text,
  availability boolean default true,
  booking_required boolean default true
);

-- 6. Appointments Table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references public.services(id),
  service_name text not null,
  customer_id uuid,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  date text not null,
  time_slot text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Audit Logs Table
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  user_id text,
  user_email text,
  timestamp text not null,
  details text
);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.posts enable row level security;
alter table public.categories enable row level security;
alter table public.study_materials enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.audit_logs enable row level security;

-- Basic RLS Policies
create policy "Public posts are viewable by everyone" on public.posts for select using (status = 'published');
create policy "Public categories are viewable by everyone" on public.categories for select using (true);
create policy "Public study materials viewable if public access" on public.study_materials for select using (access_permission = 'public');
create policy "Public services viewable by everyone" on public.services for select using (true);
