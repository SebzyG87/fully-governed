-- QR Physical-to-Digital Bridge
-- Each row maps a unique QR code slug to a piece of digital content
create table if not exists fg_qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_slug text not null unique, -- random short code used in /unlock/:code URL
  content_type text not null check (content_type in ('track','video','message','exclusive')),
  content_title text not null,
  content_description text,
  file_url text, -- Supabase Storage URL or external link
  track_id uuid references music_tracks(id) on delete set null,
  scan_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table fg_qr_codes enable row level security;

-- Owners can manage their own codes
create policy "fg_qr_codes_owner" on fg_qr_codes
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Anyone can read (needed for public unlock page — no auth required to scan)
create policy "fg_qr_codes_public_read" on fg_qr_codes
  for select using (true);

create index if not exists idx_fg_qr_codes_slug on fg_qr_codes(code_slug);
create index if not exists idx_fg_qr_codes_user on fg_qr_codes(user_id);
