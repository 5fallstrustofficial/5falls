-- ============================================================================
-- 01. Member Profiles, User Roles & Custom Roles
-- ============================================================================

-- Member Profiles (stores registration details; private PII protected by RLS)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  district text,
  payment_completed boolean not null default false,
  payment_reference text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists is_verified boolean not null default false;

create index if not exists profiles_email_idx on public.profiles (email);

alter table public.profiles enable row level security;

-- User Roles (isolated from profiles & user_metadata to prevent self-escalation)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'volunteer',
  created_at timestamptz not null default now()
);

alter table public.user_roles drop constraint if exists user_roles_role_check;

alter table public.user_roles enable row level security;

-- Custom Roles & Permissions Matrix (used by Access Control tab)
create table if not exists public.custom_roles (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  is_system boolean not null default false,
  is_locked boolean not null default false,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_roles enable row level security;
