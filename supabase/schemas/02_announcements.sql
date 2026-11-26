-- ============================================================================
-- 02. Announcements & Comments
-- ============================================================================

create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text not null,
  description text not null,
  is_pinned boolean not null default false,
  send_email boolean not null default false,
  email_sent_count integer not null default 0,
  email_status text not null default 'not_requested'
    check (email_status in ('not_requested', 'sent', 'preview', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_user_id_idx
  on public.announcements (user_id);

create index if not exists announcements_pinned_created_idx
  on public.announcements (is_pinned desc, created_at desc);

alter table public.announcements enable row level security;

create table if not exists public.announcement_comments (
  id bigint generated always as identity primary key,
  announcement_id bigint not null references public.announcements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_role text not null default 'member' check (author_role in ('member', 'admin')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists announcement_comments_announcement_id_idx
  on public.announcement_comments (announcement_id, created_at asc);

create index if not exists announcement_comments_user_id_idx
  on public.announcement_comments (user_id);

alter table public.announcement_comments enable row level security;
