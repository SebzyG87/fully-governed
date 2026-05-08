-- fg_loyalty_points: transaction history for the loyalty points system
create table if not exists fg_loyalty_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  points integer not null,
  reason text not null,
  source text not null, -- 'booking' | 'purchase' | 'referral' | 'checkin' | 'welcome'
  reference_id uuid, -- booking_id, order_id, etc.
  created_at timestamptz default now()
);

alter table fg_loyalty_points enable row level security;
create policy "Users see own points" on fg_loyalty_points for select using (user_id = auth.uid());
create policy "Users insert own points" on fg_loyalty_points for insert with check (user_id = auth.uid());

-- Index for fast user queries
create index if not exists idx_fg_loyalty_points_user_id on fg_loyalty_points(user_id);
create index if not exists idx_fg_loyalty_points_created_at on fg_loyalty_points(created_at desc);
