-- ============================================================
-- Migration 002: Add Contact Info Settings
-- ============================================================

create table if not exists public.contact_settings (
  id uuid default uuid_generate_v4() primary key,
  sales_email text not null default 'sales@ecomate.dz',
  support_email text not null default 'support@ecomate.dz',
  sales_phone text not null default '+213 (0) 555 000 000',
  support_phone text not null default '+213 (0) 555 111 111',
  office_address text not null default 'Algiers, Algeria',
  updated_at timestamptz default now()
);

-- Ensure only one row exists (singleton pattern)
create unique index if not exists contact_settings_singleton_idx on public.contact_settings((true));

-- RLS
alter table public.contact_settings enable row level security;
create policy "Anyone can view contact settings" on public.contact_settings for select using (true);
create policy "Admins can update contact settings" on public.contact_settings for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert contact settings" on public.contact_settings for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Insert default row if empty
insert into public.contact_settings (sales_email, support_email) values ('sales@ecomate.dz', 'support@ecomate.dz') on conflict do nothing;
