-- ============================================================================
-- 03. Row Level Security Policies
-- Optimized with (select auth.uid()) & explicit TO authenticated clauses
-- ============================================================================

-- Profiles: owner or admin can select; only owner can insert/update
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (
    (select auth.uid()) = id
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- User Roles: users can only read their own role; no client writes allowed
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Custom Roles: signed-in users can read role definitions; admins manage via service_role
drop policy if exists "custom_roles_select_authenticated" on public.custom_roles;
create policy "custom_roles_select_authenticated"
  on public.custom_roles for select
  to authenticated
  using (true);

-- Announcements: all signed-in members read; admins create/update/delete
drop policy if exists "announcements_select_authenticated" on public.announcements;
create policy "announcements_select_authenticated"
  on public.announcements for select
  to authenticated
  using (true);

drop policy if exists "announcements_insert_admin" on public.announcements;
create policy "announcements_insert_admin"
  on public.announcements for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

drop policy if exists "announcements_update_admin" on public.announcements;
create policy "announcements_update_admin"
  on public.announcements for update
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

drop policy if exists "announcements_delete_admin" on public.announcements;
create policy "announcements_delete_admin"
  on public.announcements for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );

-- Comments: all signed-in users read & post their own; owner or admin can delete
drop policy if exists "comments_select_authenticated" on public.announcement_comments;
create policy "comments_select_authenticated"
  on public.announcement_comments for select
  to authenticated
  using (true);

drop policy if exists "comments_insert_own" on public.announcement_comments;
create policy "comments_insert_own"
  on public.announcement_comments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "comments_delete_own_or_admin" on public.announcement_comments;
create policy "comments_delete_own_or_admin"
  on public.announcement_comments for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = (select auth.uid()) and ur.role = 'admin'
    )
  );
