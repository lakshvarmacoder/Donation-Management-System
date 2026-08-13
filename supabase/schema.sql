-- Donor Wall Demo Platform Schema
-- Run this once in the Supabase SQL Editor before adding your application credentials.

create extension if not exists "pgcrypto";

create type public.profile_role as enum ('admin');
create type public.donation_source as enum ('online', 'offline');
create type public.donation_status as enum ('pending', 'completed', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.profile_role not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null check (char_length(donor_name) between 2 and 120),
  donor_email text not null check (donor_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  donor_phone text,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  source public.donation_source not null,
  payment_method text,
  gateway_order_id text unique,
  gateway_payment_id text unique,
  github_username text,
  avatar_url text,
  status public.donation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null unique references public.donations(id) on delete cascade,
  receipt_number text not null unique,
  pdf_url text,
  issued_at timestamptz not null default now()
);

create index donations_donor_email_idx on public.donations(lower(donor_email));
create index donations_status_created_at_idx on public.donations(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger donations_set_updated_at before update on public.donations
for each row execute function public.set_updated_at();

create or replace function public.issue_receipt_for_completed_donation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and (tg_op = 'INSERT' or old.status is distinct from 'completed') then
    insert into public.receipts (donation_id, receipt_number)
    values (new.id, 'SF-' || to_char(current_date, 'YYYYMMDD') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 8)))
    on conflict (donation_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger donations_issue_receipt after insert or update of status on public.donations
for each row execute function public.issue_receipt_for_completed_donation();

create view public.donor_summaries as
select
  lower(donor_email) as donor_email,
  max(donor_name) as donor_name,
  max(donor_phone) as donor_phone,
  count(*) filter (where status = 'completed') as completed_donations,
  coalesce(sum(amount) filter (where status = 'completed'), 0) as total_donated,
  max(created_at) filter (where status = 'completed') as last_donated_at
from public.donations
group by lower(donor_email);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.donations enable row level security;
alter table public.receipts enable row level security;

create policy "users can view their profile" on public.profiles for select using (id = auth.uid());
create policy "admins can manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins can manage donations" on public.donations for all using (public.is_admin()) with check (public.is_admin());
create policy "public can view completed donations for wall" on public.donations for select using (status = 'completed');
create policy "admins can manage receipts" on public.receipts for all using (public.is_admin()) with check (public.is_admin());

revoke all on public.donations, public.receipts, public.donor_summaries from anon, authenticated;
grant select (id, donor_name, amount, avatar_url, github_username, created_at) on public.donations to anon, authenticated;
