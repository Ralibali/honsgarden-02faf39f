create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications(user_id, created_at desc);

alter table public.user_notifications enable row level security;

create policy "Users can read own notifications"
  on public.user_notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.user_notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "System can create notifications via triggers"
  on public.user_notifications for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.notify_egg_sale_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  listing_title text;
begin
  select title into listing_title
  from public.public_egg_sale_listings
  where id = new.listing_id;

  insert into public.user_notifications(user_id, type, title, body, link)
  values (
    new.seller_user_id,
    'booking',
    'Ny bokningsförfrågan i Agdas Bod',
    coalesce(new.customer_name, 'En kund') || ' vill boka ' || coalesce(new.packs, 0)::text || ' karta/kartor' ||
      case when listing_title is not null then ' från ' || listing_title else '' end || '.',
    '/app/egg-sales'
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_egg_sale_booking on public.public_egg_sale_bookings;
create trigger trg_notify_egg_sale_booking
after insert on public.public_egg_sale_bookings
for each row execute function public.notify_egg_sale_booking();

create or replace function public.notify_community_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  post_title text;
begin
  select user_id, title into owner_id, post_title
  from public.community_posts
  where id = new.post_id;

  if owner_id is not null and owner_id <> new.user_id then
    insert into public.user_notifications(user_id, type, title, body, link)
    values (
      owner_id,
      'community_reply',
      'Nytt svar i Community',
      'Någon svarade på ditt inlägg' || case when post_title is not null then ': ' || post_title else '' end || '.',
      '/app/community'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_community_reply on public.community_comments;
create trigger trg_notify_community_reply
after insert on public.community_comments
for each row execute function public.notify_community_reply();
