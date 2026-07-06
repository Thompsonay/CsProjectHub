-- =============================================================================
-- CSProjectHub — Phase 1 schema
-- Run this whole file once in the Supabase SQL Editor (see chat walkthrough
-- for exactly where to paste it). It is safe to re-run: every statement uses
-- "if not exists" / "or replace" / "drop ... if exists" so re-running won't
-- error on a partially-applied schema, though re-running won't undo data.
-- =============================================================================

-- pgcrypto gives us gen_random_uuid() for default primary key values.
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------

-- profiles: one row per user, extends Supabase's built-in auth.users table.
-- A trigger (defined below) creates this row automatically on signup.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  full_name   text,
  institution text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

-- user_roles: one row per user, defaults to 'user'. Promote someone to
-- 'moderator' or 'admin' by updating their row (see walkthrough for Phase 1
-- — you'll manually set yourself to 'admin' after your first signup).
create table if not exists public.user_roles (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  role       text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz not null default now()
);

-- projects: the core table — every submitted final-year project.
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles (id) on delete cascade,
  title          text not null,
  description    text,
  language       text,
  tech_stack     text[] not null default '{}',
  topic          text,
  institution    text,
  year           int,
  repo_url       text,
  demo_url       text,
  screenshot_url text,
  -- Submissions go live immediately — no moderator approval step. 'pending'
  -- and 'rejected' remain valid values only so the moderation dashboard
  -- keeps working if it's ever turned back on.
  status         text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  forked_from    uuid references public.projects (id) on delete set null,
  view_count     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- comments: threaded discussion on a project (flat, no nesting for now).
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- votes: one upvote per user per project.
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

-- bookmarks: "save for later", one per user per project.
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

-- reports: flags raised against a project for moderator review.
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now()
);

-- Existing databases created before submissions auto-approved: bring the
-- column default in line, and surface anything still stuck in 'pending'.
alter table public.projects alter column status set default 'approved';
update public.projects set status = 'approved' where status = 'pending';

-- -----------------------------------------------------------------------------
-- INDEXES
-- Speed up the lookups Phase 2's browse/search page will do most often.
-- -----------------------------------------------------------------------------
create index if not exists projects_status_idx      on public.projects (status);
create index if not exists projects_author_id_idx    on public.projects (author_id);
create index if not exists projects_institution_idx  on public.projects (institution);
create index if not exists projects_language_idx     on public.projects (language);
create index if not exists projects_forked_from_idx  on public.projects (forked_from);
-- GIN index so .contains('tech_stack', [...]) queries (Phase 2 search) are fast.
create index if not exists projects_tech_stack_idx   on public.projects using gin (tech_stack);

create index if not exists comments_project_id_idx   on public.comments (project_id);
create index if not exists votes_project_id_idx      on public.votes (project_id);
create index if not exists bookmarks_project_id_idx  on public.bookmarks (project_id);
create index if not exists reports_project_id_idx    on public.reports (project_id);

-- -----------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- Keep projects.updated_at current automatically on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- has_role: helper used inside RLS policies to check a user's role.
-- It's SECURITY DEFINER so it can read user_roles even though the policy
-- calling it is evaluated for a less-privileged user — this also avoids the
-- infinite-recursion problem you'd get from a policy on user_roles querying
-- user_roles directly.
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- handle_new_user: fires after Supabase Auth creates a row in auth.users
-- (i.e. on every signup, email/password or Google). It creates the matching
-- profiles row and a default 'user' role row, so the rest of the app can
-- always assume a profile exists for a logged-in user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    -- Derive a starting username from the email, with a short random suffix
    -- so two people with the same email prefix don't collide. Users can
    -- change this later from My Profile (Phase 3).
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.user_roles  enable row level security;
alter table public.projects    enable row level security;
alter table public.comments    enable row level security;
alter table public.votes       enable row level security;
alter table public.bookmarks   enable row level security;
alter table public.reports     enable row level security;

-- profiles: public read; users update only their own.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_roles: users read own; admins manage (read/write) all rows.
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select using (auth.uid() = user_id);

drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin" on public.user_roles
  for select using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin_manage" on public.user_roles;
create policy "user_roles_admin_manage" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- projects: public read of approved projects, or your own (any status);
-- insert your own, always forced to status='approved' (submissions go live
-- immediately); update/delete your own; moderators/admins can update any
-- project (e.g. to take one down).
drop policy if exists "projects_select_approved_or_own" on public.projects;
create policy "projects_select_approved_or_own" on public.projects
  for select using (status = 'approved' or author_id = auth.uid());

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (author_id = auth.uid() and status = 'approved');

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "projects_update_moderator" on public.projects;
create policy "projects_update_moderator" on public.projects
  for update
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'moderator'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'moderator'));

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (author_id = auth.uid());

-- comments: public read; authenticated users insert/delete their own.
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments
  for select using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (author_id = auth.uid());

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (author_id = auth.uid());

-- votes: public read; authenticated users insert/delete their own.
drop policy if exists "votes_select_all" on public.votes;
create policy "votes_select_all" on public.votes
  for select using (true);

drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own" on public.votes
  for insert with check (user_id = auth.uid());

drop policy if exists "votes_delete_own" on public.votes;
create policy "votes_delete_own" on public.votes
  for delete using (user_id = auth.uid());

-- bookmarks: public read; authenticated users insert/delete their own.
drop policy if exists "bookmarks_select_all" on public.bookmarks;
create policy "bookmarks_select_all" on public.bookmarks
  for select using (true);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (user_id = auth.uid());

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (user_id = auth.uid());

-- reports: authenticated users insert their own; moderators/admins read
-- and resolve (update status).
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists "reports_select_moderator" on public.reports;
create policy "reports_select_moderator" on public.reports
  for select using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'moderator'));

drop policy if exists "reports_update_moderator" on public.reports;
create policy "reports_update_moderator" on public.reports
  for update
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'moderator'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'moderator'));
