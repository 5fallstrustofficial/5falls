-- ============================================================================
-- 06. Field Updates & Media Storage Bucket
-- ============================================================================

create table if not exists public.field_updates (
  id bigint generated always as identity primary key,
  slug text unique,
  user_id uuid references auth.users(id) on delete set null,
  date text not null,
  display_date text not null,
  title text not null,
  tamil_title text,
  description text not null,
  tamil_description text,
  category text not null default 'work',
  images jsonb not null default '[]'::jsonb,
  video jsonb,
  instagram_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists field_updates_date_idx
  on public.field_updates (date desc, created_at desc);

-- Allow custom admin-defined categories on existing tables
alter table public.field_updates
  drop constraint if exists field_updates_category_check;

alter table public.field_updates enable row level security;

-- Public read access so /, /updates, and /dashboard can view field updates
drop policy if exists "field_updates_select_public" on public.field_updates;
create policy "field_updates_select_public"
  on public.field_updates for select
  to anon, authenticated
  using (true);

-- Admin-only writes
drop policy if exists "field_updates_insert_admin" on public.field_updates;
create policy "field_updates_insert_admin"
  on public.field_updates for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "field_updates_update_admin" on public.field_updates;
create policy "field_updates_update_admin"
  on public.field_updates for update
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

drop policy if exists "field_updates_delete_admin" on public.field_updates;
create policy "field_updates_delete_admin"
  on public.field_updates for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

-- Explicit Grants
grant select on public.field_updates to anon, authenticated;
grant insert, update, delete on public.field_updates to authenticated;
grant all privileges on public.field_updates to service_role;
grant all privileges on all sequences in schema public to authenticated, service_role;

-- Public Storage Bucket for Field Update Photos & Videos
insert into storage.buckets (id, name, public)
values ('updates-media', 'updates-media', true)
on conflict (id) do update set public = true;

drop policy if exists "updates_media_public_read" on storage.objects;
create policy "updates_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'updates-media');

drop policy if exists "updates_media_admin_insert" on storage.objects;
create policy "updates_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'updates-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "updates_media_admin_update" on storage.objects;
create policy "updates_media_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'updates-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "updates_media_admin_delete" on storage.objects;
create policy "updates_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'updates-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );
