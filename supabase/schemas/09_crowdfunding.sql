-- ============================================================================
-- 09. Crowdfunding Campaigns & Media Storage Bucket
-- ============================================================================

create table if not exists public.crowdfunding_campaigns (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  person_name text not null,
  title text not null,
  story text not null,
  location text,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  raised_amount numeric(12, 2) not null default 0 check (raised_amount >= 0),
  status text not null default 'active'
    check (status in ('active', 'completed', 'paused')),
  upi_id text,
  contact_phone text,
  images jsonb not null default '[]'::jsonb,
  video jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crowdfunding_campaigns_sort_idx
  on public.crowdfunding_campaigns (sort_order asc, created_at desc);

alter table public.crowdfunding_campaigns enable row level security;

-- Public read access so /crowdfunding and /dashboard/crowdfunding can view campaigns
drop policy if exists "crowdfunding_select_public" on public.crowdfunding_campaigns;
create policy "crowdfunding_select_public"
  on public.crowdfunding_campaigns for select
  to anon, authenticated
  using (true);

-- Admin-only writes
drop policy if exists "crowdfunding_insert_admin" on public.crowdfunding_campaigns;
create policy "crowdfunding_insert_admin"
  on public.crowdfunding_campaigns for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "crowdfunding_update_admin" on public.crowdfunding_campaigns;
create policy "crowdfunding_update_admin"
  on public.crowdfunding_campaigns for update
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

drop policy if exists "crowdfunding_delete_admin" on public.crowdfunding_campaigns;
create policy "crowdfunding_delete_admin"
  on public.crowdfunding_campaigns for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

-- Explicit Grants
grant select on public.crowdfunding_campaigns to anon, authenticated;
grant insert, update, delete on public.crowdfunding_campaigns to authenticated;
grant all privileges on public.crowdfunding_campaigns to service_role;
grant all privileges on all sequences in schema public to authenticated, service_role;

-- Public Storage Bucket for Crowdfunding Photos & Videos
insert into storage.buckets (id, name, public)
values ('crowdfunding-media', 'crowdfunding-media', true)
on conflict (id) do update set public = true;

drop policy if exists "crowdfunding_media_public_read" on storage.objects;
create policy "crowdfunding_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'crowdfunding-media');

drop policy if exists "crowdfunding_media_admin_insert" on storage.objects;
create policy "crowdfunding_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'crowdfunding-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "crowdfunding_media_admin_delete" on storage.objects;
create policy "crowdfunding_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'crowdfunding-media'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );
