# Supabase Database Schema (`supabase/schemas/`)

The PostgreSQL schema for **Five Falls Women's Welfare Trust** is factorized into ordered, idempotent modules:

| Order | File | Purpose |
| :--- | :--- | :--- |
| 1 | [01_profiles_and_roles.sql](schemas/01_profiles_and_roles.sql) | `profiles`, `user_roles`, and `custom_roles` tables + indexes + RLS enabled |
| 2 | [02_announcements.sql](schemas/02_announcements.sql) | `announcements` and `announcement_comments` tables + indexes + RLS enabled |
| 3 | [03_rls_policies.sql](schemas/03_rls_policies.sql) | Row Level Security policies across all tables |
| 4 | [04_grants.sql](schemas/04_grants.sql) | Least-privilege `GRANT` statements for `authenticated` and `service_role` |
| 5 | [05_triggers_and_seed.sql](schemas/05_triggers_and_seed.sql) | Built-in roles seed, `handle_new_user()` signup trigger, backfill & admin promotion |
| 6 | [06_field_updates.sql](schemas/06_field_updates.sql) | `field_updates` table, public read / admin write RLS, and `updates-media` storage bucket |
| 7 | [07_gallery.sql](schemas/07_gallery.sql) | `gallery_items` table, public read / admin write RLS, and `gallery-media` storage bucket |
| 8 | [08_team.sql](schemas/08_team.sql) | `team_members` table, public read / admin write RLS, and `team-media` storage bucket |
| 9 | [09_crowdfunding.sql](schemas/09_crowdfunding.sql) | `crowdfunding_campaigns` table, public read / admin write RLS, and `crowdfunding-media` storage bucket |

## Running in Supabase SQL Editor
Run files `01` through `09` in numeric order inside **Supabase Dashboard → SQL Editor** (each file is idempotent and safe to re-run).
