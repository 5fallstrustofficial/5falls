-- ============================================================================
-- 04. Explicit Grants (Least Privilege for Data API & Service Role)
-- ============================================================================

grant usage on schema public to authenticated, service_role;

grant select, insert, update on public.profiles to authenticated;
grant select on public.user_roles, public.custom_roles to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, delete on public.announcement_comments to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant all privileges on
  public.profiles,
  public.user_roles,
  public.custom_roles,
  public.announcements,
  public.announcement_comments
to service_role;

grant all privileges on all sequences in schema public to service_role;
