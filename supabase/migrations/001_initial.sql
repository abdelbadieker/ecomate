-- ============================================================
-- EcoMate — Complete Database Schema
-- Run this in Supabase SQL Editor or via CLI
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES (linked to auth.users) ──────────────────────────
create table if not exists public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  full_name    text,
  business_name text,
  phone        text,
  avatar_url   text,
  role         text not null default 'client' check (role in ('client','admin')),
  plan         text not null default 'starter' check (plan in ('starter','growth','business','none')),
  plan_status  text not null default 'trial' check (plan_status in ('trial','active','expired','cancelled')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── PLANS ────────────────────────────────────────────────────
create table if not exists public.plans (
  id          uuid default uuid_generate_v4() primary key,
  slug        text unique not null,
  name        text not null,
  price_da    integer not null default 0,
  description text,
  features    jsonb default '[]',
  is_popular  boolean default false,
  is_active   boolean default true,
  sort_order  integer default 0
);

insert into public.plans (slug, name, price_da, description, features, is_popular, sort_order) values
('starter','Starter', 0, '14-day free trial', '["AI Chatbot (basic)","Up to 50 orders/month","1 social channel","Product catalog (20 items)","Google Sheets export"]', false, 1),
('growth','Growth', 4900, 'Full AI system — monthly', '["Full AI Sales System","Unlimited orders & products","All social platforms","Delivery auto-tracking","CRM & customer database","AI Growth Agent","Analytics dashboard"]', true, 2),
('business','Business', 0, 'Custom — contact us', '["Everything in Growth","Advanced AI Growth Agent","Custom lead targeting","Priority deliverability","Dedicated account manager","Custom integrations"]', false, 3)
on conflict (slug) do nothing;

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists public.orders (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  order_number  text unique not null,
  customer_name text not null,
  customer_phone text,
  wilaya        text,
  address       text,
  items         jsonb default '[]',
  total_da      integer not null default 0,
  status        text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  payment_method text default 'cod',
  tracking_code text,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.orders enable row level security;
create policy "Users see own orders" on public.orders for all using (auth.uid() = user_id);
create policy "Admins see all orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── PRODUCTS ─────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  description text,
  price_da    integer not null default 0,
  stock       integer default 0,
  category    text,
  images      jsonb default '[]',
  variants    jsonb default '[]',
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.products enable row level security;
create policy "Users see own products" on public.products for all using (auth.uid() = user_id);

-- ── CRM CUSTOMERS ─────────────────────────────────────────────
create table if not exists public.crm_customers (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  full_name     text not null,
  phone         text,
  wilaya        text,
  total_orders  integer default 0,
  total_spent_da integer default 0,
  tags          text[] default '{}',
  notes         text,
  last_order_at timestamptz,
  created_at    timestamptz default now()
);

alter table public.crm_customers enable row level security;
create policy "Users see own customers" on public.crm_customers for all using (auth.uid() = user_id);

-- ── SUBSCRIPTIONS (checkout tracking) ─────────────────────────
create table if not exists public.subscriptions (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  plan_slug       text references public.plans(slug) not null,
  status          text not null default 'pending' check (status in ('pending','active','cancelled','expired')),
  payment_method  text default 'manual',
  payment_ref     text,
  amount_da       integer default 0,
  starts_at       timestamptz default now(),
  ends_at         timestamptz,
  checkout_completed boolean default false,
  created_at      timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users see own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);
create policy "Admins see all subscriptions" on public.subscriptions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── REVIEWS ─────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  reviewer_name text not null,
  business_name text,
  rating      integer not null check (rating between 1 and 5),
  content     text not null,
  plan_used   text,
  is_approved boolean default false,
  is_featured boolean default false,
  created_at  timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "Anyone can read approved reviews" on public.reviews for select using (is_approved = true);
create policy "Users can insert own review" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Admins manage reviews" on public.reviews for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── PARTNERS ─────────────────────────────────────────────────
create table if not exists public.partners (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  logo        text default '🤝',
  category    text,
  website_url text,
  row_num     integer default 1 check (row_num in (1,2)),
  is_live     boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

alter table public.partners enable row level security;
create policy "Anyone can read live partners" on public.partners for select using (is_live = true);
create policy "Admins manage partners" on public.partners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Insert default placeholder partners
insert into public.partners (name, logo, category, row_num, is_live, sort_order) values
('Delivery Partner','🚚','Logistics',1,false,1),
('Banking Partner','🏦','Payments',1,false,2),
('Telecom Partner','📱','Connectivity',1,false,3),
('Commerce Partner','🏪','E-commerce',1,false,4),
('Incubator Partner','🏛️','Institutional',1,false,5),
('Cloud Partner','☁️','Infrastructure',1,false,6),
('Reseller Partner','🤝','Distribution',1,false,7),
('Fulfillment Partner','📦','COD & Shipping',1,false,8),
('University Partner','🎓','Research',2,false,1),
('Media Partner','📡','Marketing',2,false,2),
('Security Partner','🔐','Compliance',2,false,3),
('Analytics Partner','📊','Data Intel',2,false,4),
('Marketplace Partner','🛒','Sales Channel',2,false,5),
('Gov Partner','🌍','Public Sector',2,false,6),
('Fintech Partner','💳','Digital Pay',2,false,7),
('AI Tech Partner','🤖','Technology',2,false,8)
on conflict do nothing;

-- ── SERVICES (admin managed) ──────────────────────────────────
create table if not exists public.services (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  description text,
  icon        text default '⚙️',
  plan_required text default 'starter',
  is_active   boolean default true,
  sort_order  integer default 0
);

-- RLS for services
alter table public.services enable row level security;
create policy "Anyone can read active services" on public.services for select using (is_active = true);
create policy "Admins manage services" on public.services for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

insert into public.services (name, description, icon, plan_required, sort_order) values
('AI Sales Chatbot','AI-powered chatbot for FB/IG/WA','🤖','starter',1),
('Order Management','Full COD order tracking system','📦','starter',2),
('Product Catalog','Sync products across all channels','🛍️','starter',3),
('CRM','Customer relationship management','👥','growth',4),
('AI Growth Agent','Automated B2B lead generation','🎯','growth',5),
('Analytics Dashboard','Revenue and performance insights','📊','growth',6),
('Delivery Integration','58 wilayas auto-tracking','🚚','starter',7)
on conflict do nothing;

-- ── TRIGGER: auto-create profile on signup ────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, business_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── TRIGGER: update updated_at ────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.update_updated_at();
create trigger products_updated_at before update on public.products for each row execute procedure public.update_updated_at();
