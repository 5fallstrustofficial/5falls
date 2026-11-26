-- ============================================================================
-- 08. Team Members & Media Storage Bucket
-- ============================================================================

create table if not exists public.team_members (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role_title text,
  description text not null,
  image_url text,
  socials jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_members_sort_idx
  on public.team_members (sort_order asc, created_at asc);

alter table public.team_members enable row level security;

-- Public read access so /about and /dashboard/team can view team members
drop policy if exists "team_members_select_public" on public.team_members;
create policy "team_members_select_public"
  on public.team_members for select
  to anon, authenticated
  using (true);

-- Admin-only writes
drop policy if exists "team_members_insert_admin" on public.team_members;
create policy "team_members_insert_admin"
  on public.team_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "team_members_update_admin" on public.team_members;
create policy "team_members_update_admin"
  on public.team_members for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "team_members_delete_admin" on public.team_members;
create policy "team_members_delete_admin"
  on public.team_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

-- Explicit Grants
grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated;
grant all privileges on public.team_members to service_role;
grant all privileges on all sequences in schema public to authenticated, service_role;

-- Public Storage Bucket for Team Member Photos
insert into storage.buckets (id, name, public)
values ('team-media', 'team-media', true)
on conflict (id) do update set public = true;

drop policy if exists "team_media_public_read" on storage.objects;
create policy "team_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'team-media');

drop policy if exists "team_media_admin_insert" on storage.objects;
create policy "team_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'team-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "team_media_admin_delete" on storage.objects;
create policy "team_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'team-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );
