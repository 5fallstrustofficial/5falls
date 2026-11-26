-- ============================================================================
-- 05. Auth Signup Trigger, Default Role Seeds & Admin Promotion
-- ============================================================================

-- Seed built-in roles (Admin, Member, Volunteer)
insert into public.custom_roles (name, slug, description, is_system, is_locked, permissions)
values
  (
    'Admin',
    'admin',
    'Full access to everything. Locked.',
    true,
    true,
    '{"announcements":{"view":true,"create":true,"edit":true,"delete":true,"publish":true,"send_email":true},"people":{"view":true,"create":true,"edit":true,"delete":true,"bulk_upload":true},"verification":{"view":true,"verify":true,"edit":true},"access_control":{"view":true,"create":true,"edit":true,"delete":true}}'::jsonb
  ),
  (
    'Member',
    'member',
    'Paid Trust member. Can view announcements and participate in discussions.',
    true,
    false,
    '{"announcements":{"view":true},"people":{},"verification":{},"access_control":{}}'::jsonb
  ),
  (
    'Volunteer',
    'volunteer',
    'Registered volunteer (payment pending). Can view announcements and comment.',
    true,
    false,
    '{"announcements":{"view":true},"people":{},"verification":{},"access_control":{}}'::jsonb
  )
on conflict (slug) do nothing;

-- Auto-create profile & volunteer role on new auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_phone text;
  v_district text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'Member'), '@', 1)
  );
  v_phone := nullif(trim(new.raw_user_meta_data ->> 'phone'), '');
  v_district := nullif(trim(new.raw_user_meta_data ->> 'district'), '');

  insert into public.profiles (id, email, full_name, phone, district)
  values (
    new.id,
    coalesce(new.email, ''),
    v_name,
    v_phone,
    v_district
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    district = coalesce(public.profiles.district, excluded.district),
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'volunteer')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles & default roles for existing auth users
insert into public.profiles (id, email, full_name, phone, district)
select
  id,
  coalesce(email, ''),
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(email, 'Member'), '@', 1)
  ),
  nullif(trim(raw_user_meta_data ->> 'phone'), ''),
  nullif(trim(raw_user_meta_data ->> 'district'), '')
from auth.users
on conflict (id) do update
set
  phone = coalesce(public.profiles.phone, excluded.phone),
  district = coalesce(public.profiles.district, excluded.district),
  updated_at = now();

insert into public.user_roles (user_id, role)
select id, 'volunteer' from auth.users
on conflict (user_id) do nothing;

-- Promote primary admin accounts (runs after backfill so admin role is preserved)
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users
where email in ('sanjayontech@gmail.com', 'fivefalls2001@gmail.com')
on conflict (user_id) do update set role = 'admin';
