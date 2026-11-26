-- ============================================================================
-- 07. Media Gallery & Storage Bucket
-- ============================================================================

create table if not exists public.gallery_items (
  id bigint generated always as identity primary key,
  slug text unique,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('image', 'video')),
  src text not null,
  poster text,
  title text not null,
  category text not null default 'lake'
    check (category in ('videos', 'lake', 'events', 'work')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_sort_created_idx
  on public.gallery_items (sort_order asc, created_at desc);

alter table public.gallery_items enable row level security;

-- Public read access for /gallery
drop policy if exists "gallery_items_select_public" on public.gallery_items;
create policy "gallery_items_select_public"
  on public.gallery_items for select
  to anon, authenticated
  using (true);

-- Admin-only writes
drop policy if exists "gallery_items_insert_admin" on public.gallery_items;
create policy "gallery_items_insert_admin"
  on public.gallery_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "gallery_items_update_admin" on public.gallery_items;
create policy "gallery_items_update_admin"
  on public.gallery_items for update
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

drop policy if exists "gallery_items_delete_admin" on public.gallery_items;
create policy "gallery_items_delete_admin"
  on public.gallery_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

-- Explicit Grants
grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;
grant all privileges on public.gallery_items to service_role;
grant all privileges on all sequences in schema public to authenticated, service_role;

-- Public Storage Bucket for Gallery Photos & Videos
insert into storage.buckets (id, name, public)
values ('gallery-media', 'gallery-media', true)
on conflict (id) do update set public = true;

drop policy if exists "gallery_media_public_read" on storage.objects;
create policy "gallery_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery-media');

drop policy if exists "gallery_media_admin_insert" on storage.objects;
create policy "gallery_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "gallery_media_admin_update" on storage.objects;
create policy "gallery_media_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'gallery-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "gallery_media_admin_delete" on storage.objects;
create policy "gallery_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );
