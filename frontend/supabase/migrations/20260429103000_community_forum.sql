create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default 'Övrigt',
  image_url text,
  location text,
  price numeric,
  contact_info text,
  is_sold boolean not null default false,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.community_posts(id) on delete cascade,
  comment_id uuid references public.community_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null default 'like',
  created_at timestamptz not null default now(),
  constraint community_reactions_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  )
);

create unique index if not exists community_reactions_post_unique
  on public.community_reactions(post_id, user_id, reaction_type)
  where post_id is not null;

create unique index if not exists community_reactions_comment_unique
  on public.community_reactions(comment_id, user_id, reaction_type)
  where comment_id is not null;

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.community_posts(id) on delete cascade,
  comment_id uuid references public.community_comments(id) on delete cascade,
  reported_by uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint community_reports_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  )
);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_reports enable row level security;

create policy "Authenticated users can read community posts"
  on public.community_posts for select
  to authenticated
  using (true);

create policy "Authenticated users can create community posts"
  on public.community_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own community posts"
  on public.community_posts for update
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can delete own community posts"
  on public.community_posts for delete
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can read community comments"
  on public.community_comments for select
  to authenticated
  using (true);

create policy "Authenticated users can create community comments"
  on public.community_comments for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.community_posts p
      where p.id = post_id and p.is_locked = false
    )
  );

create policy "Users can update own community comments"
  on public.community_comments for update
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can delete own community comments"
  on public.community_comments for delete
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can read reactions"
  on public.community_reactions for select
  to authenticated
  using (true);

create policy "Authenticated users can create own reactions"
  on public.community_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.community_reactions for delete
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can create community reports"
  on public.community_reports for insert
  to authenticated
  with check (auth.uid() = reported_by);

create policy "Admins can read community reports"
  on public.community_reports for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update community reports"
  on public.community_reports for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values ('community-images', 'community-images', true)
on conflict (id) do update set public = true;

create policy "Authenticated users can upload community images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'community-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can read community images"
  on storage.objects for select
  using (bucket_id = 'community-images');

create policy "Users can update own community images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'community-images' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'community-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own community images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'community-images' and auth.uid()::text = (storage.foldername(name))[1]);
